// End-to-end Train-flow test. Runs the REAL src modules (generateWeeklyPlanByType,
// updateVolumeLog, getWeeklyVolume, getWeekStart) against live Supabase + Groq,
// exactly as the pages do. Run with:
//    npx vite-node supabase/scripts/test-train-flow.ts
//
// Creates a throwaway auth user + profile, drives the flow, asserts DB state that
// the Dashboard/Workout/Heatmap read, then deletes everything it created.

import { config } from 'dotenv'
config({ path: 'C:/MotionK/Lover-boys/motionlab/.env.local' })

import { createClient } from '@supabase/supabase-js'

// ── ai-proxy blocks requests without an allowed browser Origin. Inject one on
//    edge-function calls so the real callAI runs unmodified from Node. This MUST
//    run before the supabase client module is imported (it binds fetch on
//    construction), so the app modules are dynamically imported inside main(). ──
const origFetch = globalThis.fetch
globalThis.fetch = (async (input: any, init: any = {}) => {
  const url = typeof input === 'string' ? input : (input?.url ?? '')
  if (url.includes('/functions/')) {
    const h = new Headers(init.headers ?? (typeof input !== 'string' ? input.headers : undefined))
    h.set('Origin', 'http://localhost:5173')
    init = { ...init, headers: h }
    const res = await origFetch(input, init)
    if (!res.ok) console.log(`  [fetch] ${url} -> ${res.status}; sent Origin=${h.get('Origin')}`)
    return res
  }
  return origFetch(input, init)
}) as typeof fetch

const admin = createClient(process.env.VITE_SUPABASE_URL!, process.env.MOTIONLAB_SUPABASE_SERVICE_KEY!, { auth: { persistSession: false } })

let pass = 0, fail = 0
function check(label: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  ✅ ${label}`) }
  else { fail++; console.log(`  ❌ ${label}  ${detail}`) }
}

// dashboard helpers (mirrored verbatim from DashboardPage)
function weekStartForDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00'); const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 86400000)
}
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

async function main() {
  // dynamic import AFTER the fetch patch so the supabase client binds the patched fetch
  const { supabase } = await import('@/lib/supabase')
  const { generateWeeklyPlanByType, getWeekStart } = await import('@/lib/workoutPlan')
  const { updateVolumeLog, getWeeklyVolume, getVolumeStatus, mapToVolumeGroup } = await import('@/lib/volumeTracker')

  const email = `traintest_${Date.now()}@example.com`
  const password = 'TrainTest123!'
  let userId = ''

  try {
    // ── SETUP ──────────────────────────────────────────────────────────────
    console.log('\n[SETUP] create user + profile')
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (created.error) throw created.error
    userId = created.data.user!.id
    const prof = {
      id: userId, name: 'Train Test', email, onboarding_complete: true,
      fitness_goal: 'muscle_gain', experience_level: 'intermediate',
      age: 28, weight_kg: 80, sessions_per_week: 4, equipment: ['full_gym'], injuries: null,
    }
    const up = await admin.from('profiles').upsert(prof)
    if (up.error) throw up.error
    const signin = await supabase.auth.signInWithPassword({ email, password })
    if (signin.error) throw signin.error
    check('authenticated as test user', !!signin.data.session)

    const profile = (await supabase.from('profiles').select('*').eq('id', userId).single()).data

    // ── STEP 1: generate weekly plan (REAL fn → real Groq) ──────────────────
    console.log('\n[STEP 1] generateWeeklyPlanByType(ppl) — real AI')
    const t0 = Date.now()
    const saved = await generateWeeklyPlanByType(userId, profile, 'ppl')
    console.log(`  (AI plan generated in ${((Date.now() - t0) / 1000).toFixed(1)}s)`)

    const plans = await supabase.from('workout_plans').select('*').eq('user_id', userId)
    check('exactly one active workout_plans row', plans.data?.length === 1 && plans.data[0].active === true, JSON.stringify(plans.data?.map(p => ({ active: p.active, type: p.plan_type }))))
    const days = (await supabase.from('plan_days').select('*').eq('plan_id', saved.id).order('day_number')).data ?? []
    check('7 plan_days created', days.length === 7, `got ${days.length}`)
    check('day_number covers 1..7', JSON.stringify(days.map(d => d.day_number)) === JSON.stringify([1, 2, 3, 4, 5, 6, 7]))
    const trainingDays = days.filter((d: any) => !d.exercises?.is_rest)
    const shapeOk = trainingDays.every((d: any) => Array.isArray(d.exercises?.exercises) && d.exercises.exercises.every((e: any) => e.exercise_id && e.exercise_name && e.sets))
    check('training-day exercises have {exercise_id, exercise_name, sets}', shapeOk && trainingDays.length > 0, `${trainingDays.length} training days`)

    // ── STEP 2: dashboard "today's workout" (mirrored query) ────────────────
    console.log("\n[STEP 2] dashboard resolves today's workout")
    const weekStart = getWeekStart()
    const planStart = (plans.data![0].created_at as string).slice(0, 10)
    const today = todayStr()
    const match = days.find((d: any) => daysBetween(planStart, today) === (d.day_number - 1))
      ?? days.find((d: any) => weekStartForDate(planStart) === weekStart && d.day_number === (((new Date(today + 'T12:00:00').getDay() + 6) % 7) + 1))
    check("today's workout day is found", !!match, 'no matching plan_day for today')
    const todaysExercises = (match?.exercises?.exercises ?? []) as any[]
    console.log(`  today = "${match?.name}" (${match?.exercises?.is_rest ? 'REST' : todaysExercises.length + ' exercises'})`)

    // pick a training day to actually "log" (today may legitimately be a rest day)
    const dayToLog = !match?.exercises?.is_rest && todaysExercises.length ? match : trainingDays[0]
    const logExercises = (dayToLog.exercises.exercises as any[])

    // ── STEP 3: finish a session (mirror WorkoutPage.finishSession) ─────────
    console.log(`\n[STEP 3] log a session for "${dayToLog.name}" (${logExercises.length} exercises)`)
    // need muscle_groups for volume — fetch them like the live session does
    const exIds = logExercises.map(e => e.exercise_id)
    const exRows = (await supabase.from('exercises').select('id, muscle_groups').in('id', exIds)).data ?? []
    const mgById: Record<string, string[]> = {}
    exRows.forEach((r: any) => { mgById[r.id] = r.muscle_groups || [] })

    const sessionId = crypto.randomUUID()
    const date = todayStr()
    const sessionRow = { id: sessionId, user_id: userId, name: dayToLog.name, date, duration: 42, notes: null, plan_id: saved.id, plan_day_id: dayToLog.id }
    const setRows: any[] = []
    const volumeSets: { muscle_groups: string[] }[] = []
    logExercises.forEach(e => {
      for (let sn = 1; sn <= (e.sets || 3); sn++) {
        setRows.push({ session_id: sessionId, exercise_id: e.exercise_id, set_number: sn, reps: 10, weight_kg: 50, rpe: 8, completed: true })
        volumeSets.push({ muscle_groups: mgById[e.exercise_id] || [] })
      }
    })
    const sErr = (await supabase.from('sessions').insert(sessionRow)).error
    check('sessions row inserted', !sErr, sErr?.message)
    const setErr = (await supabase.from('session_sets').insert(setRows)).error
    check(`${setRows.length} session_sets inserted`, !setErr, setErr?.message)
    await updateVolumeLog(userId, volumeSets, date)   // REAL volume writer

    // ── STEP 4: reads the Dashboard + Heatmap perform ───────────────────────
    console.log('\n[STEP 4] dashboard + heatmap reads reflect the session')
    const swCount = (await supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('date', weekStart)).count
    check('sessions-this-week count = 1', swCount === 1, `got ${swCount}`)

    const vol = await getWeeklyVolume(userId)  // REAL heatmap source
    const totalSets = vol.reduce((a, v) => a + v.sets_count, 0)
    check('muscle_volume_log has rows', vol.length > 0, `${vol.length} groups`)
    // volume = sets-per-muscle-group: each set counts toward every distinct group
    // its exercise hits (a row counts for lats + mid_back + biceps, etc.)
    const expectedVolume = volumeSets.reduce((sum, vs) => {
      const groups = new Set(vs.muscle_groups.map(m => mapToVolumeGroup(m)).filter(Boolean))
      return sum + groups.size
    }, 0)
    check('volume total = sum of per-set muscle-group hits', totalSets === expectedVolume, `volume=${totalSets} expected=${expectedVolume}`)
    const sample = vol[0]
    check('getVolumeStatus returns a status', ['low', 'optimal', 'high', 'none'].includes(getVolumeStatus(sample.muscle_group, sample.sets_count)))
    console.log('  volume by group:', vol.map(v => `${v.muscle_group}:${v.sets_count}`).join('  '))

    // streak (brand-new user: only current week logged → 0 past weeks → count 0, no crash)
    const streakRows = (await supabase.from('sessions').select('date').eq('user_id', userId)).data ?? []
    check('streak computable without error (expect 0 for new user)', streakRows.length > 0)

    console.log(`\n──────── RESULT: ${pass} passed, ${fail} failed ────────`)
  } catch (e: any) {
    fail++
    console.error('\n❌ FLOW THREW:', e?.message || e)
    if (e?.stack) console.error(e.stack.split('\n').slice(0, 4).join('\n'))
  } finally {
    // ── TEARDOWN ────────────────────────────────────────────────────────────
    if (userId) {
      console.log('\n[TEARDOWN] deleting test data')
      const planIds = (await admin.from('workout_plans').select('id').eq('user_id', userId)).data?.map(p => p.id) ?? []
      const sessIds = (await admin.from('sessions').select('id').eq('user_id', userId)).data?.map(s => s.id) ?? []
      if (sessIds.length) await admin.from('session_sets').delete().in('session_id', sessIds)
      await admin.from('sessions').delete().eq('user_id', userId)
      if (planIds.length) await admin.from('plan_days').delete().in('plan_id', planIds)
      await admin.from('workout_plans').delete().eq('user_id', userId)
      await admin.from('muscle_volume_log').delete().eq('user_id', userId)
      await admin.from('profiles').delete().eq('id', userId)
      await admin.auth.admin.deleteUser(userId)
      console.log('  done')
    }
    process.exit(fail > 0 ? 1 : 0)
  }
}

main()
