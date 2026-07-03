import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { UIProvider } from '@/contexts/UIContext'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { TrackerLayout } from '@/components/layout/TrackerLayout'
import { Skeleton } from '@/components/ui/Skeleton'
import { PlaceholderPage } from '@/pages/app/PlaceholderPage'

const HomePage = lazy(() => import('@/pages/public/HomePage'))
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const SportsPage = lazy(() => import('@/pages/public/SportsPage'))
const SportDetailPage = lazy(() => import('@/pages/public/SportDetailPage'))
const ExpertsPage = lazy(() => import('@/pages/public/ExpertsPage'))
const ResourcesPage = lazy(() => import('@/pages/public/ResourcesPage'))
const GymFinderPage = lazy(() => import('@/pages/public/GymFinderPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const AuthPage = lazy(() => import('@/pages/auth/AuthPage'))
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'))
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'))
const WorkoutPage = lazy(() => import('@/pages/app/WorkoutPage'))
const NutritionPage = lazy(() => import('@/pages/app/NutritionPage'))
const ProgressPage = lazy(() => import('@/pages/app/ProgressPage'))
const BodyLabPage = lazy(() => import('@/pages/app/BodyLabPage'))
const LearningPathsPage = lazy(() => import('@/pages/app/LearningPathsPage'))
const MovementSciencePage = lazy(() => import('@/pages/app/MovementSciencePage'))
const InjuryPreventionPage = lazy(() => import('@/pages/app/InjuryPreventionPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col gap-6 p-8 max-w-[1440px] mx-auto w-full">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" rounded />)}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/sports" element={<SportsPage />} />
                <Route path="/sports/:slug" element={<SportDetailPage />} />
                <Route path="/experts" element={<ExpertsPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/gyms" element={<GymFinderPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* Auth */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/reset" element={<AuthPage />} />

              {/* Onboarding */}
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Protected app */}
              <Route element={<AppLayout />}>
                {/* Train — Tracker umbrella + Body Lab share the in-page
                    sub-nav strip (TrackerLayout) */}
                <Route element={<TrackerLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/workout" element={<WorkoutPage />} />
                  <Route path="/nutrition" element={<NutritionPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/anatomy" element={<BodyLabPage />} />
                </Route>

                <Route path="/learn" element={<LearningPathsPage />} />
                <Route path="/movement-science" element={<MovementSciencePage />} />
                <Route path="/injury-prevention" element={<InjuryPreventionPage />} />
                <Route path="/recovery" element={<PlaceholderPage title="Recovery" description="Recovery protocols, load management, and return-to-play guides — coming in Phase 2." phase={2} cta={{ label: 'Back to Dashboard', to: '/dashboard' }} />} />
                <Route path="/community" element={<PlaceholderPage title="Community" description="Reddit-style sport-tagged discussion with expert verification, upvotes, and image posts — coming in Phase 2." phase={2} cta={{ label: 'Back to Dashboard', to: '/dashboard' }} />} />
                <Route path="/ai" element={<PlaceholderPage title="AI Coach" description="Context-aware AI coach with your full training history, sport schedule, and movement science knowledge — coming in Phase 2." phase={2} cta={{ label: 'Back to Dashboard', to: '/dashboard' }} />} />
                <Route path="/library" element={<PlaceholderPage title="My Library" description="Saved lessons, articles, and training plans — coming in Phase 2." phase={2} cta={{ label: 'Back to Dashboard', to: '/dashboard' }} />} />
                <Route path="/profile" element={<PlaceholderPage title="My Profile" description="Personal info, sports, achievements, and certifications — coming in Phase 2." phase={2} cta={{ label: 'Back to Dashboard', to: '/dashboard' }} />} />
                <Route path="/settings" element={<PlaceholderPage title="Settings" description="Account, security, notifications, and privacy settings — coming in Phase 3." phase={3} cta={{ label: 'Back to Dashboard', to: '/dashboard' }} />} />
                <Route path="/notifications" element={<PlaceholderPage title="Notifications" description="In-app notification centre — coming in Phase 3." phase={3} cta={{ label: 'Back to Dashboard', to: '/dashboard' }} />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
