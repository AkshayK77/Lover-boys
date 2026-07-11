import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dumbbell, Plus, Check, Search, X, Trophy, TimerReset, Square, Sparkles, ChevronDown, RefreshCw, Calendar } from 'lucide-react'
import { PillTag, NodeLine } from '@/components/ui/FuturisticElements'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { useWorkout } from '@/contexts/WorkoutContext'
import { supabase } from '@/lib/supabase'
import { getProgressionSuggestion } from '@/lib/progressiveOverload'
import { updateVolumeLog } from '@/lib/volumeTracker'
import { getWeekStart, generateWeeklyPlanByType, generateSessionFromPreferences } from '@/lib/workoutPlan'
import type { PlanDayJson, ProcessedExercise } from '@/lib/workoutPlan'
import { callAgent, parseAgentJSON } from '@/lib/ai'
import { saveOfflineSession, saveOfflineSet, getOfflineSets, getOfflineSessions, clearOfflineSet, clearOfflineSession } from '@/lib/offlineDb'
import ManualWorkoutLogger from '@/components/ManualWorkoutLogger'

const ACTIVE_SESSION_KEY = 'motionlab_active_session_v1'
const REST_SECONDS_DEFAULT = 90

const WEEKLY_PLAN_TYPES = [
  { id: 'ppl', name: 'Push Pull Legs', days: '6 days/wk', structure: 'Push · Pull · Legs · Push · Pull · Legs · Rest' },
  { id: 'ppl_ul', name: 'PPL + Upper Lower', days: '5 days/wk', structure: 'Push · Pull · Legs · Upper · Lower · Rest · Rest' },
  { id: 'bro', name: 'Bro Split', days: '6 days/wk', structure: 'Chest · Back · Shoulders · Arms · Legs · Full Body · Rest' },
  { id: 'full_body', name: 'Full Body', days: '4 days/wk', structure: 'Full Body · Rest · Full Body · Rest · Full Body · Rest · Full Body' },
]

const SPLIT_OPTIONS = ['Push', 'Pull', 'Legs', 'Upper Body', 'Full Body']
const MUSCLE_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves']
const FEELINGS = [
  { id: 'fresh', label: 'Fresh' },
  { id: 'normal', label: 'Normal' },
  { id: 'tired', label: 'Tired' },
]

interface ExerciseRow {
  id: string
  name: string
  muscle_groups: string[]
  is_compound: boolean | null
}

interface LoggedSet {
  setNumber: number
  reps: string
  weight: string
  rpe: string
  completed: boolean
}

interface SessionExercise {
  exercise: ExerciseRow
  sets: LoggedSet[]
  progression: { shouldIncrease: boolean; suggestedWeight: number | null; reason: string } | null
  note?: string | null
}

interface CompletionSummary {
  durationMinutes: number
  totalSets: number
  totalExercises: number
  prs: Array<{ name: string; oldMax: number; newMax: number }>
}

interface PlanDayRow {
  id: string
  day_number: number
  name: string | null
  exercises: PlanDayJson | null
}
interface WarmupExercise { exercise: string; sets: number; reps: string; notes: string }

function today() { return new Date().toISOString().split('T')[0] }
function fmtTime(secs: number) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}
function addDaysStr(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Card({ title, badge, children, className }: { title?: string; badge?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] p-5 flex flex-col ${className ?? ''}`} style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
      {title && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white/80 text-sm">{title}</h2>
          {badge && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: '#8a9c4a', background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.15)' }}>{badge}</span>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default function WorkoutPage() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const { triggerHeatmapRefresh, setActiveSessionExercises, workoutUpdate, setWorkoutUpdate } = useWorkout()
  const location = useLocation()
  const navigate = useNavigate()
  const autoStartedRef = useRef(false)

  // ── Mode A (plan) state ──
  const [plan, setPlan] = useState<{ id: string; name: string; created_at: string } | null>(null)
  const [planDays, setPlanDays] = useState<PlanDayRow[]>([])
  const [doneDayIds, setDoneDayIds] = useState<Set<string>>(new Set())
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [planLoading, setPlanLoading] = useState(true)

  const [showLogger, setShowLogger] = useState(false)
  const [showSplit, setShowSplit] = useState(false)
  const [selectedSplit, setSelectedSplit] = useState<string | null>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)

  const [showGen, setShowGen] = useState(false)
  const [genGroups, setGenGroups] = useState<string[]>([])
  const [genMinutes, setGenMinutes] = useState(45)
  const [genFeeling, setGenFeeling] = useState('normal')
  const [generatingSession, setGeneratingSession] = useState(false)

  // ── Mode B (active session) state ──
  const [sessionName, setSessionName] = useState('')
  const [active, setActive] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([])
  const [notes, setNotes] = useState('')
  const [activePlanDayId, setActivePlanDayId] = useState<string | null>(null)
  const [warmup, setWarmup] = useState<WarmupExercise[] | null>(null)
  const [warmupDismissed, setWarmupDismissed] = useState(false)

  const [picker, setPicker] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExerciseRow[]>([])
  const [searching, setSearching] = useState(false)

  const [restRemaining, setRestRemaining] = useState<number | null>(null)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [completion, setCompletion] = useState<CompletionSummary | null>(null)

  // ── Load the active weekly plan ──
  const loadPlan = useCallback(async () => {
    if (!user?.id) return
    setPlanLoading(true)
    const planRes = await supabase.from('workout_plans').select('id, name, created_at').eq('user_id', user.id).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle()
    const p = planRes.data as { id: string; name: string; created_at: string } | null
    if (p) {
      const daysRes = await supabase.from('plan_days').select('id, day_number, name, exercises').eq('plan_id', p.id).order('day_number')
      setPlanDays((daysRes.data as PlanDayRow[] | null) || [])
      const weekStart = getWeekStart()
      const doneRes = await supabase.from('sessions').select('plan_day_id').eq('user_id', user.id).gte('date', weekStart).not('plan_day_id', 'is', null)
      const done = new Set(((doneRes.data as { plan_day_id: string }[] | null) || []).map(r => r.plan_day_id))
      setDoneDayIds(done)
    } else {
      setPlanDays([])
      setDoneDayIds(new Set())
    }
    setPlan(p)
    setPlanLoading(false)
  }, [user?.id])

  useEffect(() => { loadPlan() }, [loadPlan])

  // Auto-start today's session when arriving from the dashboard "Start Session"
  useEffect(() => {
    const startPlanDayId = (location.state as { startPlanDayId?: string } | null)?.startPlanDayId
    if (!startPlanDayId || autoStartedRef.current || active || planLoading) return
    const day = planDays.find(d => d.id === startPlanDayId)
    if (day) {
      autoStartedRef.current = true
      startFromPlanDay(day)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, planDays, planLoading, active])

  // Publish the active session's exercises so the AI coach knows what's loaded
  useEffect(() => {
    setActiveSessionExercises(active ? sessionExercises.map(se => se.exercise.name) : [])
  }, [active, sessionExercises, setActiveSessionExercises])

  // Consume an AI "Apply changes" update — inject suggested exercises into the
  // live session, then clear it.
  useEffect(() => {
    if (!workoutUpdate?.exercises?.length || !active) return
    let cancelled = false
    ;(async () => {
      for (const upd of workoutUpdate.exercises) {
        const name = upd.exerciseName
        if (!name || sessionExercises.some(se => se.exercise.name.toLowerCase() === name.toLowerCase())) continue
        const { data } = await supabase.from('exercises').select('id, name, muscle_groups, is_compound').ilike('name', `%${name}%`).limit(1).maybeSingle()
        if (data && !cancelled) await addExercise(data as ExerciseRow)
      }
      if (!cancelled) { setWorkoutUpdate(null); showToast('Coach updated your session', 'success') }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutUpdate, active])

  // Restore an in-progress session on mount
  useEffect(() => {
    const saved = localStorage.getItem(ACTIVE_SESSION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSessionName(parsed.sessionName ?? '')
        setActive(true)
        setStartedAt(parsed.startedAt)
        setSessionExercises(parsed.sessionExercises ?? [])
        setNotes(parsed.notes ?? '')
        setActivePlanDayId(parsed.activePlanDayId ?? null)
        setWarmup(parsed.warmup ?? null)
        setWarmupDismissed(parsed.warmupDismissed ?? false)
      } catch { localStorage.removeItem(ACTIVE_SESSION_KEY) }
    }
  }, [])

  useEffect(() => {
    if (!active) return
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ sessionName, startedAt, sessionExercises, notes, activePlanDayId, warmup, warmupDismissed }))
  }, [active, sessionName, startedAt, sessionExercises, notes, activePlanDayId, warmup, warmupDismissed])

  // Flush offline queue on mount
  useEffect(() => {
    async function sync() {
      const [sets, sessions] = await Promise.all([getOfflineSets(), getOfflineSessions()])
      if (sets.length === 0 && sessions.length === 0) return
      try {
        for (const sess of sessions as Array<Record<string, unknown>>) {
          await supabase.from('sessions').upsert(sess as never)
          await clearOfflineSession(sess.id as string)
        }
        for (const set of sets as Array<Record<string, unknown> & { key: string }>) {
          const { key, ...setData } = set
          await supabase.from('session_sets').upsert(setData as never)
          await clearOfflineSet(key)
        }
        showToast('Synced offline sessions', 'success')
      } catch { /* still offline */ }
    }
    sync()
  }, [showToast])

  // Rest timer
  useEffect(() => {
    if (restRemaining === null) return
    if (restRemaining <= 0) { restIntervalRef.current && clearInterval(restIntervalRef.current); return }
    restIntervalRef.current = setInterval(() => setRestRemaining(r => (r === null ? null : r - 1)), 1000)
    return () => { restIntervalRef.current && clearInterval(restIntervalRef.current) }
  }, [restRemaining !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalSetsLogged = useMemo(() => sessionExercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0), [sessionExercises])

  // ── Generate weekly plan (Choose Your Split) ──
  async function handleGeneratePlan() {
    if (!user?.id || !profile || !selectedSplit) return
    setGeneratingPlan(true)
    try {
      await generateWeeklyPlanByType(user.id, profile, selectedSplit)
      setShowSplit(false)
      setSelectedSplit(null)
      await loadPlan()
      triggerHeatmapRefresh()
      showToast('Weekly plan generated', 'success')
    } catch (err) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Failed to generate plan', 'error')
    } finally {
      setGeneratingPlan(false)
    }
  }

  // ── Warmup generation ──
  const generateWarmup = useCallback(async (muscles: string[]) => {
    if (!user?.id) return
    try {
      const text = await callAgent(user.id, `Generate a 5-exercise warm-up for a user about to train: ${muscles.join(', ') || 'full body'}.`, 'warmup')
      const parsed = parseAgentJSON(text)
      if (Array.isArray(parsed)) setWarmup((parsed as WarmupExercise[]).slice(0, 5))
    } catch { /* warmup is best-effort */ }
  }, [user?.id])

  // ── Enter Mode B with a set of exercises ──
  async function enterActive(name: string, exercises: SessionExercise[], planDayId: string | null, muscles: string[]) {
    setSessionName(name)
    setSessionExercises(exercises)
    setActivePlanDayId(planDayId)
    setStartedAt(Date.now())
    setNotes('')
    setWarmup(null)
    setWarmupDismissed(false)
    setCompletion(null)
    setActive(true)
    generateWarmup(muscles)
  }

  // Start from a weekly-plan day
  async function startFromPlanDay(day: PlanDayRow) {
    if (!user?.id) return
    const list = day.exercises?.exercises || []
    const ids = list.map(e => e.exercise_id).filter(Boolean)
    const exRowsRes = ids.length ? await supabase.from('exercises').select('id, name, muscle_groups, is_compound').in('id', ids) : { data: [] }
    const exRows = (exRowsRes.data as ExerciseRow[] | null) || []
    const exMap: Record<string, ExerciseRow> = {}
    exRows.forEach(e => { exMap[e.id] = e })

    const sessionExs: SessionExercise[] = await Promise.all(list.map(async (item) => {
      const ex = exMap[item.exercise_id] || { id: item.exercise_id, name: item.exercise_name, muscle_groups: [], is_compound: null }
      const progression = await getProgressionSuggestion(user.id, ex.id).catch(() => null)
      const setCount = Math.max(1, item.sets || 3)
      return {
        exercise: ex,
        note: item.note,
        progression,
        sets: Array.from({ length: setCount }, (_, i) => ({ setNumber: i + 1, reps: '', weight: progression?.suggestedWeight ? String(progression.suggestedWeight) : '', rpe: '', completed: false })),
      }
    }))
    const muscles = [...new Set(exRows.flatMap(e => e.muscle_groups || []))]
    enterActive(day.name || 'Workout', sessionExs, day.id, muscles)
  }

  // Start from an AI-generated one-off session
  async function handleGenerateSession() {
    if (!user?.id || !profile) return
    setGeneratingSession(true)
    try {
      const result = await generateSessionFromPreferences(user.id, profile, { muscleGroups: genGroups, minutes: genMinutes, feeling: genFeeling })
      const sessionExs: SessionExercise[] = await Promise.all((result.exercises as ProcessedExercise[]).map(async (item) => {
        const ex: ExerciseRow = { id: item.exercise.id, name: item.exercise.name, muscle_groups: item.exercise.muscle_groups || [], is_compound: item.exercise.is_compound ?? null }
        const progression = await getProgressionSuggestion(user.id, ex.id).catch(() => null)
        const setCount = Math.max(1, item.sets || 3)
        return {
          exercise: ex,
          note: item.notes,
          progression,
          sets: Array.from({ length: setCount }, (_, i) => ({ setNumber: i + 1, reps: '', weight: progression?.suggestedWeight ? String(progression.suggestedWeight) : '', rpe: '', completed: false })),
        }
      }))
      const muscles = [...new Set(sessionExs.flatMap(e => e.exercise.muscle_groups || []))]
      setShowGen(false)
      enterActive(result.sessionName, sessionExs, null, muscles)
    } catch (err) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Failed to generate session', 'error')
    } finally {
      setGeneratingSession(false)
    }
  }

  // ── Mode B set handlers ──
  async function runSearch(q: string) {
    setQuery(q)
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    const { data } = await supabase.from('exercises').select('id, name, muscle_groups, is_compound').ilike('name', `%${q}%`).limit(15)
    setResults((data as ExerciseRow[] | null) ?? [])
    setSearching(false)
  }
  async function addExercise(ex: ExerciseRow) {
    setPicker(false); setQuery(''); setResults([])
    if (sessionExercises.some(se => se.exercise.id === ex.id)) return
    const progression = user ? await getProgressionSuggestion(user.id, ex.id).catch(() => null) : null
    setSessionExercises(prev => [...prev, { exercise: ex, sets: [{ setNumber: 1, reps: '', weight: progression?.suggestedWeight ? String(progression.suggestedWeight) : '', rpe: '', completed: false }], progression }])
  }
  function addSet(exIdx: number) {
    setSessionExercises(prev => prev.map((se, i) => {
      if (i !== exIdx) return se
      const last = se.sets[se.sets.length - 1]
      return { ...se, sets: [...se.sets, { setNumber: se.sets.length + 1, reps: last?.reps ?? '', weight: last?.weight ?? '', rpe: '', completed: false }] }
    }))
  }
  function updateSet(exIdx: number, setIdx: number, field: keyof LoggedSet, value: string | boolean) {
    setSessionExercises(prev => prev.map((se, i) => i !== exIdx ? se : { ...se, sets: se.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }))
  }
  function toggleComplete(exIdx: number, setIdx: number) {
    setSessionExercises(prev => prev.map((se, i) => i !== exIdx ? se : { ...se, sets: se.sets.map((s, j) => j === setIdx ? { ...s, completed: !s.completed } : s) }))
    const set = sessionExercises[exIdx]?.sets[setIdx]
    if (set && !set.completed) setRestRemaining(REST_SECONDS_DEFAULT)
  }
  function removeExercise(exIdx: number) { setSessionExercises(prev => prev.filter((_, i) => i !== exIdx)) }

  function cancelSession() {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
    setActive(false); setStartedAt(null); setSessionExercises([]); setSessionName(''); setNotes(''); setRestRemaining(null); setActivePlanDayId(null); setWarmup(null)
  }

  async function finishSession() {
    if (!user || !startedAt) return
    setFinishing(true)
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000))
    const sessionId = crypto.randomUUID()
    const date = today()

    const completedByExercise = sessionExercises.map(se => ({ ...se, sets: se.sets.filter(s => s.completed && s.reps) })).filter(se => se.sets.length > 0)

    const prs: CompletionSummary['prs'] = []
    for (const se of completedByExercise) {
      const newMax = Math.max(...se.sets.map(s => parseFloat(s.weight) || 0))
      if (newMax <= 0) continue
      const { data: historyRows } = await supabase.from('session_sets').select('weight_kg').eq('exercise_id', se.exercise.id).eq('completed', true).order('weight_kg', { ascending: false }).limit(1)
      const oldMax = historyRows?.[0]?.weight_kg ?? 0
      if (newMax > oldMax) prs.push({ name: se.exercise.name, oldMax, newMax })
    }

    const sessionRow = { id: sessionId, user_id: user.id, name: sessionName || 'Workout', date, duration: durationMinutes, notes: notes || null, plan_id: plan?.id ?? null, plan_day_id: activePlanDayId }
    const setRows = completedByExercise.flatMap(se => se.sets.map(s => ({
      session_id: sessionId, exercise_id: se.exercise.id, set_number: s.setNumber,
      reps: parseInt(s.reps) || null, weight_kg: parseFloat(s.weight) || null, rpe: s.rpe ? parseInt(s.rpe) : null, completed: true,
    })))

    try {
      const { error: sessErr } = await supabase.from('sessions').insert(sessionRow)
      if (sessErr) throw sessErr
      if (setRows.length > 0) {
        const { error: setsErr } = await supabase.from('session_sets').insert(setRows)
        if (setsErr) throw setsErr
      }
      const volumeSets = completedByExercise.flatMap(se => se.sets.map(() => ({ muscle_groups: se.exercise.muscle_groups })))
      await updateVolumeLog(user.id, volumeSets, date)
    } catch {
      await saveOfflineSession(sessionRow)
      for (const row of setRows) await saveOfflineSet(row)
      showToast('Offline — session saved locally, will sync when back online', 'warning')
    }

    if (prs.length > 0) {
      localStorage.setItem('motionlab_new_prs', JSON.stringify({ prs: prs.map(p => ({ name: p.name, newMax: p.newMax })), timestamp: Date.now() }))
    }

    setCompletion({ durationMinutes, totalSets: setRows.length, totalExercises: completedByExercise.length, prs })
    localStorage.removeItem(ACTIVE_SESSION_KEY)
    setActive(false); setActivePlanDayId(null); setWarmup(null); setFinishing(false)
    triggerHeatmapRefresh()
    loadPlan()
  }

  // ══════════════════════════ RENDER ══════════════════════════

  // ── Completion summary ──
  if (completion) {
    return (
      <div className="flex flex-col gap-5 items-center text-center py-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(96,108,56,0.15)', border: '1px solid rgba(96,108,56,0.3)' }}>
          <Check size={28} className="text-[#8a9c4a]" />
        </div>
        <h1 className="text-2xl font-black text-white">Session complete</h1>
        <p className="text-sm text-white/40">{completion.durationMinutes} min · {completion.totalExercises} exercises · {completion.totalSets} sets</p>
        {completion.prs.length > 0 && (
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {completion.prs.map(pr => (
              <div key={pr.name} className="flex items-center gap-3 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(96,108,56,0.08)', border: '1px solid rgba(96,108,56,0.25)' }}>
                <Trophy size={16} className="text-[#8a9c4a] shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white/85">{pr.name} — new PR</p>
                  <p className="text-xs text-white/40">{pr.oldMax}kg → {pr.newMax}kg</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setCompletion(null)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-sm font-bold text-white transition-opacity hover:opacity-85 mt-2" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>Done</button>
      </div>
    )
  }

  // ── Mode B: active session ──
  if (active) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4 sticky top-0 z-10 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6" style={{ background: '#080C14', borderBottom: '1px solid rgba(96,108,56,0.1)' }}>
          <div>
            <h1 className="text-xl font-black text-white">{sessionName}</h1>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">{totalSetsLogged} sets logged</p>
          </div>
          <div className="flex items-center gap-2">
            {restRemaining !== null && restRemaining > 0 && (
              <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full" style={{ color: '#8a9c4a', background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.2)' }}>
                <TimerReset size={13} /> {fmtTime(restRemaining)}
              </span>
            )}
            <button onClick={cancelSession} className="p-2 rounded-[8px] text-white/40 hover:text-white/70" style={{ border: '1px solid rgba(96,108,56,0.15)' }} aria-label="Cancel session"><Square size={14} /></button>
          </div>
        </div>

        {warmup && !warmupDismissed && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#8a9c4a]" /><h2 className="font-bold text-white/80 text-sm">Warm-up</h2></div>
              <button onClick={() => setWarmupDismissed(true)} className="text-white/30 hover:text-white/60"><X size={14} /></button>
            </div>
            <div className="flex flex-col gap-1.5">
              {warmup.map((w, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-white/70">{w.exercise}</span>
                  <span className="text-white/35 font-mono">{w.sets}×{w.reps}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          {sessionExercises.map((se, exIdx) => (
            <Card key={se.exercise.id + exIdx} title={se.exercise.name}>
              {se.note && <p className="text-xs text-[#F5C542]/80 mb-2 -mt-2">⚠ {se.note}</p>}
              {se.progression && <p className="text-xs text-white/40 mb-3 -mt-1">{se.progression.reason}</p>}
              <div className="flex flex-col gap-1.5">
                {se.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/25 w-5 shrink-0">{set.setNumber}</span>
                    <input value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)} placeholder="kg" inputMode="decimal" className="w-20 h-9 rounded-[7px] px-2.5 text-sm text-white/85 outline-none" style={{ background: '#080C14', border: '1px solid rgba(96,108,56,0.15)' }} />
                    <input value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)} placeholder="reps" inputMode="numeric" className="w-20 h-9 rounded-[7px] px-2.5 text-sm text-white/85 outline-none" style={{ background: '#080C14', border: '1px solid rgba(96,108,56,0.15)' }} />
                    <input value={set.rpe} onChange={e => updateSet(exIdx, setIdx, 'rpe', e.target.value)} placeholder="RPE" inputMode="numeric" className="w-16 h-9 rounded-[7px] px-2.5 text-sm text-white/85 outline-none" style={{ background: '#080C14', border: '1px solid rgba(96,108,56,0.15)' }} />
                    <button onClick={() => toggleComplete(exIdx, setIdx)} className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0 transition-colors" style={set.completed ? { background: 'rgba(96,108,56,0.2)', border: '1px solid rgba(96,108,56,0.4)' } : { border: '1px solid rgba(255,255,255,0.08)' }} aria-label="Mark set complete">
                      <Check size={14} className={set.completed ? 'text-[#8a9c4a]' : 'text-white/20'} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => addSet(exIdx)} className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white/70"><Plus size={12} /> Add set</button>
                <span className="text-white/15">·</span>
                <button onClick={() => removeExercise(exIdx)} className="text-xs font-medium text-white/25 hover:text-red-400/70">Remove exercise</button>
              </div>
            </Card>
          ))}

          <button onClick={() => setPicker(true)} className="flex items-center justify-center gap-1.5 py-3 rounded-[10px] text-sm font-medium text-white/40 hover:text-white/70 transition-colors" style={{ border: '1px dashed rgba(96,108,56,0.25)' }}>
            <Plus size={14} /> Add exercise
          </button>
        </div>

        <Card title="Session Notes">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel? Anything to remember for next time." rows={2} className="w-full rounded-[8px] px-3.5 py-2.5 text-sm text-white/85 outline-none resize-none" style={{ background: '#080C14', border: '1px solid rgba(96,108,56,0.15)' }} />
        </Card>

        <button onClick={finishSession} disabled={finishing || sessionExercises.length === 0} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[8px] text-sm font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-40" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
          {finishing ? 'Saving…' : 'Finish Session'}
        </button>

        {picker && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setPicker(false)}>
            <div className="w-full max-w-md rounded-[12px] p-4" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.2)' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <input autoFocus value={query} onChange={e => runSearch(e.target.value)} placeholder="Search exercises…" className="w-full h-10 rounded-[8px] pl-9 pr-3 text-sm text-white/85 outline-none" style={{ background: '#080C14', border: '1px solid rgba(96,108,56,0.15)' }} />
                </div>
                <button onClick={() => setPicker(false)} className="p-2 text-white/30 hover:text-white/60"><X size={16} /></button>
              </div>
              <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
                {searching && <p className="text-xs text-white/30 px-2 py-3">Searching…</p>}
                {!searching && query.length >= 2 && results.length === 0 && <p className="text-xs text-white/30 px-2 py-3">No exercises found.</p>}
                {results.map(ex => (
                  <button key={ex.id} onClick={() => addExercise(ex)} className="flex flex-col items-start px-3 py-2.5 rounded-[8px] text-left hover:bg-white/[0.03] transition-colors">
                    <span className="text-sm text-white/85">{ex.name}</span>
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">{ex.muscle_groups.slice(0, 3).join(', ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Mode A: plan view ──
  const hasWeeklyPlan = planDays.length === 7
  const planStart = plan?.created_at?.split('T')[0] ?? today()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <PillTag className="mb-3">Workout</PillTag>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">Your <span className="text-gradient-olive">Training</span></h1>
        <p className="text-sm text-white/40">Select a session template or generate a fresh one with AI.</p>
      </div>

      <NodeLine />

      {/* Workout Plan card */}
      <Card title="Workout Plan">
        <p className="text-sm text-white/40 -mt-2 mb-4">Load your scheduled session or generate a fresh one with AI.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowLogger(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-sm font-semibold text-white/80 transition-colors hover:text-white" style={{ background: '#080C14', border: '1px solid rgba(96,108,56,0.2)' }}>
            <Dumbbell size={15} /> Log workout
          </button>
          <button onClick={() => setShowGen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-sm font-bold text-white transition-opacity hover:opacity-85" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
            <Sparkles size={15} /> Generate with AI
          </button>
        </div>
      </Card>

      {/* Weekly plan list */}
      {planLoading ? (
        <div className="rounded-[12px] p-8 text-center text-sm text-white/30" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>Loading plan…</div>
      ) : hasWeeklyPlan ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">{plan?.name}</p>
              <p className="text-xs text-white/40">Based on your preference of <span className="text-[#8a9c4a] font-semibold">{profile?.sessions_per_week ?? '—'} workouts</span> per week</p>
            </div>
            <button onClick={() => setShowSplit(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-medium text-white/60 hover:text-white/85 transition-colors" style={{ border: '1px solid rgba(96,108,56,0.2)' }}>
              <RefreshCw size={12} /> Regenerate Plan
            </button>
          </div>

          {planDays.map(day => {
            const dayDate = addDaysStr(planStart, day.day_number - 1)
            const isToday = dayDate === today()
            const isDone = doneDayIds.has(day.id)
            const isRest = day.exercises?.is_rest || (day.exercises?.exercises?.length ?? 0) === 0
            const exs = day.exercises?.exercises || []
            const d = new Date(dayDate + 'T12:00:00')
            const isExpanded = expandedDay === day.id
            return (
              <div key={day.id} className="rounded-[10px] overflow-hidden" style={{ background: '#0D1420', border: `1px solid ${isToday ? 'rgba(138,156,74,0.5)' : 'rgba(96,108,56,0.1)'}` }}>
                <button onClick={() => !isRest && setExpandedDay(isExpanded ? null : day.id)} className="w-full flex items-center gap-4 p-4 text-left">
                  <div className="w-12 shrink-0 text-center">
                    <p className={`font-mono text-[9px] uppercase tracking-wider ${isToday ? 'text-[#8a9c4a]' : 'text-white/30'}`}>{d.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                    <p className={`text-sm font-bold ${isToday ? 'text-[#8a9c4a]' : 'text-white/60'}`}>{d.getDate()} {d.toLocaleDateString(undefined, { month: 'short' })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isRest ? 'text-white/40' : 'text-white/85'}`}>{isRest ? 'Rest' : day.name}</p>
                    <p className="text-xs text-white/35">{isRest ? 'Rest' : `${exs.length} exercises`}</p>
                  </div>
                  {isDone && <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-[#8a9c4a]"><Check size={12} /> Done</span>}
                  {!isRest && <ChevronDown size={16} className={`text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                </button>
                {isExpanded && !isRest && (
                  <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(96,108,56,0.08)' }}>
                    {day.exercises?.explanation && (
                      <div className="pt-3">
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-wider mb-1">Why this workout?</p>
                        <p className="text-xs text-white/50 leading-relaxed">{day.exercises.explanation}</p>
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 pt-1">
                      {exs.map((e, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-white/70">{e.exercise_name}</span>
                          <span className="text-white/35 font-mono">{e.sets} × {e.reps}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => startFromPlanDay(day)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-sm font-bold text-white self-start transition-opacity hover:opacity-85 mt-1" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
                      {isDone ? 'Redo session' : 'Start session'} →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[12px] p-10 flex flex-col items-center text-center gap-4" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
          <Calendar size={24} className="text-[#8a9c4a]/60" />
          <p className="text-sm text-white/50">No weekly plan for this week yet.</p>
          <button onClick={() => setShowSplit(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-sm font-bold text-white transition-opacity hover:opacity-85" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
            Generate Weekly Plan
          </button>
        </div>
      )}

      {/* Log Session modal */}
      {showLogger && <ManualWorkoutLogger onClose={() => setShowLogger(false)} onSaved={() => { setShowLogger(false); loadPlan() }} />}

      {/* Choose Your Split modal */}
      {showSplit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => !generatingPlan && setShowSplit(false)}>
          <div className="w-full max-w-md rounded-[14px] p-6" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.25)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-black text-white">Choose Your Split</h2>
              <button onClick={() => !generatingPlan && setShowSplit(false)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>
            <p className="text-sm text-white/35 mb-5">Select a training structure for this week</p>
            <div className="flex flex-col gap-2.5 mb-5">
              {WEEKLY_PLAN_TYPES.map(pt => {
                const sel = selectedSplit === pt.id
                return (
                  <button key={pt.id} onClick={() => setSelectedSplit(pt.id)} className="w-full flex items-start justify-between gap-3 p-4 rounded-[10px] text-left transition-all" style={{ background: sel ? 'rgba(96,108,56,0.1)' : '#080C14', border: `1px solid ${sel ? 'rgba(138,156,74,0.5)' : 'rgba(96,108,56,0.12)'}` }}>
                    <div>
                      <p className={`text-sm font-bold ${sel ? 'text-[#8a9c4a]' : 'text-white/85'}`}>{pt.name}</p>
                      <p className="text-[11px] text-white/35 mt-1">{pt.structure}</p>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8a9c4a] shrink-0 mt-0.5">{pt.days}</span>
                  </button>
                )
              })}
            </div>
            <button onClick={handleGeneratePlan} disabled={!selectedSplit || generatingPlan} className="w-full py-3 rounded-[8px] text-sm font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-40" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
              {generatingPlan ? 'Generating…' : 'Generate Plan'}
            </button>
          </div>
        </div>
      )}

      {/* Generate with AI modal */}
      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => !generatingSession && setShowGen(false)}>
          <div className="w-full max-w-md rounded-[14px] p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.25)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-black text-white">Generate a Session</h2>
              <button onClick={() => !generatingSession && setShowGen(false)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>
            <p className="text-sm text-white/35 mb-5">The AI builds a session from your history and preferences.</p>

            <p className="text-sm font-medium text-white/60 mb-2">What do you want to train?</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {SPLIT_OPTIONS.map(g => {
                const sel = genGroups.includes(g)
                return <button key={g} onClick={() => setGenGroups(prev => sel ? prev.filter(x => x !== g) : [...prev, g])} className="px-3.5 py-2 rounded-full text-xs font-medium transition-all" style={sel ? { background: '#606C38', color: '#fff', border: '1px solid rgba(96,108,56,0.5)' } : { color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(96,108,56,0.18)' }}>{g}</button>
              })}
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {MUSCLE_OPTIONS.map(g => {
                const sel = genGroups.includes(g)
                return <button key={g} onClick={() => setGenGroups(prev => sel ? prev.filter(x => x !== g) : [...prev, g])} className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all" style={sel ? { background: 'rgba(96,108,56,0.2)', color: '#8a9c4a', border: '1px solid rgba(138,156,74,0.5)' } : { color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(96,108,56,0.15)' }}>{g}</button>
              })}
            </div>

            <p className="text-sm font-medium text-white/60 mb-2">Time available</p>
            <div className="flex items-center gap-2 mb-5">
              <input type="range" min={20} max={120} step={5} value={genMinutes} onChange={e => setGenMinutes(parseInt(e.target.value))} className="flex-1 accent-[#606C38]" />
              <span className="text-sm text-white/70 font-mono w-16 text-right">{genMinutes} min</span>
            </div>

            <p className="text-sm font-medium text-white/60 mb-2">How are you feeling?</p>
            <div className="flex gap-2 mb-6">
              {FEELINGS.map(f => {
                const sel = genFeeling === f.id
                return <button key={f.id} onClick={() => setGenFeeling(f.id)} className="flex-1 py-2.5 rounded-[8px] text-sm font-medium transition-all" style={sel ? { background: '#606C38', color: '#fff', border: '1px solid rgba(96,108,56,0.5)' } : { color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(96,108,56,0.18)' }}>{f.label}</button>
              })}
            </div>

            <button onClick={handleGenerateSession} disabled={generatingSession} className="w-full py-3 rounded-[8px] text-sm font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-50" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
              {generatingSession ? 'Generating…' : 'Generate & Start'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
