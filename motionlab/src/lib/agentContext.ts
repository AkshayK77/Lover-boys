import { supabase } from './supabase'
import { getWeekStart } from './workoutPlan'
import { checkDeload } from './deloadDetector'
import type { Profile } from '@/types'

const DOW_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface SetEntry {
  set: number
  weight_kg: number | null
  reps: number | null
}

interface SessionSummary {
  date: string
  duration: number | null
  exercises: { name: string; sets: SetEntry[] }[]
}

interface TodayDay {
  dayName: string
  exercises: string[]
}

interface TodayNutrition {
  calories: number
  protein: number
  calorieTarget: number | null
  proteinTarget: number | null
}

interface SportSession {
  sport: string
  day: string
  time: string | null
}

interface LearningProgress {
  completedLessons: number
  recentLessons: string[]
}

export interface AgentContext {
  profile: Partial<Profile> | null
  recentSessions: SessionSummary[]
  weeklyVolume: { muscle_group: string; sets_count: number | null; updated_at: string | null }[]
  todayNutrition: TodayNutrition
  todayDay: TodayDay | null
  sportSchedule: SportSession[]
  learning: LearningProgress
  deload: { deloadDue: boolean; weeksCount: number }
}

export function estimateTokenCount(context: object): number {
  return Math.round(JSON.stringify(context).length / 4)
}

function todayLocalStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface PlanDayJson {
  exercises?: { exercise_name?: string }[]
  is_rest?: boolean
}

export async function buildAgentContext(userId: string): Promise<AgentContext> {
  const today = todayLocalStr()
  const weekStart = getWeekStart()

  type SessionRow = { id: string; date: string; duration: number | null }
  type VolumeRow = { muscle_group: string; sets_count: number | null; updated_at: string | null }
  type MealRow = { protein_g: number | null; calories: number | null }
  type PlanDayRow = { day_number: number; name: string | null; exercises: PlanDayJson | null }

  type ScheduleRow = { sport: string; day_of_week: number; time: string | null }
  type LessonProgRow = { lesson_id: string; completion_date: string | null }

  const [profileRes, sessionRes, volumeRes, mealRes, planResult, scheduleRes, lessonRes, deload] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('sessions').select('id, date, duration').eq('user_id', userId).order('date', { ascending: false }).limit(10),
    supabase.from('muscle_volume_log').select('muscle_group, sets_count, updated_at').eq('user_id', userId).eq('week_start', weekStart),
    supabase.from('meal_history').select('protein_g, calories').eq('user_id', userId).eq('logged_date', today),
    supabase.from('workout_plans').select('id, name, plan_days(day_number, name, exercises)').eq('user_id', userId).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('sport_schedules').select('sport, day_of_week, time').eq('user_id', userId).eq('active', true),
    supabase.from('lesson_progress').select('lesson_id, completion_date').eq('user_id', userId).eq('completed', true).order('completion_date', { ascending: false }).limit(10),
    checkDeload(userId),
  ])

  // Strip non-essential PII before the profile leaves our DB for the LLM.
  // id/email/avatar/timestamps add nothing to coaching; name is reduced to a
  // first name. injuries + dietary_notes are kept — the coach needs them for
  // safe advice.
  const PROFILE_OMIT = new Set(['id', 'email', 'avatar_url', 'created_at', 'onboarding_complete', 'deload_suggested_at'])
  const profileRaw = profileRes.data as Profile | null
  const profile: Partial<Profile> | null = profileRaw
    ? (() => {
        const obj = Object.fromEntries(
          Object.entries(profileRaw).filter(([k, v]) => v !== null && v !== undefined && !PROFILE_OMIT.has(k)),
        ) as Partial<Profile>
        if (obj.name) obj.name = String(obj.name).split(' ')[0]
        return obj
      })()
    : null

  const recentSessionRows = ((sessionRes.data as SessionRow[] | null) || []).slice(0, 7)
  const volumeRows = volumeRes.data as VolumeRow[] | null
  const meals = mealRes.data as MealRow[] | null

  const filteredVolume = (volumeRows || []).filter(r => (r.sets_count ?? 0) > 0)

  // Enrich sessions with sets and exercise names
  let recentSessions: SessionSummary[] = []
  if (recentSessionRows.length > 0) {
    const sessionIds = recentSessionRows.map(s => s.id)
    type SetRow = { session_id: string; exercise_id: string | null; set_number: number; weight_kg: number | null; reps: number | null }
    const setsRes = await supabase.from('session_sets').select('session_id, exercise_id, set_number, weight_kg, reps').in('session_id', sessionIds).eq('completed', true).order('set_number')
    const sets = setsRes.data as SetRow[] | null

    const exerciseIds = [...new Set((sets || []).map(s => s.exercise_id).filter((id): id is string => id !== null))]
    const exerciseMap: Record<string, { id: string; name: string }> = {}
    if (exerciseIds.length > 0) {
      const exercisesRes = await supabase.from('exercises').select('id, name').in('id', exerciseIds)
      const exercises = exercisesRes.data as Array<{ id: string; name: string }> | null
      exercises?.forEach(e => { exerciseMap[e.id] = e })
    }

    recentSessions = recentSessionRows.map(sess => {
      const sessSets = (sets || []).filter(s => s.session_id === sess.id)
      const byEx: Record<string, { name: string; sets: SetEntry[] }> = {}
      sessSets.forEach(s => {
        const exId = s.exercise_id ?? ''
        if (!byEx[exId]) byEx[exId] = { name: exerciseMap[exId]?.name ?? exId, sets: [] }
        byEx[exId].sets.push({ set: s.set_number, weight_kg: s.weight_kg, reps: s.reps })
      })
      return {
        date: sess.date,
        duration: sess.duration,
        exercises: Object.values(byEx).map(ex => ({ ...ex, sets: ex.sets.slice(-10) })),
      }
    })
  }

  // Today's scheduled plan day (by weekday: Mon=1 … Sun=7)
  let todayDay: TodayDay | null = null
  if (planResult.data) {
    const planData = planResult.data as { id: string; name: string; plan_days: PlanDayRow[] }
    const days = (planData.plan_days || []).sort((a, b) => a.day_number - b.day_number)
    const dowMon1 = ((new Date().getDay() + 6) % 7) + 1
    const day = days.find(d => d.day_number === dowMon1) ?? days[0]
    if (day && !day.exercises?.is_rest) {
      const names = (day.exercises?.exercises || []).map(e => e.exercise_name || '').filter(Boolean)
      todayDay = { dayName: day.name || `Day ${day.day_number}`, exercises: names }
    }
  }

  const todayNutrition: TodayNutrition = {
    calories: Math.round((meals || []).reduce((s, m) => s + (m.calories || 0), 0)),
    protein: Math.round((meals || []).reduce((s, m) => s + (m.protein_g || 0), 0)),
    calorieTarget: profileRaw?.calorie_target ?? null,
    proteinTarget: profileRaw?.protein_target ?? null,
  }

  // Sport schedule (drives warmup/recovery insights)
  const sportSchedule: SportSession[] = ((scheduleRes.data as ScheduleRow[] | null) || []).map(r => ({
    sport: r.sport,
    day: DOW_LABELS[r.day_of_week] ?? `Day ${r.day_of_week}`,
    time: r.time,
  }))

  // Learning progress — titles are best-effort (no lessons seeded yet)
  const lessonRows = (lessonRes.data as LessonProgRow[] | null) || []
  let recentLessons: string[] = []
  if (lessonRows.length > 0) {
    const lessonIds = lessonRows.map(r => r.lesson_id)
    const titlesRes = await supabase.from('lessons').select('id, title').in('id', lessonIds)
    const titleMap: Record<string, string> = {}
    ;((titlesRes.data as { id: string; title: string }[] | null) || []).forEach(l => { titleMap[l.id] = l.title })
    recentLessons = lessonRows.map(r => titleMap[r.lesson_id]).filter(Boolean).slice(0, 5)
  }
  const learning: LearningProgress = { completedLessons: lessonRows.length, recentLessons }

  const context: AgentContext = { profile, recentSessions, weeklyVolume: filteredVolume, todayNutrition, todayDay, sportSchedule, learning, deload }

  if (estimateTokenCount(context) > 6000) {
    context.recentSessions = recentSessions.slice(0, 3)
  }

  return context
}
