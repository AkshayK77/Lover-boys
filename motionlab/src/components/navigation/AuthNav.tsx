import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, BookOpen, Dumbbell, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { cn } from '@/lib/utils'

// Train collapses to a single top-level link into the Tracker umbrella;
// the section sub-nav now lives in the in-page tab strip (TrackerLayout).
const TRACKER_PATHS = ['/dashboard', '/workout', '/nutrition', '/progress']

const LEARN_LINKS = [
  { label: 'Sports Library', to: '/sports' },
  { label: 'Learning Paths', to: '/learn' },
  { label: 'Movement Science', to: '/movement-science' },
  { label: 'Body Lab', to: '/body-lab' },
  { label: 'Injury Prevention', to: '/injury-prevention' },
  { label: 'Recovery', to: '/recovery' },
]

const CONNECT_LINKS = [
  { label: 'Community', to: '/community' },
  { label: 'Expert Hub', to: '/experts' },
  { label: 'AI Coach', to: '/ai' },
  { label: 'My Library', to: '/library' },
]

interface NavSectionProps {
  label: string
  icon: React.ReactNode
  links: { label: string; to: string }[]
  currentPath: string
}

function NavSection({ label, icon, links, currentPath }: NavSectionProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isActive = links.some(l => currentPath.startsWith(l.to))

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors min-h-[44px]',
          isActive
            ? 'text-[#8a9c4a]'
            : 'text-white/45 hover:text-white/80',
        )}
        style={isActive ? { background: 'rgba(96,108,56,0.1)' } : {}}
        aria-expanded={open}
      >
        {icon}
        {label}
        <ChevronDown size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-[10px] py-1.5 z-50"
          style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.18)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center px-4 py-2.5 text-sm transition-colors min-h-[44px]',
                currentPath === link.to
                  ? 'text-[#8a9c4a] font-medium'
                  : 'text-white/45 hover:text-white/80',
              )}
              style={currentPath === link.to ? { background: 'rgba(96,108,56,0.08)' } : {}}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function AuthNav() {
  const { user, profile, avatarUrl, signOut } = useAuth()
  const { mobileNavOpen, openMobileNav, closeMobileNav } = useUI()
  const [accountOpen, setAccountOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    closeMobileNav()
    setAccountOpen(false)
  }, [location.pathname, closeMobileNav])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileNavOpen])

  const isDemoMode = localStorage.getItem('ml_demo_mode') === 'true'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-safe',
        )}
        style={{
          background: scrolled ? 'rgba(8,12,20,0.96)' : '#0D1420',
          borderBottom: '1px solid rgba(96,108,56,0.12)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center font-black text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #264653, #606C38)', border: '1px solid rgba(96,108,56,0.4)' }}>
                ML
              </div>
              <span className="font-bold text-white text-lg tracking-tight hidden sm:block">MotionLab</span>
            </Link>

            {/* Desktop nav sections — 1400px+ */}
            <nav className="hidden min-[1400px]:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors min-h-[44px]',
                  TRACKER_PATHS.some(p => location.pathname.startsWith(p))
                    ? 'text-[#8a9c4a]'
                    : 'text-white/45 hover:text-white/80',
                )}
                style={TRACKER_PATHS.some(p => location.pathname.startsWith(p)) ? { background: 'rgba(96,108,56,0.1)' } : {}}
              >
                <Dumbbell size={14} />
                Train
              </Link>
              <NavSection label="Learn" icon={<BookOpen size={14} />} links={LEARN_LINKS} currentPath={location.pathname} />
              <NavSection label="Connect" icon={<Users size={14} />} links={CONNECT_LINKS} currentPath={location.pathname} />
            </nav>

            {/* Right: demo badge + notifications + account */}
            <div className="flex items-center gap-2">
              {isDemoMode && (
                <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider"
                  style={{ background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.2)', color: '#8a9c4a' }}>
                  Demo
                </span>
              )}

              {/* Notification bell */}
              <button className="relative w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[8px] text-white/30 hover:text-white/60 transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,108,56,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#606C38]" aria-label="Unread notifications" />
              </button>

              {/* Account dropdown */}
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setAccountOpen(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[8px] transition-colors min-h-[44px]"
                  style={{ background: accountOpen ? 'rgba(96,108,56,0.08)' : 'transparent' }}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                >
                  <Avatar src={avatarUrl} name={profile?.name ?? user?.email} size="sm" />
                  <ChevronDown size={14} className={cn('text-white/30 transition-transform duration-200 hidden sm:block', accountOpen && 'rotate-180')} />
                </button>

                {accountOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-56 rounded-[10px] py-1.5 z-50"
                    style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.18)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(96,108,56,0.1)' }}>
                      <p className="text-sm font-medium text-white/85 truncate">{profile?.name ?? 'Demo Athlete'}</p>
                      <p className="text-xs text-white/30 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { label: 'My Profile', to: '/profile' },
                        { label: 'My Library', to: '/library' },
                        { label: 'Settings', to: '/settings' },
                        { label: 'Notifications', to: '/notifications' },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center px-4 py-2.5 text-sm text-white/45 hover:text-white/80 transition-colors min-h-[44px]"
                          style={location.pathname === item.to ? { color: '#8a9c4a', background: 'rgba(96,108,56,0.06)' } : {}}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-1" style={{ borderTop: '1px solid rgba(96,108,56,0.1)' }}>
                      <button
                        onClick={signOut}
                        className="w-full flex items-center px-4 py-2.5 text-sm transition-colors min-h-[44px]"
                        style={{ color: 'rgba(248,113,113,0.6)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {isDemoMode ? 'Exit Demo' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger — below 1400px */}
              <button
                className="min-[1400px]:hidden flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-[8px] text-white/40 hover:text-white/70 transition-colors"
                onClick={mobileNavOpen ? closeMobileNav : openMobileNav}
                aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-40 min-[1400px]:hidden transition-all duration-300', mobileNavOpen ? 'visible' : 'invisible')}>
        <div
          className={cn('absolute inset-0 bg-black/60 transition-opacity duration-300', mobileNavOpen ? 'opacity-100' : 'opacity-0')}
          onClick={closeMobileNav}
        />
        <div
          className={cn(
            'absolute top-0 right-0 bottom-0 w-[min(320px,85vw)] shadow-2xl transition-transform duration-300 flex flex-col overflow-y-auto',
            'pt-safe pb-safe',
            mobileNavOpen ? 'translate-x-0' : 'translate-x-full',
          )}
          style={{ background: '#0D1420', borderLeft: '1px solid rgba(96,108,56,0.15)' }}
        >
          <div className="flex items-center justify-between px-6 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(96,108,56,0.1)' }}>
            <span className="font-bold text-white/70 text-sm">Menu</span>
            <button onClick={closeMobileNav} className="w-9 h-9 flex items-center justify-center rounded-[6px] text-white/30 hover:text-white/60" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 px-4 py-4 overflow-y-auto">
            {/* Train — single link into the Tracker umbrella */}
            <div className="mb-5">
              <Link
                to="/dashboard"
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-[8px] text-sm font-medium min-h-[44px] transition-colors',
                  TRACKER_PATHS.some(p => location.pathname.startsWith(p))
                    ? 'text-[#8a9c4a]'
                    : 'text-white/40 hover:text-white/70',
                )}
                style={TRACKER_PATHS.some(p => location.pathname.startsWith(p)) ? { background: 'rgba(96,108,56,0.08)' } : {}}
              >
                <Dumbbell size={15} />
                Train
              </Link>
            </div>
            {[
              { section: 'Learn', links: LEARN_LINKS },
              { section: 'Connect', links: CONNECT_LINKS },
            ].map(({ section, links }) => (
              <div key={section} className="mb-5">
                <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest px-4 mb-2">{section}</p>
                <div className="flex flex-col gap-0.5">
                  {links.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-[8px] text-sm font-medium min-h-[44px] transition-colors',
                        location.pathname === link.to
                          ? 'text-[#8a9c4a]'
                          : 'text-white/40 hover:text-white/70',
                      )}
                      style={location.pathname === link.to ? { background: 'rgba(96,108,56,0.08)' } : {}}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 shrink-0" style={{ borderTop: '1px solid rgba(96,108,56,0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={avatarUrl} name={profile?.name ?? user?.email} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/75 truncate">{profile?.name ?? 'Demo Athlete'}</p>
                <p className="text-xs text-white/25 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full text-sm font-medium py-2.5 min-h-[44px] rounded-[8px] transition-colors"
              style={{ color: 'rgba(248,113,113,0.6)' }}
            >
              {isDemoMode ? 'Exit Demo' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 shrink-0" />
    </>
  )
}
