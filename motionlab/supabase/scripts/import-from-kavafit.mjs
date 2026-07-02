// One-time import: KavaFit's real exercises + indian_foods content into
// MotionLab's Supabase project. Read-only against KavaFit, truncate-and-
// reinsert into MotionLab (idempotent — safe to re-run after tweaking the
// mapping below).
//
// Run with: node --env-file=.env.local supabase/scripts/import-from-kavafit.mjs
//
// Deliberately does NOT touch muscle_volume_log or any user-scoped table
// (profiles, sessions, session_sets, meal_history, measurements, etc.) —
// this only moves reference/content data that isn't tied to a specific user.

import { createClient } from '@supabase/supabase-js'

// Prefer the service_role key if present — indian_foods' RLS on KavaFit's
// side blocks anonymous reads, exercises happens to allow them either way.
const kavafit = createClient(
  requireEnv('KAVAFIT_SUPABASE_URL'),
  process.env.KAVAFIT_SUPABASE_SERVICE_KEY || requireEnv('KAVAFIT_SUPABASE_ANON_KEY'),
)

const motionlab = createClient(
  requireEnv('VITE_SUPABASE_URL'),
  requireEnv('MOTIONLAB_SUPABASE_SERVICE_KEY'),
)

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// PostgREST caps rows-per-request (default 1000) — page through with
// .range() so this doesn't silently truncate as either table grows.
async function fetchAll(client, table, columns) {
  const PAGE_SIZE = 1000
  const all = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await client.from(table).select(columns).range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`${table} fetch failed: ${error.message}`)
    all.push(...data)
    if (data.length < PAGE_SIZE) break
  }
  return all
}

function dedupeSlug(base, seen) {
  if (!seen.has(base)) {
    seen.add(base)
    return base
  }
  let i = 2
  while (seen.has(`${base}-${i}`)) i++
  const slug = `${base}-${i}`
  seen.add(slug)
  return slug
}

const VALID_DIFFICULTY = new Set(['beginner', 'intermediate', 'advanced'])

async function importExercises() {
  console.log('\n--- exercises ---')

  const rows = await fetchAll(kavafit, 'exercises', 'id, name, muscle_groups, equipment_needed, difficulty, instructions, is_compound')
  console.log(`fetched ${rows.length} rows from KavaFit`)

  const seenSlugs = new Set()
  const transformed = rows.map(row => {
    const difficulty = VALID_DIFFICULTY.has((row.difficulty ?? '').toLowerCase())
      ? row.difficulty.toLowerCase()
      : null

    const equipment = (row.equipment_needed ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    return {
      name: row.name,
      slug: dedupeSlug(slugify(row.name), seenSlugs),
      description: null,
      instructions: row.instructions ?? null,
      muscle_groups: row.muscle_groups ?? [],
      equipment,
      difficulty,
      category: 'strength', // KavaFit is exclusively a strength-training app
      sports: [],
      video_url: null,
      thumbnail_url: null,
    }
  })

  const { error: deleteError } = await motionlab.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) throw new Error(`MotionLab exercises clear failed: ${deleteError.message}`)

  const { error: insertError } = await motionlab.from('exercises').insert(transformed)
  if (insertError) throw new Error(`MotionLab exercises insert failed: ${insertError.message}`)

  console.log(`inserted ${transformed.length} rows into MotionLab`)
}

async function importIndianFoods() {
  console.log('\n--- indian_foods ---')

  const rows = await fetchAll(kavafit, 'indian_foods', 'food_name, serving_unit, serving_energy_kcal, serving_protein_g, serving_carbs_g, serving_fat_g, serving_fiber_g')
  console.log(`fetched ${rows.length} rows from KavaFit`)

  const transformed = rows.map(row => ({
    name: row.food_name,
    name_local: null,
    category: null, // no KavaFit equivalent — needs manual curation later
    serving_desc: row.serving_unit ?? null,
    serving_g: null, // KavaFit's serving_unit is descriptive text, not a reliable gram figure
    calories: row.serving_energy_kcal,
    protein_g: row.serving_protein_g,
    carbs_g: row.serving_carbs_g,
    fat_g: row.serving_fat_g,
    fibre_g: row.serving_fiber_g,
    is_vegetarian: true, // KavaFit has no dietary flags — defaults, needs manual review
    is_vegan: false,
  }))

  const { error: deleteError } = await motionlab.from('indian_foods').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) throw new Error(`MotionLab indian_foods clear failed: ${deleteError.message}`)

  // Insert in batches — 1000+ rows in a single insert can hit payload limits.
  const BATCH_SIZE = 200
  for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
    const batch = transformed.slice(i, i + BATCH_SIZE)
    const { error: insertError } = await motionlab.from('indian_foods').insert(batch)
    if (insertError) throw new Error(`MotionLab indian_foods insert failed at row ${i}: ${insertError.message}`)
  }

  console.log(`inserted ${transformed.length} rows into MotionLab`)
  console.log(`⚠ all ${transformed.length} rows defaulted to is_vegetarian=true, is_vegan=false, category=null — review/correct manually`)
}

async function main() {
  await importExercises()
  await importIndianFoods()
  console.log('\nDone.')
}

main().catch(err => {
  console.error('\nImport failed:', err.message)
  process.exit(1)
})
