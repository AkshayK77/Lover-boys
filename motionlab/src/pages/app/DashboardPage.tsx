import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkout } from '@/contexts/WorkoutContext'
import { Link } from 'react-router-dom'
import { Dumbbell, BookOpen, TrendingUp, Calendar, Zap, ArrowRight, Brain, Flame, RefreshCw, CalendarDays } from 'lucide-react'
import { NodeLine, PillTag } from '@/components/ui/FuturisticElements'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getWeekStart, calcNutrition, deriveMacroTargets } from '@/lib/workoutPlan'
import { upsertProfile } from '@/lib/profiles'
import type { Profile } from '@/types'
import { loadInsights, type Flag } from '@/lib/insights'
import { maybeGenerateWeeklySummary } from '@/lib/weeklySummary'
import MuscleHeatmap from '@/components/MuscleHeatmap'

const SEVERITY_COLORS: Record<string, string> = { warning: '#ff5c5c', success: '#4ade80', info: '#60a5fa' }

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[12px] p-4 flex flex-col gap-3" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
      <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: accent }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-white/90 mb-0.5">{value}</p>
        <p className="font-mono text-[9px] text-white/45 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function DashCard({ title, badge, headerAction, children, className }: { title: string; badge?: string; headerAction?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[12px] p-5 flex flex-col', className)}
      style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
      <div className="flex items-center justify-between mb-5 gap-3">
        <h2 className="font-bold text-white/80 text-sm">{title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {headerAction}
          {badge && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: '#8a9c4a', background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.15)' }}>
              {badge}
            </span>
          )}
        </div>
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
      <p className="text-sm font-medium text-white/75">{title}</p>
      <p className="text-xs text-white/45 max-w-[220px] leading-relaxed">{body}</p>
      {action}
    </div>
  )
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9px] text-white/45 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-[9px] text-white/40">{value > 0 ? `${Math.round(value)}` : '—'} / {target > 0 ? target : '—'}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Live-data helpers ────────────────────────────────────────────────────────

function todayLocalStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function weekStartForDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 86400000)
}

// Streak = consecutive fully-past weeks that hit ≥75% of the weekly target.
// motionlab has no completed_at, so every logged session counts.
async function computeStreak(userId: string, sessionsPerWeek: number): Promise<{ count: number; isAmber: boolean }> {
  const { data } = await supabase.from('sessions').select('date').eq('user_id', userId).order('date', { ascending: false }).limit(200)
  const rows = (data as { date: string }[] | null) || []
  if (!rows.length) return { count: 0, isAmber: false }

  const byWeek: Record<string, number> = {}
  rows.forEach(r => { const wk = weekStartForDate(r.date); byWeek[wk] = (byWeek[wk] || 0) + 1 })

  const currentWeek = getWeekStart()
  const weeks = Object.keys(byWeek).filter(w => w < currentWeek).sort().reverse()
  const threshold = Math.max(1, sessionsPerWeek * 0.75)

  let count = 0, isAmber = false, prevWk: string | null = null
  for (const wk of weeks) {
    if (byWeek[wk] < threshold) break
    if (prevWk && daysBetween(wk, prevWk) !== 7) break
    if (byWeek[wk] < sessionsPerWeek) isAmber = true
    count++
    prevWk = wk
  }
  return { count, isAmber }
}

interface PlanDayShape {
  exercises?: { exercise_id?: string; exercise_name?: string; sets?: number; reps?: string; note?: string }[]
  explanation?: string | null
  is_rest?: boolean
}
interface TodayWorkout {
  planDayId: string | null
  planName: string
  dayName: string
  isRest: boolean
  exerciseNames: string[]
}

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { heatmapRefreshKey } = useWorkout()
  const backfilledRef = useRef(false)

  const [sessionsThisWeek, setSessionsThisWeek] = useState<number | null>(null)
  const [streak, setStreak] = useState<{ count: number; isAmber: boolean } | null>(null)
  const [lessonsCompleted, setLessonsCompleted] = useState<number | null>(null)
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null)
  const [flags, setFlags] = useState<Flag[]>([])
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [refreshingInsights, setRefreshingInsights] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState<string | null>(null)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = profile?.name?.split(' ')[0] ?? 'Athlete'
  const calorieTarget = profile?.calorie_target ?? 2000
  const proteinTarget = profile?.protein_target ?? 120
  const derivedMacros = deriveMacroTargets(calorieTarget, proteinTarget)

  // One-time backfill: compute blank macro targets via Mifflin-St Jeor for
  // users who onboarded before auto-fill existed (needs weight/height/age).
  useEffect(() => {
    if (backfilledRef.current || !user?.id || !profile) return
    if (profile.calorie_target && profile.protein_target) return
    if (!profile.weight_kg || !profile.height_cm || !profile.age) return
    backfilledRef.current = true
    const nut = calcNutrition(profile as Profile)
    const patch: Partial<Profile> = {}
    if (!profile.calorie_target && nut.calories) patch.calorie_target = nut.calories
    if (!profile.protein_target && nut.protein) patch.protein_target = nut.protein
    if (Object.keys(patch).length === 0) return
    upsertProfile(user.id, patch).then(() => refreshProfile()).catch(() => {})
  }, [user?.id, profile, refreshProfile])

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    const uid = user.id
    const weekStart = getWeekStart()
    const today = todayLocalStr()

    async function load() {
      // Sessions this week
      const sw = await supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('user_id', uid).gte('date', weekStart)
      if (!cancelled) setSessionsThisWeek(sw.count ?? 0)

      // Training streak
      const st = await computeStreak(uid, profile?.sessions_per_week ?? 3)
      if (!cancelled) setStreak(st)

      // Lessons completed
      const lc = await supabase.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('user_id', uid).eq('completed', true)
      if (!cancelled) setLessonsCompleted(lc.error ? 0 : (lc.count ?? 0))

      // Today's nutrition
      const meals = await supabase.from('meal_history').select('calories, protein_g, carbs_g, fat_g').eq('user_id', uid).eq('logged_date', today)
      const mrows = (meals.data as { calories: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null }[] | null) || []
      if (!cancelled) {
        setNutrition(mrows.reduce((acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein: acc.protein + (m.protein_g || 0),
          carbs: acc.carbs + (m.carbs_g || 0),
          fat: acc.fat + (m.fat_g || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 }))
      }

      // Today's workout from the active plan
      const planRes = await supabase.from('workout_plans').select('id, name, created_at').eq('user_id', uid).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle()
      const plan = planRes.data as { id: string; name: string; created_at: string } | null
      if (plan) {
        const daysRes = await supabase.from('plan_days').select('id, day_number, name, exercises').eq('plan_id', plan.id).order('day_number')
        const days = (daysRes.data as { id: string; day_number: number; name: string | null; exercises: PlanDayShape | null }[] | null) || []
        const planStart = plan.created_at.split('T')[0]
        const match = days.find(d => daysBetween(planStart, today) === (d.day_number - 1))
          ?? days.find(d => weekStartForDate(planStart) === weekStart && d.day_number === (((new Date(today + 'T12:00:00').getDay() + 6) % 7) + 1))
        if (match && !cancelled) {
          const ex = match.exercises?.exercises || []
          setTodayWorkout({
            planDayId: match.id,
            planName: plan.name,
            dayName: match.name || `Day ${match.day_number}`,
            isRest: !!match.exercises?.is_rest || ex.length === 0,
            exerciseNames: ex.map(e => e.exercise_name || '').filter(Boolean),
          })
        }
      }

      // AI Coach insights (cached daily) + weekly summary — these hit the AI,
      // so they run last and don't block the rest of the dashboard.
      loadInsights(uid).then(f => { if (!cancelled) { setFlags(f); setInsightsLoading(false) } }).catch(() => { if (!cancelled) setInsightsLoading(false) })
      maybeGenerateWeeklySummary(uid).then(sum => { if (!cancelled && sum) setWeeklySummary(sum) }).catch(() => {})
    }

    load()
    return () => { cancelled = true }
  }, [user?.id, profile?.sessions_per_week, heatmapRefreshKey])

  async function handleRefreshInsights() {
    if (!user?.id || refreshingInsights) return
    setRefreshingInsights(true)
    const todayStr = new Date().toISOString().split('T')[0]
    localStorage.removeItem(`motionlab_flags_${user.id}_${todayStr}`)
    try {
      const f = await loadInsights(user.id, true)
      setFlags(f)
    } finally {
      setRefreshingInsights(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-2">
        <div>
          <PillTag className="mb-3">Dashboard</PillTag>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            {greeting()}, <span className="text-gradient-olive">{firstName}</span>
          </h1>
          <p className="text-sm text-white/45">Your training and learning overview.</p>
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

      {/* Quick stats — live */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Dumbbell size={17} className="text-[#8a9c4a]" />} label="Sessions this week" value={sessionsThisWeek === null ? '…' : String(sessionsThisWeek)} accent="rgba(96,108,56,0.12)" />
        <StatCard icon={streak?.isAmber ? <Flame size={17} className="text-[#F5C542]" /> : <TrendingUp size={17} className="text-[#8a9c4a]" />} label="Training streak" value={streak === null ? '…' : `${streak.count}w`} accent="rgba(96,108,56,0.12)" />
        <StatCard icon={<BookOpen size={17} className="text-[#8a9c4a]" />} label="Lessons completed" value={lessonsCompleted === null ? '…' : String(lessonsCompleted)} accent="rgba(96,108,56,0.12)" />
        <StatCard icon={<Zap size={17} className="text-[#8a9c4a]" />} label="Calories today" value={String(Math.round(nutrition.calories))} accent="rgba(96,108,56,0.12)" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's workout — 2/3 */}
        <DashCard
          title="Today's Workout"
          badge="Live"
          className="lg:col-span-2"
          headerAction={todayWorkout && (
            <Link to="/workout" className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/55 hover:text-[#8a9c4a] transition-colors">
              View Weekly Plan <ArrowRight size={10} />
            </Link>
          )}
        >
          {todayWorkout ? (
            todayWorkout.isRest ? (
              <EmptyState
                icon={<Calendar size={22} className="text-[#8a9c4a]/60" />}
                title={`${todayWorkout.dayName} — Rest day`}
                body="No training scheduled today. Recovery is part of the plan."
                action={
                  <Link to="/workout" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-medium text-white/50 hover:text-white/75 transition-colors mt-1" style={{ border: '1px solid rgba(96,108,56,0.18)' }}>
                    View Plan <ArrowRight size={12} />
                  </Link>
                }
              />
            ) : (
              <div className="flex flex-col flex-1">
                <p className="font-mono text-[10px] text-white/45 uppercase tracking-wider mb-1">{todayWorkout.planName}</p>
                <h3 className="text-xl font-black text-white mb-1">{todayWorkout.dayName}</h3>
                <p className="text-xs text-white/55 mb-4">{todayWorkout.exerciseNames.length} exercises · ~{todayWorkout.exerciseNames.length * 8} min</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {todayWorkout.exerciseNames.slice(0, 8).map((n, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-[11px] text-white/80" style={{ background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.18)' }}>{n}</span>
                  ))}
                </div>
                <Link to="/workout" state={todayWorkout.planDayId ? { startPlanDayId: todayWorkout.planDayId } : undefined} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-sm font-bold text-white self-start mt-auto transition-opacity hover:opacity-85" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
                  <Dumbbell size={15} /> Start Session
                </Link>
              </div>
            )
          ) : (
            <EmptyState
              icon={<Dumbbell size={22} className="text-[#8a9c4a]/60" />}
              title="No active plan yet"
              body="Generate a weekly plan on the Workout page and today's session will show up here."
              action={
                <Link to="/workout" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-bold text-white transition-colors hover:opacity-85 mt-1" style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.4)' }}>
                  Go to Workout <ArrowRight size={12} />
                </Link>
              }
            />
          )}
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

        {/* Nutrition — live consumed, target from profile */}
        <DashCard title="Today's Nutrition" className="lg:col-span-1">
          <div className="flex flex-col gap-4 flex-1">
            <MacroBar label="Calories" value={nutrition.calories} target={calorieTarget} color="#606C38" />
            <MacroBar label="Protein" value={nutrition.protein} target={proteinTarget} color="#8a9c4a" />
            <MacroBar label="Carbs" value={nutrition.carbs} target={derivedMacros.carbs} color="#264653" />
            <MacroBar label="Fat" value={nutrition.fat} target={derivedMacros.fat} color="#3d6b5c" />
            <Link to="/nutrition"
              className="mt-auto text-center text-xs text-white/45 hover:text-[#8a9c4a] transition-colors pt-2 font-mono uppercase tracking-wider">
              Log food →
            </Link>
          </div>
        </DashCard>

        {/* AI Insights */}
        <DashCard
          title="AI Coach Insights"
          badge="Live"
          headerAction={flags.length > 0 && (
            <button onClick={handleRefreshInsights} disabled={refreshingInsights}
              className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/55 hover:text-[#8a9c4a] transition-colors disabled:text-white/25">
              <RefreshCw size={10} className={refreshingInsights ? 'animate-spin' : ''} /> {refreshingInsights ? 'Refreshing' : 'Refresh'}
            </button>
          )}
        >
          {insightsLoading ? (
            <div className="flex flex-col gap-3 flex-1 justify-center py-2">
              {[1, 2, 3].map(i => <div key={i} className="h-3 rounded animate-pulse" style={{ background: 'rgba(96,108,56,0.08)', width: `${90 - i * 12}%` }} />)}
            </div>
          ) : flags.length > 0 ? (
            <div className="flex flex-col gap-3 flex-1">
              {flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: SEVERITY_COLORS[flag.severity] || '#8a9c4a' }} />
                  <p className="text-xs text-white/70 leading-relaxed">{flag.message}</p>
                </div>
              ))}
              <Link to="/ai" className="mt-auto text-xs text-white/45 hover:text-[#8a9c4a] transition-colors pt-2 font-mono uppercase tracking-wider inline-flex items-center gap-1.5">
                Ask the AI Coach <Zap size={11} />
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={<Brain size={20} className="text-[#8a9c4a]/60" />}
              title="No insights yet"
              body="Log a session or set your sport schedule and the AI coach will surface insights here."
              action={
                <Link to="/ai"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-xs font-medium text-white/50 hover:text-white/75 transition-colors mt-1"
                  style={{ border: '1px solid rgba(96,108,56,0.18)' }}>
                  Talk to AI Coach <Zap size={12} />
                </Link>
              }
            />
          )}
        </DashCard>

      </div>

      {/* Muscle volume heatmap */}
      {user?.id && (
        <div className="rounded-[12px] p-5" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-white/45 mb-4">
            Muscle Volume This Week
          </h2>
          <MuscleHeatmap userId={user.id} refreshKey={heatmapRefreshKey} />
        </div>
      )}

      {/* Last week's summary */}
      {weeklySummary && (
        <div className="rounded-[12px] p-5" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)', borderLeft: '3px solid #606C38' }}>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-[#8a9c4a]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8a9c4a]">Weekly Review</span>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">{weeklySummary}</p>
        </div>
      )}
    </div>
  )
}
