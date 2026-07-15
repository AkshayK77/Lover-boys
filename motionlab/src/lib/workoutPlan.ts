import { supabase } from './supabase'
import { callAI } from './ai'
import type { Profile } from '@/types'

// A single exercise, as selected/stored by the plan generators. motionlab
// exercises carry granular muscle_groups + a text[] equipment column.
export interface ExerciseLite {
  id: string
  name: string
  muscle_groups: string[]
  equipment: string[]
  is_compound?: boolean
}

// Shape stored in plan_days.exercises (jsonb). Rest days: is_rest true, exercises [].
export interface PlanDayExercise {
  exercise_id: string
  exercise_name: string
  sets: number
  reps: string
  note: string | null
}
export interface PlanDayJson {
  exercises: PlanDayExercise[]
  explanation: string | null
  is_rest: boolean
}

const GOAL_LABELS: Record<string, string> = {
  muscle_gain: 'Build muscle (hypertrophy)',
  fat_loss: 'Lose fat (lean out)',
  general_fitness: 'Improve general fitness and endurance',
}

// motionlab plan-type enum values (workout_plans.plan_type CHECK)
const PLAN_TYPE_DB: Record<string, string> = {
  ppl: 'ppl',
  ppl_ul: 'ppl_upper_lower',
  bro: 'bro_split',
  full_body: 'full_body',
}

// Maps modal chip selections → motionlab DB muscle_group keys (coarse + granular)
const MUSCLE_GROUP_KEYS: Record<string, string[]> = {
  Push: ['chest', 'chest_upper', 'chest_mid', 'chest_lower', 'shoulders', 'anterior_delt', 'lateral_delt', 'triceps', 'triceps_long', 'triceps_lateral', 'triceps_medial'],
  Pull: ['lats', 'mid_back', 'mid_trap', 'upper_trap', 'lower_trap', 'rhomboids', 'erector_spinae', 'teres_major', 'biceps', 'biceps_long', 'biceps_short', 'brachialis', 'posterior_delt'],
  Legs: ['quads_rf', 'quads_vl', 'quads_vmo', 'hamstrings', 'hamstrings_bf', 'hamstrings_semi', 'glute_max', 'glute_med', 'glute_min', 'gastrocnemius', 'soleus'],
  'Upper Body': ['chest', 'chest_upper', 'chest_mid', 'chest_lower', 'shoulders', 'anterior_delt', 'lateral_delt', 'posterior_delt', 'triceps', 'triceps_long', 'triceps_lateral', 'triceps_medial', 'lats', 'mid_back', 'mid_trap', 'upper_trap', 'lower_trap', 'rhomboids', 'erector_spinae', 'teres_major', 'biceps', 'biceps_long', 'biceps_short', 'brachialis'],
  'Full Body': [],
  Chest: ['chest', 'chest_upper', 'chest_mid', 'chest_lower'],
  Back: ['lats', 'mid_back', 'mid_trap', 'upper_trap', 'lower_trap', 'rhomboids', 'erector_spinae', 'teres_major'],
  Shoulders: ['shoulders', 'anterior_delt', 'lateral_delt', 'posterior_delt', 'rotator_cuff'],
  Biceps: ['biceps', 'biceps_long', 'biceps_short', 'brachialis'],
  Triceps: ['triceps', 'triceps_long', 'triceps_lateral', 'triceps_medial'],
  Quads: ['quads_rf', 'quads_vl', 'quads_vmo'],
  Hamstrings: ['hamstrings', 'hamstrings_bf', 'hamstrings_semi'],
  Glutes: ['glute_max', 'glute_med', 'glute_min'],
  Calves: ['gastrocnemius', 'soleus'],
  Forearms: ['forearms'],
}

function goalLabel(g: string | null | undefined): string {
  return (g && GOAL_LABELS[g]) || 'general fitness'
}

function equipmentTier(equipment: string[] | null | undefined): 'full_gym' | 'dumbbells' | 'bodyweight' {
  const eq = (equipment || []).map(e => e.toLowerCase())
  if (eq.length === 0) return 'full_gym'
  if (eq.some(e => e.includes('full gym') || e.includes('barbell') || e.includes('cable') || e.includes('smith') || e.includes('leg press') || e.includes('home gym') || e.includes('bench')))
    return 'full_gym'
  if (eq.some(e => e.includes('dumbbell') || e.includes('kettlebell') || e.includes('band') || e.includes('resistance')))
    return 'dumbbells'
  return 'bodyweight'
}

function filterByEquipment(exercises: ExerciseLite[], equipment: string[] | null | undefined): ExerciseLite[] {
  const tier = equipmentTier(equipment)
  if (tier === 'full_gym') return exercises
  return exercises.filter(e => {
    const need = (e.equipment || []).map(x => String(x).toLowerCase())
    if (need.length === 0 || need.includes('bodyweight')) return true
    if (tier === 'dumbbells' && need.includes('dumbbells_only')) return true
    return false
  })
}

function filterByMuscleGroups(exercises: ExerciseLite[], selectedGroups: string[]): ExerciseLite[] {
  if (!selectedGroups?.length || selectedGroups.includes('Full Body')) return exercises
  const keys = new Set<string>()
  for (const group of selectedGroups) {
    for (const k of (MUSCLE_GROUP_KEYS[group] || [])) keys.add(k)
  }
  if (keys.size === 0) return exercises
  return exercises.filter(e => (e.muscle_groups || []).some(mg => keys.has(mg)))
}

// Three-tier name matching: exact → words-in-db → words-in-returned
function resolveExerciseByName(returnedName: string, allExercises: ExerciseLite[], exerciseMap: Record<string, ExerciseLite>): ExerciseLite | null {
  const key = returnedName.toLowerCase().trim()
  if (exerciseMap[key]) return exerciseMap[key]

  const words = key.split(/\s+/).filter(Boolean)
  let match = allExercises.find(dbEx => {
    const dbKey = dbEx.name.toLowerCase().trim()
    return words.every(w => dbKey.includes(w))
  })
  if (match) return match

  match = allExercises.find(dbEx => {
    const dbWords = dbEx.name.toLowerCase().trim().split(/\s+/).filter(Boolean)
    return dbWords.every(w => key.includes(w))
  })
  return match || null
}

async function fetchEligibleExercises(profile: Profile): Promise<{ eligible: ExerciseLite[]; exerciseMap: Record<string, ExerciseLite> }> {
  const { data, error } = await supabase.from('exercises').select('id, name, muscle_groups, equipment, is_compound')
  if (error) throw error
  const all = (data as ExerciseLite[] | null) || []
  const eligible = filterByEquipment(all, profile.equipment)
  const exerciseMap: Record<string, ExerciseLite> = {}
  eligible.forEach(ex => { exerciseMap[ex.name.toLowerCase().trim()] = ex })
  return { eligible, exerciseMap }
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export function calcNutrition(profile: Profile): { calories: number | null; protein: number | null } {
  const { age, weight_kg, height_cm, fitness_goal, sessions_per_week } = profile
  if (!weight_kg || !height_cm || !age) return { calories: null, protein: null }

  const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  const spw = sessions_per_week ?? 3
  const activityMultiplier = spw <= 2 ? 1.375 : spw <= 4 ? 1.55 : 1.725
  const tdee = bmr * activityMultiplier

  const calorieTarget =
    fitness_goal === 'fat_loss' ? Math.round(tdee * 0.85) :
    fitness_goal === 'muscle_gain' ? Math.round(tdee * 1.1) :
    Math.round(tdee)

  const proteinMultiplier = fitness_goal === 'muscle_gain' ? 2.0 : fitness_goal === 'fat_loss' ? 1.8 : 1.6

  return { calories: calorieTarget, protein: Math.round(weight_kg * proteinMultiplier) }
}

// Derive display-only carb + fat targets from the stored calorie/protein
// targets (profiles has no carb/fat columns). Fat = 25% of calories; carbs
// take the remainder after protein and fat.
export function deriveMacroTargets(calories: number, protein: number): { carbs: number; fat: number } {
  if (!calories) return { carbs: 0, fat: 0 }
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  return { carbs, fat }
}

// ─── Weekly plan by type (Choose Your Split) ──────────────────────────────────

const WEEKLY_PLAN_STRUCTURES: Record<string, { name: string; structure: string[] }> = {
  ppl: {
    name: 'Push Pull Legs',
    structure: [
      'Push Day (Chest, Shoulders, Triceps)',
      'Pull Day (Back, Biceps)',
      'Legs Day (Quads, Hamstrings, Glutes, Calves)',
      'Push Day (Chest, Shoulders, Triceps)',
      'Pull Day (Back, Biceps)',
      'Legs Day (Quads, Hamstrings, Glutes, Calves)',
      'Rest',
    ],
  },
  ppl_ul: {
    name: 'PPL + Upper Lower',
    structure: [
      'Push Day (Chest, Shoulders, Triceps)',
      'Pull Day (Back, Biceps)',
      'Legs Day (Quads, Hamstrings, Glutes, Calves)',
      'Upper Body (Chest, Back, Shoulders, Arms)',
      'Lower Body (Quads, Hamstrings, Glutes, Calves)',
      'Rest',
      'Rest',
    ],
  },
  bro: {
    name: 'Bro Split',
    structure: [
      'Chest & Triceps',
      'Back & Biceps',
      'Shoulders & Traps',
      'Arms (Biceps & Triceps)',
      'Legs (Quads, Hamstrings, Glutes, Calves)',
      'Full Body',
      'Rest',
    ],
  },
  full_body: {
    name: 'Full Body',
    structure: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body'],
  },
}

export async function generateWeeklyPlanByType(userId: string, profile: Profile, planTypeId: string) {
  const planConfig = WEEKLY_PLAN_STRUCTURES[planTypeId]
  if (!planConfig) throw new Error(`Unknown plan type: ${planTypeId}`)

  const { eligible, exerciseMap } = await fetchEligibleExercises(profile)
  const nameList = eligible.map(e => e.name).join('\n')

  const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = new Date()
  const structureList = planConfig.structure
    .map((str, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      return `Day ${i + 1} (${DAY_NAMES_FULL[d.getDay()]}): ${str}`
    })
    .join('\n')

  const prompt = `You are a professional strength and conditioning coach. Generate a personalized 7-day ${planConfig.name} workout plan.

User profile:
- Goal: ${goalLabel(profile.fitness_goal)}
- Experience: ${profile.experience_level}
- Age: ${profile.age ?? 'unknown'}
- Weight: ${profile.weight_kg ? profile.weight_kg + 'kg' : 'unknown'}
- Injuries or limitations: ${profile.injuries || 'None'}

Plan structure (Day 1 = today):
${structureList}

AVAILABLE EXERCISES (use ONLY these exact names, spelled exactly as shown):
${nameList}

Return ONLY valid JSON with no markdown. Exact structure:
{"planName":"string","days":[{"dayOrder":1,"dayName":"string","isRest":false,"explanation":null,"exercises":[{"exerciseName":"string","sets":3,"repRange":"8-12","note":null}]}]}

Rules:
- Include exactly 7 days, dayOrder 1-7
- Rest days: set isRest to true, exercises to [], and explanation to null
- Training days: 4-7 exercises matching the day's session type
- Use only exercises from the provided list
- Avoid exercises that could aggravate: ${profile.injuries || 'none'}
- Match rep ranges to goal: strength 4-6 reps, hypertrophy 6-12 reps, endurance 12-20 reps
- dayName must be the session type shown after the colon in the plan structure (e.g. "Push Day", "Pull Day", "Legs Day", "Full Body") — never the calendar day name in parentheses
- note field: short string if exercise was modified due to injuries, otherwise null
- explanation field: for training days only, 2-3 sentences in plain conversational language — what muscles this session targets and why it fits the user's goal, plus any specific accommodations made for the user's injuries (skip injury mention if none listed)`

  const plan = await callAI(prompt) as unknown as {
    planName: string
    days: { dayOrder: number; dayName: string; isRest: boolean; explanation?: string | null; exercises: { exerciseName: string; sets: number; repRange: string; note?: string | null }[] }[]
  }

  // Single active plan per user — replace any existing one
  await supabase.from('workout_plans').delete().eq('user_id', userId)

  const planInsert = await (supabase.from('workout_plans') as any)
    .insert({ user_id: userId, name: plan.planName, plan_type: PLAN_TYPE_DB[planTypeId] ?? null, generated_by: 'ai', active: true })
    .select().single()
  if (planInsert.error) throw planInsert.error
  const savedPlan = planInsert.data as { id: string }

  for (const day of plan.days) {
    const exercises: PlanDayExercise[] = day.isRest ? [] : (day.exercises || [])
      .map(e => {
        const match = resolveExerciseByName(e.exerciseName, eligible, exerciseMap)
        if (!match) { console.warn('Weekly plan: could not match exercise:', e.exerciseName); return null }
        return { exercise_id: match.id, exercise_name: match.name, sets: e.sets, reps: e.repRange, note: e.note || null }
      })
      .filter((e): e is PlanDayExercise => e !== null)

    const exercisesJson: PlanDayJson = { exercises, explanation: day.explanation || null, is_rest: !!day.isRest }

    await (supabase.from('plan_days') as any).insert({
      plan_id: savedPlan.id,
      day_number: day.dayOrder,
      name: day.dayName,
      exercises: exercisesJson,
    })
  }

  return savedPlan
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

export function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const d = new Date(now)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// ─── One-off AI session (Generate with AI modal) ──────────────────────────────

interface SessionPreferences {
  muscleGroups: string[]
  minutes: number
  feeling: string
}

export interface ProcessedExercise {
  exercise: ExerciseLite
  sets: number
  repRange: string
  targetRPE: number | null
  notes: string | null
}

export async function generateSessionFromPreferences(userId: string, profile: Profile, preferences: SessionPreferences) {
  const { data, error } = await supabase.from('exercises').select('id, name, muscle_groups, equipment, is_compound')
  if (error) throw error
  const all = (data as ExerciseLite[] | null) || []
  const equipFiltered = filterByEquipment(all, profile.equipment)
  const eligible = filterByMuscleGroups(equipFiltered, preferences.muscleGroups)

  const nameList = eligible.map(e => e.name).join('\n')
  const exerciseMap: Record<string, ExerciseLite> = {}
  eligible.forEach(ex => { exerciseMap[ex.name.toLowerCase().trim()] = ex })

  type SessRow = { id: string; date: string }
  type SetRow = { session_id: string; exercise_id: string | null; weight_kg: number | null; reps: number | null }
  type ExRow = { id: string; name: string }
  type VolRow = { muscle_group: string; sets_count: number | null }

  const sessRes = await supabase.from('sessions').select('id, date').eq('user_id', userId).order('date', { ascending: false }).limit(5)
  const sessionRows = sessRes.data as SessRow[] | null

  let recentSessionsSummary = '  No previous sessions.'
  if (sessionRows && sessionRows.length > 0) {
    const sessionIds = sessionRows.map(s => s.id)
    const setsRes = await supabase.from('session_sets').select('session_id, exercise_id, weight_kg, reps').in('session_id', sessionIds).eq('completed', true)
    const sets = setsRes.data as SetRow[] | null

    const exIds = [...new Set((sets || []).map(s => s.exercise_id).filter((id): id is string => id !== null))]
    const exMap: Record<string, string> = {}
    if (exIds.length > 0) {
      const exsRes = await supabase.from('exercises').select('id, name').in('id', exIds)
      const exs = exsRes.data as ExRow[] | null
      exs?.forEach(e => { exMap[e.id] = e.name })
    }

    const lines = sessionRows.map(sess => {
      const sessSets = (sets || []).filter(s => s.session_id === sess.id)
      const byEx: Record<string, { name: string; max: number }> = {}
      sessSets.forEach(s => {
        const exId = s.exercise_id ?? ''
        if (!byEx[exId]) byEx[exId] = { name: exMap[exId] ?? 'Unknown', max: 0 }
        byEx[exId].max = Math.max(byEx[exId].max, s.weight_kg || 0)
      })
      const exStr = Object.values(byEx).map(e => `${e.name}: ${e.max}kg`).join(', ')
      return `  ${sess.date}: ${exStr || 'No sets recorded'}`
    })
    recentSessionsSummary = lines.join('\n')
  }

  const weekStart = getWeekStart()
  const volRes = await supabase.from('muscle_volume_log').select('muscle_group, sets_count').eq('user_id', userId).eq('week_start', weekStart)
  const volRows = volRes.data as VolRow[] | null
  const volSummary = (volRows || []).length > 0
    ? (volRows || []).map(r => `  ${r.muscle_group}: ${r.sets_count} sets`).join('\n')
    : '  None yet this week'

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = new Date().toISOString().split('T')[0]
  const muscleGroupsStr = (preferences.muscleGroups || []).join(', ') || 'Full Body'

  const prompt = `You are an expert strength and conditioning coach. Generate a complete workout session with specific sets, reps, and starting weights for every exercise. Use the user data below to make every value realistic and appropriate.

USER PROFILE:
- Age: ${profile.age ?? 'unknown'}
- Body weight: ${profile.weight_kg ? profile.weight_kg + 'kg' : 'unknown'}
- Height: ${profile.height_cm ? profile.height_cm + 'cm' : 'unknown'}
- Goal: ${goalLabel(profile.fitness_goal)}
- Experience: ${profile.experience_level}
- Injuries/limitations: ${profile.injuries || 'none'}

SESSION PREFERENCES:
- Muscle groups to train: ${muscleGroupsStr}
- Time available: ${preferences.minutes} minutes
- Energy level today: ${preferences.feeling}

TODAY: ${dayName}, ${dateStr}

RECENT TRAINING HISTORY (last 5 sessions):
${recentSessionsSummary}

THIS WEEK'S VOLUME SO FAR:
${volSummary}

AVAILABLE EXERCISES (use ONLY these exact names, spelled exactly as shown):
${nameList}

RULES FOR GENERATING SETS, REPS, AND RPE:
1. For goal = muscle_gain: 3-4 sets of 8-12 reps, RPE 7-8
2. For goal = fat_loss: 3-4 sets of 12-15 reps, RPE 6-7
3. For goal = general_fitness: 3 sets of 10-15 reps, RPE 6-8
4. For feeling = tired: reduce sets by 1, use lower end of rep range, reduce RPE by 1
5. For feeling = fresh: use top of rep range and normal RPE
6. Never include exercises that load the injured area: ${profile.injuries || 'none'}
7. Do not exceed ${preferences.minutes} minutes total. Estimate 3 minutes per set including rest.
8. Do not train muscle groups that already exceed their weekly volume target.
9. targetRPE is a number 1-10. Must be between 5 and 10.

Return ONLY a valid JSON object with no markdown, no backticks, no explanation. Exact structure:
{"sessionName":"string","estimatedDuration":number,"explanation":"string","exercises":[{"exerciseName":"string","sets":number,"repRange":"string","targetRPE":number,"notes":"string"}]}

explanation field: 2-3 sentences in plain conversational language — what muscles this session targets and why, plus any specific accommodations made for the user's injuries (skip injury mention if none listed).`

  const result = await callAI(prompt) as unknown as {
    sessionName: string
    estimatedDuration: number
    explanation?: string
    exercises: { exerciseName: string; sets: number; repRange: string; targetRPE?: number; notes?: string }[]
  }

  const processedExercises = (result.exercises || [])
    .map((ex): ProcessedExercise | null => {
      const match = resolveExerciseByName(ex.exerciseName, eligible, exerciseMap)
      if (!match) { console.warn('Could not match exercise:', ex.exerciseName); return null }
      return { exercise: match, sets: ex.sets || 3, repRange: ex.repRange || '8-12', targetRPE: ex.targetRPE ?? null, notes: ex.notes || null }
    })
    .filter((e): e is ProcessedExercise => e !== null)

  if (processedExercises.length === 0) {
    throw new Error('Could not match generated exercises to the database. Please try again.')
  }

  // No DB insert here — the live tracker (WorkoutPage) creates the real session
  // row when the user finishes, so an abandoned generation leaves no trace.
  return { exercises: processedExercises, sessionName: result.sessionName || 'AI Session', explanation: result.explanation || null }
}
