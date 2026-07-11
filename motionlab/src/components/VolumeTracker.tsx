import { useState, useEffect } from 'react'
import { getWeeklyVolume, getVolumeStatus, VOLUME_THRESHOLDS } from '@/lib/volumeTracker'

type VolumeStatus = 'none' | 'low' | 'optimal' | 'high'

interface VolumeRow {
  muscle_group: string
  sets_count: number
  updated_at: string | null
}

const STATUS_COLORS: Record<VolumeStatus, string> = {
  none: '#555555', low: '#f5a623', optimal: '#C8F55A', high: '#ff5c5c',
}
const STATUS_BAR_COLORS: Record<VolumeStatus, string> = {
  none: 'rgba(85,85,85,0.3)', low: 'rgba(245,166,35,0.5)', optimal: 'rgba(200,245,90,0.6)', high: 'rgba(255,92,92,0.55)',
}

const ALL_MUSCLE_GROUPS = Object.keys(VOLUME_THRESHOLDS)

export default function VolumeTracker({ userId }: { userId: string }) {
  const [volumeMap, setVolumeMap] = useState<Record<string, VolumeRow>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    getWeeklyVolume(userId).then(rows => {
      const map: Record<string, VolumeRow> = {}
      rows.forEach(r => { map[r.muscle_group] = r as VolumeRow })
      setVolumeMap(map)
      setLoading(false)
    })
  }, [userId])

  if (loading) {
    return <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>Loading volume data…</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {ALL_MUSCLE_GROUPS.map(mg => {
        const sets = volumeMap[mg]?.sets_count || 0
        const status = getVolumeStatus(mg, sets) as VolumeStatus
        const t = VOLUME_THRESHOLDS[mg as keyof typeof VOLUME_THRESHOLDS]
        const pct = Math.min(sets / t.max, 1)
        const minPct = t.min / t.max

        return (
          <div key={mg} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[status], flexShrink: 0 }} />
            <div style={{ width: '110px', flexShrink: 0, fontSize: '13px', textTransform: 'capitalize', color: 'rgba(255,255,255,0.75)' }}>
              {mg.replace(/_/g, ' ')}
            </div>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: `${minPct * 100}%`, right: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: STATUS_BAR_COLORS[status], borderRadius: '2px', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ width: '80px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
              {sets} sets · {t.min}–{t.max}
            </div>
          </div>
        )
      })}
    </div>
  )
}
