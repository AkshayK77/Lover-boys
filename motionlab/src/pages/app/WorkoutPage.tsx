import { Dumbbell, Play, Plus, Check, Calendar, Clock } from 'lucide-react'
import { PillTag, NodeLine } from '@/components/ui/FuturisticElements'

// UI-only shell. Sample data below is static placeholder — live session
// tracking, plan generation and set logging get wired to Supabase in a later
// phase. Layout is built to receive that real data without a rewrite.

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

const TODAY_EXERCISES = [
  { name: 'Barbell Bench Press', sets: '4 × 6–8', target: '80 kg', done: 4 },
  { name: 'Incline Dumbbell Press', sets: '3 × 8–10', target: '30 kg', done: 2 },
  { name: 'Cable Fly', sets: '3 × 12–15', target: '15 kg', done: 0 },
  { name: 'Overhead Triceps Extension', sets: '3 × 10–12', target: '25 kg', done: 0 },
  { name: 'Rope Pushdown', sets: '3 × 15', target: '20 kg', done: 0 },
]

const WEEK = [
  { day: 'Mon', focus: 'Push', active: true },
  { day: 'Tue', focus: 'Pull', active: false },
  { day: 'Wed', focus: 'Legs', active: false },
  { day: 'Thu', focus: 'Rest', active: false },
  { day: 'Fri', focus: 'Upper', active: false },
  { day: 'Sat', focus: 'Lower', active: false },
  { day: 'Sun', focus: 'Rest', active: false },
]

export default function WorkoutPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PillTag>Workout</PillTag>
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white/30"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              Preview · sample data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            Push <span className="text-gradient-olive">Day</span>
          </h1>
          <p className="text-sm text-white/30 flex items-center gap-3">
            <span className="flex items-center gap-1.5"><Calendar size={13} /> Today</span>
            <span className="flex items-center gap-1.5"><Clock size={13} /> ~52 min</span>
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-sm font-bold text-white shrink-0 self-start transition-opacity hover:opacity-85"
          style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}
        >
          <Play size={15} /> Start Session
        </button>
      </div>

      <NodeLine />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's exercises */}
        <Card title="Today's Exercises" badge="5 exercises" className="lg:col-span-2">
          <div className="flex flex-col gap-2">
            {TODAY_EXERCISES.map((ex, i) => {
              const totalSets = parseInt(ex.sets)
              const complete = ex.done >= totalSets
              return (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-[10px] transition-colors"
                  style={{ border: '1px solid rgba(96,108,56,0.08)', background: complete ? 'rgba(96,108,56,0.04)' : 'transparent' }}>
                  <div className="w-8 h-8 rounded-[7px] flex items-center justify-center shrink-0"
                    style={{ background: complete ? 'rgba(96,108,56,0.15)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(96,108,56,0.12)' }}>
                    {complete ? <Check size={15} className="text-[#8a9c4a]" /> : <span className="font-mono text-xs text-white/40">{i + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white/80 truncate">{ex.name}</p>
                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{ex.sets} · {ex.target}</p>
                  </div>
                  <span className="font-mono text-[10px] text-white/25 shrink-0">{ex.done}/{totalSets}</span>
                </div>
              )
            })}
          </div>
          <button className="flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-[8px] text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
            style={{ border: '1px dashed rgba(96,108,56,0.2)' }}>
            <Plus size={13} /> Add exercise
          </button>
        </Card>

        {/* Weekly split */}
        <div className="flex flex-col gap-4">
          <Card title="This Week" badge="PPL">
            <div className="flex flex-col gap-1.5">
              {WEEK.map(d => (
                <div key={d.day} className="flex items-center justify-between px-3 py-2 rounded-[8px]"
                  style={d.active ? { background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.2)' } : { border: '1px solid transparent' }}>
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${d.active ? 'text-[#8a9c4a]' : 'text-white/25'}`}>{d.day}</span>
                  <span className={`text-xs font-medium ${d.active ? 'text-white/80' : d.focus === 'Rest' ? 'text-white/20' : 'text-white/45'}`}>{d.focus}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Last Session">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-black text-white/90">Pull Day</p>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Yesterday · 6 exercises · 48 min</p>
              <div className="flex items-center gap-2 mt-3">
                <Dumbbell size={13} className="text-[#8a9c4a]/60" />
                <span className="text-xs text-white/40">12,400 kg total volume</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
