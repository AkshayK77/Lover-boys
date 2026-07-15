import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { AuthNav } from '@/components/navigation/AuthNav'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import AIDrawer from '@/components/AIDrawer'

export function AppLayout() {
  const { user, profile, loading } = useAuth()
  const { drawerOpen, openDrawer, closeDrawer } = useUI()
  const location = useLocation()

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

  if (!user) return <Navigate to="/auth" replace />
  if (!profile || !profile.onboarding_complete) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080C14' }}>
      <AuthNav />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-safe">
        <Outlet />
      </main>

      {/* Global AI coach — floating button + drawer, reachable from any page */}
      {!drawerOpen && location.pathname !== '/ai' && (
        <button
          onClick={() => openDrawer()}
          aria-label="Open AI Coach"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)', boxShadow: '0 8px 28px rgba(0,0,0,0.5)' }}
        >
          <Brain size={22} className="text-white" />
        </button>
      )}
      {drawerOpen && <AIDrawer onClose={closeDrawer} />}
    </div>
  )
}
