import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Sports', to: '/sports' },
  { label: 'Experts', to: '/experts' },
  { label: 'Resources', to: '/resources' },
  { label: 'Tracker', to: '/dashboard' },
  { label: 'Body Lab', to: '/body-lab' },
  { label: 'Gym Finder', to: '/gyms' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-safe',
          scrolled
            ? 'bg-[#080C14]/95 backdrop-blur-md border-b border-[#606C38]/15 shadow-[0_1px_24px_rgba(0,0,0,0.4)]'
            : 'bg-[#080C14]/70 backdrop-blur-sm border-b border-white/[0.04]',
        )}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center font-black text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #264653, #606C38)', border: '1px solid rgba(96,108,56,0.3)' }}>
                ML
              </div>
              <span className="font-bold text-white text-[15px] tracking-tight">MotionLab</span>
            </Link>

            {/* Desktop nav — full at 1400px+ */}
            <nav className="hidden min-[1400px]:flex items-center gap-0.5">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-4 py-2 rounded-[6px] text-sm font-medium transition-all duration-150',
                    location.pathname === link.to
                      ? 'text-[#8a9c4a] bg-[#606C38]/10'
                      : 'text-white/50 hover:text-white/90 hover:bg-white/5',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA buttons — desktop */}
            <div className="hidden min-[1400px]:flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5">
                  Log in
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="font-semibold text-white"
                  style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Hamburger — below 1400px */}
            <button
              className="min-[1400px]:hidden flex items-center justify-center w-10 h-10 rounded-[6px] text-white/60 hover:text-white hover:bg-white/8 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 min-[1400px]:hidden transition-all duration-300',
          mobileOpen ? 'visible' : 'invisible',
        )}
      >
        {/* Backdrop */}
        <div
          className={cn('absolute inset-0 bg-black/40 transition-opacity duration-300', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={cn(
            'absolute top-0 right-0 bottom-0 w-[min(300px,85vw)] shadow-2xl transition-transform duration-300 flex flex-col pt-safe pb-safe',
            mobileOpen ? 'translate-x-0' : 'translate-x-full',
          )}
          style={{ background: '#0D1420', borderLeft: '1px solid rgba(96,108,56,0.2)' }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 h-16" style={{ borderBottom: '1px solid rgba(96,108,56,0.12)' }}>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[6px] flex items-center justify-center font-black text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #264653, #606C38)' }}>
                ML
              </div>
              <span className="font-bold text-white text-sm">MotionLab</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-[6px] text-white/40 hover:text-white hover:bg-white/8 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center px-4 py-3 rounded-[6px] text-sm font-medium transition-colors min-h-[44px]',
                  location.pathname === link.to
                    ? 'text-[#8a9c4a] bg-[#606C38]/10'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="px-4 py-5 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(96,108,56,0.12)' }}>
            <Link to="/auth?mode=signup">
              <Button fullWidth className="font-semibold text-white" style={{ background: '#606C38', border: 'none' }}>
                Get Started
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" fullWidth className="text-white/60 border-white/10 hover:bg-white/5 hover:text-white">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer so content isn't hidden under fixed nav */}
      <div className="h-16 lg:h-18 shrink-0" />
    </>
  )
}
