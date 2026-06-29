import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard', { replace: true })
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) throw error
        navigate('/onboarding', { replace: true })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset`,
        })
        if (error) throw error
        setSuccess('Check your email for a password reset link.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080C14' }}>
      {/* Left — visual panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[520px] shrink-0 relative overflow-hidden p-12"
        style={{ background: '#0D1420', borderRight: '1px solid rgba(96,108,56,0.15)' }}>
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="scanline pointer-events-none" />
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(96,108,56,0.12) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #264653, #606C38)', border: '1px solid rgba(96,108,56,0.4)' }}>
              ML
            </div>
            <span className="font-bold text-white text-lg tracking-tight">MotionLab</span>
          </Link>
        </div>

        {/* Central content */}
        <div className="relative">
          <div className="space-y-6 mb-10">
            <p className="font-mono text-[10px] text-[#8a9c4a] uppercase tracking-widest">What you get access to</p>
            {[
              { icon: '🧬', text: 'Movement science library — expert-reviewed biomechanics content' },
              { icon: '🛡️', text: 'Sport-specific injury prevention & warmup protocols' },
              { icon: '💪', text: 'AI-powered workout planning with progressive overload' },
              { icon: '🤖', text: 'Contextual AI coach with your full training history' },
              { icon: '🍛', text: 'Indian food database & macro tracking' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{item.icon}</span>
                <p className="text-white/50 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Stat row */}
          <div className="flex items-center gap-6 pt-6 border-t border-[#606C38]/10">
            {[['8', 'Sports'], ['5', 'Pillars'], ['Free', 'Tier']].map(([num, label]) => (
              <div key={label}>
                <p className="text-xl font-black text-gradient-olive">{num}</p>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <p className="relative text-white/20 text-xs italic leading-relaxed">
          "The knowledge that prevents injuries should not be a privilege."
        </p>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #264653, #606C38)' }}>
            ML
          </div>
          <span className="font-bold text-white text-xl tracking-tight">MotionLab</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Mode tabs */}
          {mode !== 'forgot' && (
            <div className="flex rounded-[10px] p-0.5 mb-8"
              style={{ background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(96,108,56,0.15)' }}>
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null) }}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-semibold rounded-[8px] transition-all duration-150 min-h-[44px]',
                    mode === m
                      ? 'text-white'
                      : 'text-white/35 hover:text-white/60',
                  )}
                  style={mode === m ? { background: '#606C38' } : {}}
                >
                  {m === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-black text-white mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
          </h1>
          <p className="text-sm text-white/35 mb-7">
            {mode === 'login' ? 'Sign in to your MotionLab account' : mode === 'signup' ? 'Start training with understanding' : 'We\'ll send you a reset link'}
          </p>

          {error && (
            <div className="rounded-[8px] px-4 py-3 mb-4" style={{ background: 'rgba(109,7,26,0.1)', border: '1px solid rgba(109,7,26,0.3)' }}>
              <p className="text-sm text-[#f87171]">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-[8px] px-4 py-3 mb-4" style={{ background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.3)' }}>
              <p className="text-sm text-[#8a9c4a]">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/60">Full name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Aditya Saiprasad"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full h-11 pl-9 pr-3 rounded-[8px] text-sm text-white placeholder-white/20 focus:outline-none transition-colors"
                    style={{ background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(96,108,56,0.2)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(96,108,56,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(96,108,56,0.2)')}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/60">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-11 pl-9 pr-3 rounded-[8px] text-sm text-white placeholder-white/20 focus:outline-none transition-colors"
                  style={{ background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(96,108,56,0.2)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(96,108,56,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(96,108,56,0.2)')}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/60">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full h-11 pl-9 pr-10 rounded-[8px] text-sm text-white placeholder-white/20 focus:outline-none transition-colors"
                    style={{ background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(96,108,56,0.2)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(96,108,56,0.5)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(96,108,56,0.2)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-[#8a9c4a]/70 hover:text-[#8a9c4a] text-right transition-colors -mt-2"
              >
                Forgot password?
              </button>
            )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2 font-bold text-white"
              style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}
            >
              {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            </Button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(96,108,56,0.12)' }} />
                <span className="text-xs text-white/20 font-mono">OR</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(96,108,56,0.12)' }} />
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-3 rounded-[8px] text-sm font-medium text-white/60 hover:text-white/85 transition-all"
                style={{ background: 'rgba(13,20,32,0.8)', border: '1px solid rgba(96,108,56,0.15)' }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => setMode('login')}
              className="mt-4 text-sm text-white/35 hover:text-white/60 transition-colors font-mono"
            >
              ← Back to sign in
            </button>
          )}

          {/* Demo mode bypass */}
          <div className="flex items-center gap-3 mt-6 mb-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(96,108,56,0.08)' }} />
            <span className="text-[10px] text-white/15 font-mono uppercase tracking-wider">Preview</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(96,108,56,0.08)' }} />
          </div>
          <button
            onClick={() => {
              localStorage.setItem('ml_demo_mode', 'true')
              window.location.href = '/dashboard'
            }}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-[8px] text-sm font-medium transition-all text-white/40 hover:text-white/65"
            style={{ background: 'rgba(96,108,56,0.04)', border: '1px solid rgba(96,108,56,0.1)' }}
          >
            <span className="font-mono text-[10px] text-[#8a9c4a]/60">▶</span>
            Preview as Demo Athlete — no sign-in needed
          </button>

          <p className="text-xs text-white/15 mt-6 text-center leading-relaxed">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            MotionLab is not a medical device — content is educational only.
          </p>
        </div>
      </div>
    </div>
  )
}
