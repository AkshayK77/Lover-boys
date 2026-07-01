import { Trophy, Ruler, TrendingUp, TrendingDown } from 'lucide-react'
import { PillTag, NodeLine } from '@/components/ui/FuturisticElements'

// UI-only shell. Sample data is static placeholder — weekly volume, body
// measurements and PR history get wired to Supabase in a later phase.

function Card({ title, badge, children, className }: { title: string; badge?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] p-5 flex flex-col ${className ?? ''}`}
      style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-white/80 text-sm">{title}</h2>
        {badge && (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: '#8a9c4a', background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.15)' }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// sets vs. weekly target per muscle group (sample)
const VOLUME = [
  { group: 'Chest', sets: 14, target: 16 },
  { group: 'Back', sets: 18, target: 18 },
  { group: 'Shoulders', sets: 11, target: 14 },
  { group: 'Quads', sets: 16, target: 18 },
  { group: 'Hamstrings', sets: 8, target: 14 },
  { group: 'Biceps', sets: 12, target: 12 },
  { group: 'Triceps', sets: 13, target: 14 },
]

const PRS = [
  { lift: 'Barbell Bench Press', value: '100 kg', when: '2 days ago' },
  { lift: 'Back Squat', value: '140 kg', when: '1 week ago' },
  { lift: 'Deadlift', value: '180 kg', when: '2 weeks ago' },
  { lift: 'Overhead Press', value: '62.5 kg', when: '3 weeks ago' },
]

function statusColor(sets: number, target: number) {
  const pct = sets / target
  if (pct < 0.7) return '#c05a5a'      // low
  if (pct <= 1.05) return '#8a9c4a'    // optimal
  return '#e0a050'                     // high
}

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PillTag>Progress</PillTag>
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white/30"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              Preview · sample data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            Your <span className="text-gradient-olive">Progress</span>
          </h1>
          <p className="text-sm text-white/30">Volume trends, measurements, and personal records.</p>
        </div>
      </div>

      <NodeLine />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Weekly volume', value: '92 sets' },
          { label: 'Bodyweight', value: '78.4 kg' },
          { label: 'PRs this month', value: '3' },
          { label: 'Sessions logged', value: '18' },
        ].map(s => (
          <div key={s.label} className="rounded-[12px] p-4" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
            <p className="text-2xl font-black text-white/90 mb-0.5">{s.value}</p>
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly volume by muscle group */}
        <Card title="Weekly Volume" badge="This week" className="lg:col-span-2">
          <div className="flex flex-col gap-3.5">
            {VOLUME.map(v => {
              const pct = Math.min((v.sets / v.target) * 100, 100)
              const color = statusColor(v.sets, v.target)
              return (
                <div key={v.group}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white/60">{v.group}</span>
                    <span className="font-mono text-[9px] text-white/30">{v.sets} / {v.target} sets</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-5 pt-4" style={{ borderTop: '1px solid rgba(96,108,56,0.1)' }}>
            {[['#c05a5a', 'Low'], ['#8a9c4a', 'Optimal'], ['#e0a050', 'High']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5 font-mono text-[9px] text-white/30 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Measurements */}
          <Card title="Measurements">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: 'rgba(96,108,56,0.12)' }}>
                <Ruler size={17} className="text-[#8a9c4a]" />
              </div>
              <div>
                <p className="text-xl font-black text-white/90">78.4 kg</p>
                <p className="flex items-center gap-1 font-mono text-[9px] text-[#8a9c4a] uppercase tracking-wider">
                  <TrendingDown size={11} /> 1.2 kg this month
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[['Chest', '104 cm'], ['Waist', '82 cm'], ['Arms', '38 cm'], ['Thighs', '60 cm']].map(([l, v]) => (
                <div key={l} className="px-3 py-2 rounded-[8px]" style={{ border: '1px solid rgba(96,108,56,0.08)' }}>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{l}</p>
                  <p className="text-sm font-semibold text-white/70">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* PRs */}
          <Card title="Personal Records" badge="All-time">
            <div className="flex flex-col gap-2">
              {PRS.map(pr => (
                <div key={pr.lift} className="flex items-center gap-3 p-2.5 rounded-[8px]" style={{ border: '1px solid rgba(96,108,56,0.08)' }}>
                  <Trophy size={14} className="text-[#e0a050]/70 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/70 truncate">{pr.lift}</p>
                    <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{pr.when}</p>
                  </div>
                  <span className="text-sm font-black text-white/85 shrink-0">{pr.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* subtle footer accent to match other pages */}
      <div className="flex items-center justify-center gap-2 text-white/15 pt-2">
        <TrendingUp size={13} />
        <span className="font-mono text-[9px] uppercase tracking-widest">Progress compounds</span>
      </div>
    </div>
  )
}
