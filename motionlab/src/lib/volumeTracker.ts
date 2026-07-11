import { supabase } from './supabase'
import { getWeekStart } from './workoutPlan'

// 12-group taxonomy (matches muscle_volume_log's CHECK after migration 011 and
// the dashboard heatmap's body-muscles ID mappings). Order here drives the
// order the heatmap "This week" list renders in. Narrower than
// exercises.muscle_groups' full granularity (~37 values) — mapToVolumeGroup
// collapses the granular keys into these buckets.
export const VOLUME_THRESHOLDS = {
  chest: { min: 10, max: 20 },
  shoulders: { min: 8, max: 16 },
  triceps: { min: 10, max: 14 },
  lats: { min: 12, max: 20 },
  mid_back: { min: 10, max: 16 },
  biceps: { min: 10, max: 14 },
  abs: { min: 8, max: 16 },
  quads: { min: 12, max: 20 },
  hamstrings: { min: 10, max: 16 },
  glutes: { min: 10, max: 16 },
  calves: { min: 10, max: 16 },
  forearms: { min: 6, max: 12 },
}

type VolumeThresholdKey = keyof typeof VOLUME_THRESHOLDS

export function mapToVolumeGroup(mgRaw: unknown): VolumeThresholdKey | null {
  if (!mgRaw) return null
  const mg = String(mgRaw).toLowerCase()
  if (mg in VOLUME_THRESHOLDS) return mg as VolumeThresholdKey

  if (mg.startsWith('chest')) return 'chest'
  if (mg.includes('delt') || mg.includes('rotator')) return 'shoulders'
  if (mg.startsWith('triceps')) return 'triceps'
  if (mg === 'lats') return 'lats'
  if (mg === 'mid_back' || mg.includes('trap') || mg.startsWith('rhomboid') || mg.startsWith('erector') || mg.startsWith('teres')) return 'mid_back'
  if (mg.startsWith('biceps') || mg.startsWith('brachialis')) return 'biceps'
  if (mg === 'core' || mg === 'abdominals' || mg === 'obliques' || mg === 'rectus_abdominis' || mg === 'transverse_abdominis' || mg === 'serratus' || mg.startsWith('abs') || mg.startsWith('core') || mg.startsWith('abdom')) return 'abs'
  if (mg.startsWith('quads')) return 'quads'
  if (mg.startsWith('hamstrings')) return 'hamstrings'
  if (mg.startsWith('glute')) return 'glutes'
  if (mg.startsWith('gastrocnemius') || mg.startsWith('soleus') || mg.startsWith('calf') || mg.startsWith('calves')) return 'calves'
  if (mg.startsWith('forearm') || mg.startsWith('brachioradialis') || mg.startsWith('pronator') || mg.startsWith('supinator') || mg.startsWith('flexor') || mg.startsWith('extensor')) return 'forearms'

  return null
}

export function getVolumeStatus(muscleGroup: string, totalSets: number): string {
  const t = VOLUME_THRESHOLDS[muscleGroup as VolumeThresholdKey]
  if (!t) return 'none'
  if (totalSets === 0) return 'none'
  if (totalSets < t.min) return 'low'
  if (totalSets <= t.max) return 'optimal'
  return 'high'
}

function getWeekStartForDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

interface SetWithMuscles {
  muscle_groups?: string[]
}

export interface VolumeRow {
  muscle_group: string
  sets_count: number
  updated_at: string | null
}

type ExistingRow = { sets_count: number | null } | null

export async function updateVolumeLog(userId: string, sets: SetWithMuscles[], dateStr: string | null = null): Promise<void> {
  if (!sets || sets.length === 0) return

  const weekStart = dateStr ? getWeekStartForDate(dateStr) : getWeekStart()
  const counts: Record<string, number> = {}
  sets.forEach(set => {
    (set.muscle_groups || []).forEach(mg => {
      const mapped = mapToVolumeGroup(mg)
      if (!mapped) return
      counts[mapped] = (counts[mapped] || 0) + 1
    })
  })

  await Promise.all(
    Object.entries(counts).map(async ([mg, count]) => {
      const res = await supabase.from('muscle_volume_log').select('sets_count').eq('user_id', userId).eq('week_start', weekStart).eq('muscle_group', mg).maybeSingle()
      const existing = res.data as ExistingRow

      await supabase.from('muscle_volume_log').upsert({
        user_id: userId,
        week_start: weekStart,
        muscle_group: mg,
        sets_count: (existing?.sets_count || 0) + count,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,week_start,muscle_group' })
    })
  )
}

// Reverse of updateVolumeLog — used when editing/deleting a logged session so
// its sets don't stay double-counted. Never goes below 0; skips groups with no
// existing row.
export async function subtractVolumeLog(userId: string, sets: SetWithMuscles[], dateStr: string | null = null): Promise<void> {
  if (!sets || sets.length === 0) return

  const weekStart = dateStr ? getWeekStartForDate(dateStr) : getWeekStart()
  const counts: Record<string, number> = {}
  sets.forEach(set => {
    (set.muscle_groups || []).forEach(mg => {
      const mapped = mapToVolumeGroup(mg)
      if (!mapped) return
      counts[mapped] = (counts[mapped] || 0) + 1
    })
  })

  await Promise.all(
    Object.entries(counts).map(async ([mg, count]) => {
      const res = await supabase.from('muscle_volume_log').select('sets_count').eq('user_id', userId).eq('week_start', weekStart).eq('muscle_group', mg).maybeSingle()
      const existing = res.data as ExistingRow
      if (!existing) return

      await supabase.from('muscle_volume_log').upsert({
        user_id: userId,
        week_start: weekStart,
        muscle_group: mg,
        sets_count: Math.max(0, (existing.sets_count || 0) - count),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,week_start,muscle_group' })
    })
  )
}

// Directly set a group's weekly sets (heatmap EditPanel ± / presets).
export async function setVolumeManual(userId: string, muscleGroup: string, totalSets: number): Promise<void> {
  const weekStart = getWeekStart()
  await supabase.from('muscle_volume_log').upsert({
    user_id: userId,
    week_start: weekStart,
    muscle_group: muscleGroup,
    sets_count: Math.max(0, totalSets),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,week_start,muscle_group' })
}

export async function getWeeklyVolume(userId: string): Promise<VolumeRow[]> {
  const weekStart = getWeekStart()
  const res = await supabase.from('muscle_volume_log').select('muscle_group, sets_count, updated_at').eq('user_id', userId).eq('week_start', weekStart)
  return (res.data as VolumeRow[] | null) || []
}
