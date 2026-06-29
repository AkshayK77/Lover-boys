import { Outlet, Navigate } from 'react-router-dom'
import { AuthNav } from '@/components/navigation/AuthNav'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'

export function AppLayout() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
        <div className="h-16 bg-white border-b border-[#E5E7EB]" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-64 rounded-[8px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-40 rounded-[10px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  if (user && profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      <AuthNav />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-safe">
        <Outlet />
      </main>
    </div>
  )
}
