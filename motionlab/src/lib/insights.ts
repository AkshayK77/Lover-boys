import { supabase } from './supabase'
import { callAgent, parseAgentJSON } from './ai'
import { getWeeklyVolume, VOLUME_THRESHOLDS } from './volumeTracker'
import { checkDeload } from './deloadDetector'

export type FlagSeverity = 'info' | 'warning' | 'success'
export interface Flag { message: string; severity: FlagSeverity }

export const PR_STORAGE_KEY = 'motionlab_new_prs'
const PR_TTL_MS = 24 * 60 * 60 * 1000

// PR flags written by WorkoutPage on session finish — always shown, 24h TTL.
export function getPrFlags(): Flag[] {
  try {
    const stored = localStorage.getItem(PR_STORAGE_KEY)
    if (!stored) return []
    const { prs, timestamp } = JSON.parse(stored) as { prs: { name: string; newMax: number; reps?: number }[]; timestamp: number }
    if (Date.now() - timestamp >= PR_TTL_MS) return []
    return (prs || []).map(pr => ({
      severity: 'success' as const,
      message: `New PR: ${pr.name} — ${pr.newMax}kg${pr.reps ? ' × ' + pr.reps + ' reps' : ''}`,
    }))
  } catch { return [] }
}

// Days from today until the next occurrence of a weekly day_of_week (0=Sun..6=Sat).
function daysUntil(dayOfWeek: number): number {
  const todayDow = new Date().getDay()
  return (dayOfWeek - todayDow + 7) % 7
}

// Rule-based fallback when the AI is unavailable or returns nothing.
async function buildLocalFlags(userId: string): Promise<Flag[]> {
  const result: Flag[] = []

  const [volumeRows, deload, scheduleRes] = await Promise.all([
    getWeeklyVolume(userId),
    checkDeload(userId),
    supabase.from('sport_schedules').select('sport, day_of_week, time').eq('user_id', userId).eq('active', true),
  ])

  const volumeMap: Record<string, { sets_count: number; updated_at: string | null }> = {}
  volumeRows.forEach(r => { volumeMap[r.muscle_group] = { sets_count: r.sets_count, updated_at: r.updated_at } })

  // Untrained / stale muscle groups (cap to 2 so the list stays focused)
  let muscleWarnings = 0
  for (const mg of Object.keys(VOLUME_THRESHOLDS)) {
    if (muscleWarnings >= 2) break
    const row = volumeMap[mg]
    const sets = row?.sets_count || 0
    if (sets === 0) {
      result.push({ severity: 'warning', message: `Your ${mg.replace(/_/g, ' ')} hasn't been trained this week.` })
      muscleWarnings++
    } else if (row?.updated_at) {
      const daysSince = (Date.now() - new Date(row.updated_at).getTime()) / 86400000
      if (daysSince > 8) {
        result.push({ severity: 'warning', message: `${mg.replace(/_/g, ' ')} hasn't been trained in ${Math.floor(daysSince)} days.` })
        muscleWarnings++
      }
    }
  }

  // Upcoming sport sessions (next 2 days) → prompt a sport-specific warmup
  const schedule = (scheduleRes.data as { sport: string; day_of_week: number; time: string | null }[] | null) || []
  const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (const s of schedule) {
    const d = daysUntil(s.day_of_week)
    if (d <= 2) {
      const when = d === 0 ? 'today' : d === 1 ? 'tomorrow' : `on ${DOW[s.day_of_week]}`
      result.push({ severity: 'info', message: `You have ${s.sport} ${when}${s.time ? ' at ' + s.time : ''} — generate a sport-specific warmup to prep.` })
    }
  }

  // Consistency + deload
  if (deload.weeksCount >= 3 && !deload.deloadDue) {
    result.push({ severity: 'success', message: `${deload.weeksCount} consecutive weeks hitting your training target — great consistency.` })
  }
  if (deload.deloadDue) {
    result.push({ severity: 'warning', message: `You're on week ${deload.weeksCount} of progressive loading — consider a deload next week. Reduce weights to ~60% and volume by ~40%.` })
  }

  return result.slice(0, 4)
}

// 3-tier: daily cache → AI (flags mode) → local rules. PRs always prepend.
export async function loadInsights(userId: string, forceRefresh = false): Promise<Flag[]> {
  const prFlags = getPrFlags()
  const today = new Date().toISOString().split('T')[0]
  const cacheKey = `motionlab_flags_${userId}_${today}`

  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { flags } = JSON.parse(cached) as { flags: Flag[] }
        if (Array.isArray(flags) && flags.length > 0) return [...prFlags, ...flags]
      }
    } catch { /* ignore corrupt cache */ }
  }

  try {
    const text = await callAgent(userId, '', 'flags')
    const parsed = parseAgentJSON(text)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const flags = (parsed as Flag[]).filter(f => f && typeof f.message === 'string')
      if (flags.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({ flags }))
        return [...prFlags, ...flags]
      }
    }
  } catch { /* fall through to local */ }

  return [...prFlags, ...(await buildLocalFlags(userId))]
}
