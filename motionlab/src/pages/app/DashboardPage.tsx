import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Dumbbell, BookOpen, TrendingUp, Calendar, Zap, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()

  if (!profile) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" rounded />)}
        </div>
      </div>
    )
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D3557]">
            {greeting()}, {profile.name?.split(' ')[0] ?? 'Athlete'} 👋
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Here's your training and learning overview.</p>
        </div>
        <Link to="/workout">
          <Button>
            <Dumbbell size={16} className="mr-2" /> Start Workout
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Dumbbell size={20} className="text-[#264653]" />, label: 'Sessions this week', value: '—', bg: 'bg-[#264653]/8' },
          { icon: <TrendingUp size={20} className="text-[#606C38]" />, label: 'Training streak', value: '—', bg: 'bg-[#606C38]/8' },
          { icon: <BookOpen size={20} className="text-[#4A6FA5]" />, label: 'Lessons completed', value: '—', bg: 'bg-[#4A6FA5]/8' },
          { icon: <Zap size={20} className="text-[#1D3557]" />, label: 'Calories today', value: '—', bg: 'bg-[#1D3557]/8' },
        ].map(stat => (
          <Card key={stat.label} padding="md">
            <div className={`w-10 h-10 rounded-[8px] ${stat.bg} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-[#1F2937] mb-1">{stat.value}</p>
            <p className="text-xs text-[#6B7280]">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's workout */}
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1D3557]">Today's Workout</h2>
            <Badge variant="gray">Phase 2</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#264653]/8 flex items-center justify-center">
              <Dumbbell size={24} className="text-[#264653]" />
            </div>
            <p className="font-medium text-[#1F2937]">Your workout plan is being built</p>
            <p className="text-sm text-[#6B7280] max-w-xs">Workout planning and live session tracking comes in Phase 2 — your plan was generated during onboarding.</p>
            <Link to="/workout">
              <Button size="sm" variant="outline" className="mt-2">
                Go to Workout <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Sport Schedule */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1D3557]">Sport Schedule</h2>
            <Badge variant="green">New</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#606C38]/8 flex items-center justify-center">
              <Calendar size={24} className="text-[#606C38]" />
            </div>
            <p className="font-medium text-[#1F2937]">No sport sessions scheduled</p>
            <p className="text-sm text-[#6B7280]">Add your upcoming sport sessions to get personalised warmup reminders.</p>
            <Button size="sm" variant="outline" className="mt-2">
              + Add Session
            </Button>
          </div>
        </Card>

        {/* Continue Learning */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1D3557]">Continue Learning</h2>
            <Badge variant="slate">Phase 2</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#4A6FA5]/8 flex items-center justify-center">
              <BookOpen size={20} className="text-[#4A6FA5]" />
            </div>
            <p className="text-sm font-medium text-[#1F2937]">No active learning path</p>
            <p className="text-xs text-[#6B7280]">Browse the sports library to start your first learning path.</p>
            <Link to="/sports">
              <Button size="sm" className="mt-1">Browse Sports</Button>
            </Link>
          </div>
        </Card>

        {/* Nutrition */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1D3557]">Today's Nutrition</h2>
            <Badge variant="gray">Phase 2</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {['Calories', 'Protein', 'Carbs', 'Fat'].map(macro => (
              <div key={macro}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#6B7280]">{macro}</span>
                  <span className="text-xs text-[#9CA3AF]">— / —</span>
                </div>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full" />
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card padding="md" className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1D3557]">AI Insights</h2>
            <Badge variant="navy">Coach</Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1D3557]/8 flex items-center justify-center">
              <Zap size={20} className="text-[#1D3557]" />
            </div>
            <p className="text-sm font-medium text-[#1F2937]">No insights yet</p>
            <p className="text-xs text-[#6B7280]">Log your first session to unlock AI insights and deload recommendations.</p>
            <Link to="/ai">
              <Button size="sm" variant="outline" className="mt-1">Talk to AI Coach</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
