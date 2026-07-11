import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/lib/profiles'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  avatarUrl: string | null
  loading: boolean
  isAdmin: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_PROFILE: Profile = {
  id: 'demo-user-id',
  name: 'Demo Athlete',
  email: 'demo@motionlab.app',
  avatar_url: null,
  age: 26,
  weight_kg: 75,
  height_cm: 178,
  fitness_goal: 'general_fitness',
  experience_level: 'intermediate',
  sessions_per_week: 4,
  equipment: ['Dumbbells', 'Barbell', 'Pull-up bar', 'Full gym access'],
  injuries: null,
  calorie_target: 2400,
  protein_target: 160,
  dietary_preference: 'No preference',
  sports: ['table_tennis', 'football'],
  sport_frequency: { table_tennis: 3, football: 1 },
  activity_level: 'moderately_active',
  learning_goals: [],
  dietary_notes: null,
  onboarding_complete: true,
  deload_suggested_at: null,
  created_at: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const p = await getProfile(userId)
    setProfile(p)

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()
    setIsAdmin(data?.role === 'admin')
  }, [])

  const refreshProfile = useCallback(async () => {
    if (localStorage.getItem('ml_demo_mode') === 'true') return
    if (user) await loadProfile(user.id)
  }, [user, loadProfile])

  useEffect(() => {
    // Demo mode — no Supabase needed
    if (localStorage.getItem('ml_demo_mode') === 'true') {
      setUser({ id: 'demo-user-id', email: 'demo@motionlab.app' } as User)
      setProfile(DEMO_PROFILE)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signOut = useCallback(async () => {
    if (localStorage.getItem('ml_demo_mode') === 'true') {
      localStorage.removeItem('ml_demo_mode')
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }, [])

  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null

  return (
    <AuthContext value={{ user, session, profile, avatarUrl, loading, isAdmin, refreshProfile, signOut }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
