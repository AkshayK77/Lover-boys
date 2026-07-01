import { Outlet, Navigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PublicNav } from '@/components/navigation/PublicNav'
import { useAuth } from '@/contexts/AuthContext'

export function AppLayout() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#080C14' }}>
        <div className="h-16 shrink-0" style={{ borderBottom: '1px solid rgba(96,108,56,0.1)' }} />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6">
            <div className="h-9 w-64 rounded-[8px] animate-pulse" style={{ background: 'rgba(96,108,56,0.06)' }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 rounded-[10px] animate-pulse" style={{ background: 'rgba(96,108,56,0.04)', border: '1px solid rgba(96,108,56,0.08)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TEMPORARY (preview): app area is viewable without login so logged-out
  // visitors can preview the Tracker/app pages. These pages render sample data
  // only. REVERT this before wiring real user-scoped Supabase reads — restore:
  //   if (!user) return <Navigate to="/auth" replace />
  if (user && profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080C14' }}>
      <PublicNav />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-safe">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mb-6 px-3.5 py-2 rounded-[8px] text-sm font-medium text-white/55 hover:text-white/85 transition-colors"
          style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.15)' }}
        >
          <ArrowLeft size={15} /> Back to Tracker Dashboard
        </Link>
        <Outlet />
      </main>
    </div>
  )
}
