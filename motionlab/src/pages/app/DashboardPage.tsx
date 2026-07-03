import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Dumbbell, BookOpen, TrendingUp, Calendar, Zap, ArrowRight, Brain } from 'lucide-react'
import { NodeLine, PillTag } from '@/components/ui/FuturisticElements'
import { cn } from '@/lib/utils'

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[12px] p-4 flex flex-col gap-3" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: accent }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-white/90 mb-0.5">{value}</p>
        <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function DashCard({ title, badge, children, className }: { title: string; badge?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[12px] p-5 flex flex-col', className)}
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

function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-3 flex-1">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(96,108,56,0.06)', border: '1px solid rgba(96,108,56,0.1)' }}>
        {icon}
      </div>
      <p className="text-sm font-medium text-white/55">{title}</p>
      <p className="text-xs text-white/25 max-w-[220px] leading-relaxed">{body}</p>
      {action}
    </div>
  )
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-[9px] text-white/20">{value > 0 ? `${value}` : '—'} / {target > 0 ? target : '—'}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Fallbacks let the dashboard render for logged-out preview visitors too.
  const firstName = profile?.name?.split(' ')[0] ?? 'Athlete'
  const calorieTarget = profile?.calorie_target ?? 2000
  const proteinTarget = profile?.protein_target ?? 120

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-2">
        <div>
          <PillTag className="mb-3">Dashboard</PillTag>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            {greeting()}, <span className="text-gradient-olive">{firstName}</span>
          </h1>
          <p className="text-sm text-white/30">Your training and learning overview.</p>
        </div>
        <Link
          to="/workout"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-sm font-bold text-white shrink-0 self-start mt-1 sm:mt-6 transition-opacity hover:opacity-85"
          style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}
        >
          <Dumbbell size={15} /> Start Workout
        </Link>
      </div>

      <NodeLine />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Dumbbell size={17} className="text-[#8a9c4a]" />} label="Sessions this week" value="—" accent="rgba(96,108,56,0.12)" />
        <StatCard icon={<TrendingUp size={17} className="text-[#8a9c4a]" />} label="Training streak" value="—" accent="rgba(96,108,56,0.12)" />
        <StatCard icon={<BookOpen size={17} className="text-[#8a9c4a]" />} label="Lessons completed" value="—" accent="rgba(96,108,56,0.12)" />
        <StatCard icon={<Zap size={17} className="text-[#8a9c4a]" />} label="Calories today" value="—" accent="rgba(96,108,56,0.12)" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's workout — 2/3 */}
        <DashCard title="Today's Workout" badge="Phase 2" className="lg:col-span-2">
          <EmptyState
            icon={<Dumbbell size={22} className="text-[#8a9c4a]/60" />}
            title="Your workout plan is being built"
            body="Workout planning and live session tracking comes in Phase 2 — your plan was generated during onboarding."
            action={
              <Link to="/workout"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-medium text-white/50 hover:text-white/75 transition-colors mt-1"
                style={{ border: '1px solid rgba(96,108,56,0.18)' }}>
                Go to Workout <ArrowRight size={12} />
              </Link>
            }
          />
        </DashCard>

        {/* Sport schedule */}
        <DashCard title="Sport Schedule" badge="Live">
          <EmptyState
            icon={<Calendar size={20} className="text-[#8a9c4a]/60" />}
            title="No sessions scheduled"
            body="Add your upcoming sport sessions to get personalised warmup reminders."
            action={
              <button
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-medium text-white/50 hover:text-white/75 transition-colors mt-1"
                style={{ border: '1px solid rgba(96,108,56,0.18)' }}>
                + Add Session
              </button>
            }
          />
        </DashCard>

        {/* Continue Learning */}
        <DashCard title="Continue Learning">
          <EmptyState
            icon={<BookOpen size={20} className="text-[#8a9c4a]/60" />}
            title="No active learning path"
            body="Browse the sports library to start your first learning path."
            action={
              <Link to="/sports"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-bold text-white transition-colors hover:opacity-85 mt-1"
                style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.4)' }}>
                Browse Sports <ArrowRight size={12} />
              </Link>
            }
          />
        </DashCard>

        {/* Nutrition */}
        <DashCard title="Today's Nutrition" badge="Phase 2" className="lg:col-span-1">
          <div className="flex flex-col gap-4 flex-1">
            <MacroBar label="Calories" value={0} target={calorieTarget} color="#606C38" />
            <MacroBar label="Protein" value={0} target={proteinTarget} color="#8a9c4a" />
            <MacroBar label="Carbs" value={0} target={0} color="#264653" />
            <MacroBar label="Fat" value={0} target={0} color="#3d6b5c" />
            <Link to="/nutrition"
              className="mt-auto text-center text-xs text-white/25 hover:text-[#8a9c4a] transition-colors pt-2 font-mono uppercase tracking-wider">
              Log food →
            </Link>
          </div>
        </DashCard>

        {/* AI Insights */}
        <DashCard title="AI Coach Insights" badge="Phase 2">
          <EmptyState
            icon={<Brain size={20} className="text-[#8a9c4a]/60" />}
            title="No insights yet"
            body="Log your first session to unlock AI insights and deload recommendations."
            action={
              <Link to="/ai"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-medium text-white/50 hover:text-white/75 transition-colors mt-1"
                style={{ border: '1px solid rgba(96,108,56,0.18)' }}>
                Talk to AI Coach <Zap size={12} />
              </Link>
            }
          />
        </DashCard>

      </div>
    </div>
  )
}
