import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, BookOpen, Dumbbell, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useUI } from '@/contexts/UIContext'
import { cn } from '@/lib/utils'

const TRAIN_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Workout', to: '/workout' },
  { label: 'Nutrition', to: '/nutrition' },
  { label: 'Progress', to: '/progress' },
  { label: 'Body Lab', to: '/anatomy' },
]

const LEARN_LINKS = [
  { label: 'Sports Library', to: '/sports' },
  { label: 'Learning Paths', to: '/learn' },
  { label: 'Movement Science', to: '/movement-science' },
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
            ? 'text-[#264653] bg-[#264653]/8'
            : 'text-[#374151] hover:text-[#264653] hover:bg-[#264653]/6',
        )}
        aria-expanded={open}
      >
        {icon}
        {label}
        <ChevronDown size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-[10px] border border-[#E5E7EB] shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-1.5 z-50">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center px-4 py-2.5 text-sm transition-colors min-h-[44px]',
                currentPath === link.to
                  ? 'text-[#264653] bg-[#264653]/6 font-medium'
                  : 'text-[#374151] hover:text-[#264653] hover:bg-[#F3F4F6]',
              )}
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

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-safe',
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_16px_rgba(0,0,0,0.08)]' : 'bg-white border-b border-[#E5E7EB]',
        )}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-[8px] bg-[#264653] flex items-center justify-center">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
              <span className="font-bold text-[#1D3557] text-lg tracking-tight hidden sm:block">MotionLab</span>
            </Link>

            {/* Desktop nav sections — 1400px+ */}
            <nav className="hidden min-[1400px]:flex items-center gap-1">
              <NavSection label="Train" icon={<Dumbbell size={14} />} links={TRAIN_LINKS} currentPath={location.pathname} />
              <NavSection label="Learn" icon={<BookOpen size={14} />} links={LEARN_LINKS} currentPath={location.pathname} />
              <NavSection label="Connect" icon={<Users size={14} />} links={CONNECT_LINKS} currentPath={location.pathname} />
            </nav>

            {/* Right: notifications + account */}
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <button className="relative w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[8px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#264653] transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#606C38]" aria-label="Unread notifications" />
              </button>

              {/* Account dropdown */}
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setAccountOpen(v => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[8px] hover:bg-[#F3F4F6] transition-colors min-h-[44px]"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                >
                  <Avatar src={avatarUrl} name={profile?.name ?? user?.email} size="sm" />
                  <ChevronDown size={14} className={cn('text-[#6B7280] transition-transform duration-200 hidden sm:block', accountOpen && 'rotate-180')} />
                </button>

                {accountOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-[10px] border border-[#E5E7EB] shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-[#E5E7EB]">
                      <p className="text-sm font-medium text-[#1F2937] truncate">{profile?.name ?? 'User'}</p>
                      <p className="text-xs text-[#6B7280] truncate">{user?.email}</p>
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
                          className="flex items-center px-4 py-2.5 text-sm text-[#374151] hover:text-[#264653] hover:bg-[#F3F4F6] transition-colors min-h-[44px]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[#E5E7EB] pt-1">
                      <button
                        onClick={signOut}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-[#6D071A] hover:bg-[#6D071A]/6 transition-colors min-h-[44px]"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger — below 1400px */}
              <button
                className="min-[1400px]:hidden flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-[8px] text-[#374151] hover:bg-[#F3F4F6] transition-colors"
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
          className={cn('absolute inset-0 bg-black/40 transition-opacity duration-300', mobileNavOpen ? 'opacity-100' : 'opacity-0')}
          onClick={closeMobileNav}
        />
        <div
          className={cn(
            'absolute top-0 right-0 bottom-0 w-[min(320px,85vw)] bg-white shadow-2xl transition-transform duration-300 flex flex-col overflow-y-auto',
            'pt-safe pb-safe',
            mobileNavOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-[#E5E7EB] shrink-0">
            <span className="font-bold text-[#1D3557]">Menu</span>
            <button onClick={closeMobileNav} className="w-9 h-9 flex items-center justify-center rounded-[6px] text-[#6B7280] hover:bg-[#F3F4F6]" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 px-4 py-4 overflow-y-auto">
            {[
              { section: 'Train', links: TRAIN_LINKS },
              { section: 'Learn', links: LEARN_LINKS },
              { section: 'Connect', links: CONNECT_LINKS },
            ].map(({ section, links }) => (
              <div key={section} className="mb-4">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest px-4 mb-1">{section}</p>
                <div className="flex flex-col gap-0.5">
                  {links.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-[8px] text-sm font-medium min-h-[44px] transition-colors',
                        location.pathname === link.to
                          ? 'text-[#264653] bg-[#264653]/8'
                          : 'text-[#374151] hover:text-[#264653] hover:bg-[#F3F4F6]',
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-[#E5E7EB] shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={avatarUrl} name={profile?.name ?? user?.email} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1F2937] truncate">{profile?.name ?? 'User'}</p>
                <p className="text-xs text-[#6B7280] truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full text-sm text-[#6D071A] font-medium py-2.5 min-h-[44px] hover:bg-[#6D071A]/6 rounded-[8px] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 shrink-0" />
    </>
  )
}
