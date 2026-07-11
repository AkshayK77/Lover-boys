// Import the Groq-enriched free-exercise-db dataset into motionlab's exercises table.
//
// Behaviour:
//  - MATCH (slug already exists): backfill instructions + thumbnail_url only when
//    they are currently empty. Leaves muscle_groups / is_compound / equipment
//    untouched — the existing 157 rows carry kavafit's hand-curated labels, which
//    are the gold standard and must not be overwritten.
//  - NEW (slug not present): insert the full enriched row (~700 exercises).
//
// Needs VITE_SUPABASE_URL + MOTIONLAB_SUPABASE_SERVICE_KEY in .env.local.
// Run:  node supabase/scripts/import-enriched.mjs
//       node supabase/scripts/import-enriched.mjs --dry   (no writes, just report)

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '..', '.env.local') })

const DRY = process.argv.includes('--dry')
const INPUT = join(__dirname, 'data', 'enriched-exercises.json')
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.MOTIONLAB_SUPABASE_SERVICE_KEY
if (!url || !key) { console.error('Missing VITE_SUPABASE_URL / MOTIONLAB_SUPABASE_SERVICE_KEY'); process.exit(1) }
const db = createClient(url, key)

const EQUIPMENT = {
  'body only': ['bodyweight'], 'exercise ball': ['bodyweight'], 'foam roll': ['bodyweight'],
  other: ['bodyweight'], '': ['bodyweight'],
  dumbbell: ['dumbbells_only'], kettlebells: ['dumbbells_only'], bands: ['dumbbells_only'],
  'medicine ball': ['dumbbells_only'],
  barbell: ['full_gym'], cable: ['full_gym'], machine: ['full_gym'], 'e-z curl bar': ['full_gym'],
}
const CATEGORY = {
  strength: 'strength', stretching: 'mobility', plyometrics: 'plyometric',
  powerlifting: 'strength', cardio: 'cardio', 'olympic weightlifting': 'strength',
  strongman: 'strength',
}
const DIFFICULTY = { beginner: 'beginner', intermediate: 'intermediate', expert: 'advanced', advanced: 'advanced' }

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
function dedupe(base, seen) {
  if (!seen.has(base)) { seen.add(base); return base }
  let i = 2, s = `${base}-${i}`
  while (seen.has(s)) { i++; s = `${base}-${i}` }
  seen.add(s); return s
}
function instructionsText(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null
  return arr.map((s, i) => `${i + 1}. ${String(s).trim()}`).join('\n')
}

async function main() {
  if (!existsSync(INPUT)) { console.error(`Missing ${INPUT} — run enrich-exercisedb.mjs first.`); process.exit(1) }
  const data = JSON.parse(readFileSync(INPUT, 'utf8'))
  console.log(`Loaded ${data.length} enriched exercises.${DRY ? '  (DRY RUN)' : ''}`)

  // FULL REPLACE: every existing exercise is wiped and the dataset becomes the
  // sole canonical catalog. Build insert rows for ALL 873, deduping slugs.
  const seenSlugs = new Set()
  const toInsert = data.map(ex => ({
    name: ex.name,
    slug: dedupe(slugify(ex.name), seenSlugs),
    instructions: instructionsText(ex.instructions),
    muscle_groups: ex.muscle_groups,
    equipment: EQUIPMENT[ex.equipment] || ['bodyweight'],
    difficulty: DIFFICULTY[ex.level] || 'intermediate',
    category: CATEGORY[ex.category] || 'strength',
    is_compound: !!ex.is_compound,
    thumbnail_url: ex.images?.[0] ? IMG_BASE + ex.images[0] : null,
    sports: [],
  }))

  const { count: before } = await db.from('exercises').select('*', { count: 'exact', head: true })
  console.log(`\nPlan: DELETE all ${before} existing rows, INSERT ${toInsert.length} from dataset.`)
  if (DRY) {
    console.log('Sample insert:', JSON.stringify(toInsert[0], null, 2))
    return
  }

  // wipe
  const { error: delErr } = await db.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) throw new Error(`delete failed: ${delErr.message}`)
  console.log(`Wiped ${before} existing rows.`)

  // insert all in chunks
  let ins = 0
  for (let i = 0; i < toInsert.length; i += 500) {
    const chunk = toInsert.slice(i, i + 500)
    const { error } = await db.from('exercises').insert(chunk)
    if (error) { console.log(`insert chunk @${i} err:`, error.message); continue }
    ins += chunk.length
    console.log(`  inserted ${ins}/${toInsert.length}`)
  }

  const { count } = await db.from('exercises').select('*', { count: 'exact', head: true })
  const { count: withImg } = await db.from('exercises').select('*', { count: 'exact', head: true }).not('thumbnail_url', 'is', null)
  console.log(`\nDone. exercises table now has ${count} rows (${withImg} with pictures).`)
}

main().catch(e => { console.error(e); process.exit(1) })
