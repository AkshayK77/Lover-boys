// Enrich the free-exercise-db dataset's coarse muscle labels into motionlab's
// precise 37-token granular taxonomy using Groq (llama-3.3-70b-versatile).
//
// Input:  supabase/scripts/data/free-exercise-db.json   (873 exercises, coarse)
// Output: supabase/scripts/data/enriched-exercises.json  (adds muscle_groups[] + is_compound)
//
// - No new npm deps (plain fetch). GROQ_API_KEY from .env.local.
// - Every emitted muscle token is validated against ALLOWED_MUSCLES; off-vocab
//   tokens are dropped. If a batch/exercise yields zero valid tokens we fall back
//   to a deterministic coarse->granular map so we never lose an exercise.
// - Resumable: already-enriched ids in the output file are skipped on re-run.
//
// Run:  node supabase/scripts/enrich-exercisedb.mjs
//       node supabase/scripts/enrich-exercisedb.mjs --limit 50   (smoke test)

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '..', '.env.local') })

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY
if (!GROQ_API_KEY) {
  console.error('Missing GROQ_API_KEY (or VITE_GROQ_API_KEY) in .env.local')
  process.exit(1)
}

const MODEL = 'llama-3.3-70b-versatile'
const BATCH_SIZE = 20
const DATA_DIR = join(__dirname, 'data')
const INPUT = join(DATA_DIR, 'free-exercise-db.json')
const OUTPUT = join(DATA_DIR, 'enriched-exercises.json')

const argLimit = (() => {
  const i = process.argv.indexOf('--limit')
  return i !== -1 ? parseInt(process.argv[i + 1], 10) : Infinity
})()

// --- Canonical target vocabulary (must each resolve via mapToVolumeGroup) -----
const ALLOWED_MUSCLES = new Set([
  'chest_upper', 'chest_mid', 'chest_lower',
  'anterior_delt', 'lateral_delt', 'posterior_delt', 'rotator_cuff',
  'triceps_long', 'triceps_lateral', 'triceps_medial',
  'lats',
  'upper_trap', 'mid_trap', 'lower_trap', 'rhomboids', 'erector_spinae', 'teres_major',
  'biceps_long', 'biceps_short', 'brachialis',
  'rectus_abdominis', 'obliques', 'transverse_abdominis', 'serratus',
  'quads_rf', 'quads_vl', 'quads_vmo',
  'hamstrings_bf', 'hamstrings_semi',
  'glute_max', 'glute_med', 'glute_min',
  'gastrocnemius', 'soleus',
  'forearms',
])

// Deterministic fallback: coarse dataset label -> granular tokens.
const FALLBACK = {
  abdominals: ['rectus_abdominis'],
  abductors: ['glute_med'],
  adductors: ['glute_med'],
  biceps: ['biceps_long', 'biceps_short'],
  calves: ['gastrocnemius', 'soleus'],
  chest: ['chest_mid'],
  forearms: ['forearms'],
  glutes: ['glute_max'],
  hamstrings: ['hamstrings_bf', 'hamstrings_semi'],
  lats: ['lats'],
  'lower back': ['erector_spinae'],
  'middle back': ['rhomboids', 'mid_trap'],
  neck: ['upper_trap'],
  quadriceps: ['quads_rf', 'quads_vl', 'quads_vmo'],
  shoulders: ['anterior_delt', 'lateral_delt'],
  traps: ['upper_trap', 'mid_trap'],
  triceps: ['triceps_long', 'triceps_lateral', 'triceps_medial'],
}

function fallbackMuscles(ex) {
  const out = new Set()
  for (const m of ex.primaryMuscles || []) (FALLBACK[m] || []).forEach(t => out.add(t))
  // include one secondary token so compounds still register some support volume
  for (const m of ex.secondaryMuscles || []) (FALLBACK[m] || []).slice(0, 1).forEach(t => out.add(t))
  return [...out]
}

const SYSTEM_PROMPT = `You are a strength-training anatomy expert. For each exercise you receive, output the precise muscles worked using ONLY tokens from this exact vocabulary:

CHEST: chest_upper, chest_mid, chest_lower
SHOULDERS: anterior_delt, lateral_delt, posterior_delt, rotator_cuff
TRICEPS: triceps_long, triceps_lateral, triceps_medial
BACK: lats, upper_trap, mid_trap, lower_trap, rhomboids, erector_spinae, teres_major
BICEPS: biceps_long, biceps_short, brachialis
CORE: rectus_abdominis, obliques, transverse_abdominis, serratus
QUADS: quads_rf, quads_vl, quads_vmo
HAMSTRINGS: hamstrings_bf, hamstrings_semi
GLUTES: glute_max, glute_med, glute_min
CALVES: gastrocnemius, soleus
FOREARMS: forearms

Rules:
- Refine the coarse primary/secondary muscles into the specific heads/regions the movement emphasizes. Use the exercise name, angle, and grip. Examples: incline press -> chest_upper + anterior_delt + triceps_long; decline/dip -> chest_lower; pull-up -> lats + teres_major + biceps_long + brachialis; barbell row -> lats + rhomboids + mid_trap + posterior_delt; RDL -> hamstrings_bf + hamstrings_semi + glute_max + erector_spinae; back squat -> quads_rf + quads_vl + glute_max; lateral raise -> lateral_delt; hammer curl -> brachialis + biceps_long + forearms; plank -> transverse_abdominis + rectus_abdominis.
- List the primary movers first, then meaningful synergists. 2-5 tokens is typical; isolation moves may have 1-2.
- Output ONLY tokens from the vocabulary above. Never invent tokens. If a coarse muscle has no exact match, choose the closest listed token.
- is_compound: true if the movement crosses multiple joints / trains multiple major muscle groups (squat, bench, row, deadlift, press, pull-up, lunge); false for single-joint isolation (curl, extension, raise, fly, calf raise, crunch).

Return ONLY a JSON object: {"results":[{"id":"<id>","muscle_groups":["..."],"is_compound":true|false}]}
One entry per input exercise, same id. No prose, no markdown fences.`

function buildUserPrompt(batch) {
  const items = batch.map(ex => ({
    id: ex.id,
    name: ex.name,
    primary: ex.primaryMuscles || [],
    secondary: ex.secondaryMuscles || [],
    equipment: ex.equipment || '',
    mechanic: ex.mechanic || '',
    category: ex.category || '',
  }))
  return `Classify these ${items.length} exercises:\n${JSON.stringify(items, null, 0)}`
}

function stripFences(s) {
  return s.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/i, '').trim()
}

async function callGroq(messages, attempt = 1) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages,
    }),
  })
  if (res.status === 429 || res.status >= 500) {
    if (attempt > 4) throw new Error(`Groq ${res.status} after ${attempt} attempts`)
    const wait = res.status === 429 ? 8000 * attempt : 2000 * attempt
    console.log(`  rate/err ${res.status}, waiting ${wait}ms...`)
    await new Promise(r => setTimeout(r, wait))
    return callGroq(messages, attempt + 1)
  }
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const json = await res.json()
  return json.choices?.[0]?.message?.content || ''
}

function validate(tokens) {
  const clean = [...new Set((tokens || []).map(t => String(t).trim()))].filter(t => ALLOWED_MUSCLES.has(t))
  return clean
}

async function enrichBatch(batch) {
  let parsed
  try {
    const content = await callGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(batch) },
    ])
    parsed = JSON.parse(stripFences(content))
  } catch (e) {
    console.log(`  batch AI failed (${e.message}) -> deterministic fallback for ${batch.length}`)
    parsed = null
  }

  const byId = new Map()
  if (parsed && Array.isArray(parsed.results)) {
    for (const r of parsed.results) byId.set(r.id, r)
  }

  let aiUsed = 0, fbUsed = 0
  const enriched = batch.map(ex => {
    const r = byId.get(ex.id)
    let muscles = validate(r?.muscle_groups)
    let isCompound
    if (muscles.length === 0) {
      muscles = fallbackMuscles(ex)
      fbUsed++
      isCompound = ex.mechanic === 'compound'
    } else {
      aiUsed++
      isCompound = typeof r.is_compound === 'boolean' ? r.is_compound : ex.mechanic === 'compound'
    }
    if (muscles.length === 0) muscles = ['rectus_abdominis'] // last-resort, never empty
    return { ...ex, muscle_groups: muscles, is_compound: isCompound }
  })
  return { enriched, aiUsed, fbUsed }
}

async function main() {
  if (!existsSync(INPUT)) { console.error(`Missing ${INPUT} — run the download first.`); process.exit(1) }
  const all = JSON.parse(readFileSync(INPUT, 'utf8')).slice(0, argLimit === Infinity ? undefined : argLimit)

  const done = new Map()
  if (existsSync(OUTPUT)) {
    for (const e of JSON.parse(readFileSync(OUTPUT, 'utf8'))) done.set(e.id, e)
    console.log(`Resuming: ${done.size} already enriched.`)
  }

  const todo = all.filter(e => !done.has(e.id))
  console.log(`Total ${all.length}, to enrich ${todo.length}, batch size ${BATCH_SIZE}\n`)

  let totalAi = 0, totalFb = 0
  const results = [...done.values()]
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE)
    const { enriched, aiUsed, fbUsed } = await enrichBatch(batch)
    results.push(...enriched)
    totalAi += aiUsed; totalFb += fbUsed
    // checkpoint every batch so a crash never loses progress
    writeFileSync(OUTPUT, JSON.stringify(results, null, 2))
    console.log(`  [${Math.min(i + BATCH_SIZE, todo.length)}/${todo.length}] ai=${aiUsed} fallback=${fbUsed}`)
    await new Promise(r => setTimeout(r, 400)) // gentle pacing under Groq RPM
  }

  console.log(`\nDone. ${results.length} exercises written to ${OUTPUT}`)
  console.log(`AI-classified: ${totalAi}  |  deterministic fallback: ${totalFb}`)
}

main().catch(e => { console.error(e); process.exit(1) })
