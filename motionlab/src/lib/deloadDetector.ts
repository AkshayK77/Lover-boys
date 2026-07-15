import { supabase } from './supabase'
import { getWeekStart } from './workoutPlan'

// Returns the Monday date string for an arbitrary date (local)
function weekStartFor(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// A user is "due for a deload" after ≥5 consecutive fully-past weeks that each
// hit their weekly session target. motionlab has no completed_at — every logged
// session counts as completed.
export async function checkDeload(userId: string): Promise<{ deloadDue: boolean; weeksCount: number }> {
  const [profileRes, sessionsRes] = await Promise.all([
    supabase.from('profiles').select('sessions_per_week').eq('id', userId).single(),
    supabase.from('sessions').select('date').eq('user_id', userId).order('date', { ascending: false }).limit(100),
  ])

  const profile = profileRes.data as { sessions_per_week: number | null } | null
  const sessions = sessionsRes.data as Array<{ date: string }> | null

  if (!profile || !sessions || sessions.length === 0) {
    return { deloadDue: false, weeksCount: 0 }
  }

  const sessionsPerWeek = profile.sessions_per_week || 3

  const byWeek: Record<string, number> = {}
  sessions.forEach(s => {
    const wk = weekStartFor(s.date)
    byWeek[wk] = (byWeek[wk] || 0) + 1
  })

  const currentWeek = getWeekStart()
  const completedWeeks = Object.entries(byWeek)
    .filter(([wk]) => wk < currentWeek)
    .sort((a, b) => b[0].localeCompare(a[0]))

  let consecutive = 0
  let prevWeek: string | null = null

  for (const [wk, count] of completedWeeks) {
    if (count < sessionsPerWeek) break
    if (prevWeek !== null) {
      const gap = (new Date(prevWeek + 'T12:00:00').getTime() - new Date(wk + 'T12:00:00').getTime()) / 86400000
      if (Math.round(gap) !== 7) break
    }
    consecutive++
    prevWeek = wk
  }

  return { deloadDue: consecutive >= 5, weeksCount: consecutive }
}

export async function markDeloadSuggested(userId: string): Promise<void> {
  const { error } = await (supabase.from('profiles') as any)
    .update({ deload_suggested_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) console.error('markDeloadSuggested failed:', error.message)
}
