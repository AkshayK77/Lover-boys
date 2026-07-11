import { supabase } from './supabase'
import { callAgent } from './ai'

function thisMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`
}

function prevWeekStart() {
  const mon = new Date(thisMonday() + 'T12:00:00')
  mon.setDate(mon.getDate() - 7)
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`
}

function prevWeekEnd() {
  const mon = new Date(prevWeekStart() + 'T12:00:00')
  mon.setDate(mon.getDate() + 6)
  return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`
}

// Cached in localStorage. Regenerated only when it's Monday and the cache
// predates this Monday, or when no cache exists at all.
export async function maybeGenerateWeeklySummary(userId: string): Promise<string | null> {
  const today = new Date().toISOString().split('T')[0]
  const isMonday = new Date().getDay() === 1
  const cachedDate = localStorage.getItem('ml_last_summary_date')
  const cachedSummary = localStorage.getItem('ml_last_weekly_summary')

  if (cachedDate && cachedSummary) {
    const cacheIsFromThisWeek = cachedDate >= thisMonday()
    if (!isMonday || cacheIsFromThisWeek) return cachedSummary
  }

  const from = prevWeekStart()
  const to = prevWeekEnd()

  type VolumeRowW = { muscle_group: string; sets_count: number | null }
  type WeightRow = { date: string; weight_kg: number | null }
  type ProfileRow = { protein_target: number | null; fitness_goal: string | null }
  type MealRow = { protein_g: number | null }

  const [sessRes, volRes, weightsRes, profileRes, mealsRes] = await Promise.all([
    supabase.from('sessions').select('id').eq('user_id', userId).gte('date', from).lte('date', to),
    supabase.from('muscle_volume_log').select('muscle_group, sets_count').eq('user_id', userId).eq('week_start', from),
    supabase.from('measurements').select('date, weight_kg').eq('user_id', userId).gte('date', from).lte('date', to).not('weight_kg', 'is', null).order('date'),
    supabase.from('profiles').select('protein_target, fitness_goal').eq('id', userId).single(),
    supabase.from('meal_history').select('protein_g').eq('user_id', userId).gte('logged_date', from).lte('logged_date', to),
  ])

  const sessions = sessRes.data as Array<{ id: string }> | null
  const volumeRows = volRes.data as VolumeRowW[] | null
  const weights = (weightsRes.data as WeightRow[] | null) || []
  const profile = profileRes.data as ProfileRow | null
  const meals = mealsRes.data as MealRow[] | null

  const totalSessions = (sessions || []).length
  const muscleVolume = Object.fromEntries((volumeRows || []).map(r => [r.muscle_group.replace(/_/g, ' '), r.sets_count]))
  const avgDailyProtein = (meals || []).length ? Math.round((meals || []).reduce((s, m) => s + (m.protein_g || 0), 0) / 7) : 0
  const proteinTarget = profile?.protein_target || 0
  const weightChange = weights.length >= 2
    ? +(parseFloat(String(weights[weights.length - 1].weight_kg)) - parseFloat(String(weights[0].weight_kg))).toFixed(1)
    : null

  // Nothing happened last week — don't fabricate a summary.
  if (totalSessions === 0 && (volumeRows || []).length === 0) return null

  const weekData = {
    weekOf: from,
    goal: profile?.fitness_goal ?? 'general_fitness',
    totalSessions,
    muscleVolume,
    avgDailyProtein,
    proteinTarget,
    weightChange: weightChange !== null ? (weightChange >= 0 ? `+${weightChange}kg` : `${weightChange}kg`) : 'not tracked',
  }

  const message = `Generate a weekly fitness summary for this user based on last week's data: ${JSON.stringify(weekData)}. Be encouraging but honest. Keep it to 4-5 sentences.`
  const summary = await callAgent(userId, message)

  if (summary) {
    localStorage.setItem('ml_last_summary_date', today)
    localStorage.setItem('ml_last_weekly_summary', summary)
    return summary
  }
  return null
}
