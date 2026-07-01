import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Dumbbell, BookOpen, Users, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Umbrella shell for the Tracker area. Rendered under PublicLayout so the
 * public top nav stays in place. Below it we surface three dropdowns —
 * Train (the toggleable sections), Learn, and Connect. Each is a real route,
 * so deep links stay valid. Learn/Connect pages live outside this layout, so
 * their own top gets a "Back to Tracker Dashboard" affordance via AppLayout.
 */
const TRAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workout', label: 'Workout' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/progress', label: 'Progress' },
]

const LEARN_LINKS = [
  { to: '/learn', label: 'Learning Paths' },
  { to: '/movement-science', label: 'Movement Science' },
  { to: '/injury-prevention', label: 'Injury Prevention' },
  { to: '/sports', label: 'Sports Library' },
]

const CONNECT_LINKS = [
  { to: '/community', label: 'Community' },
  { to: '/experts', label: 'Expert Hub' },
  { to: '/ai', label: 'AI Coach' },
  { to: '/library', label: 'My Library' },
]

function NavDropdown({ label, icon, links }: { label: string; icon: React.ReactNode; links: { to: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const isActive = links.some(l => location.pathname === l.to)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Close when the route changes (e.g. after picking an item)
  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-sm font-semibold transition-colors min-h-[42px]',
          isActive ? 'text-[#8a9c4a]' : 'text-white/55 hover:text-white/85',
        )}
        style={isActive
          ? { background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.3)' }
          : { background: '#0D1420', border: '1px solid rgba(96,108,56,0.14)' }}
        aria-expanded={open}
      >
        {icon}
        {label}
        <ChevronDown size={14} className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 w-56 rounded-[10px] py-1.5 z-50"
          style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.18)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
        >
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2.5 text-sm transition-colors min-h-[42px]',
                  isActive ? 'text-[#8a9c4a] font-medium' : 'text-white/50 hover:text-white/85',
                )
              }
              style={({ isActive }) => (isActive ? { background: 'rgba(96,108,56,0.08)' } : {})}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function TrackerLayout() {
  return (
    <div style={{ background: '#080C14', minHeight: 'calc(100dvh - 64px)' }}>
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-safe flex flex-col gap-6">
        {/* Secondary nav — Train / Learn / Connect dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <NavDropdown label="Train" icon={<Dumbbell size={14} />} links={TRAIN_LINKS} />
          <NavDropdown label="Learn" icon={<BookOpen size={14} />} links={LEARN_LINKS} />
          <NavDropdown label="Connect" icon={<Users size={14} />} links={CONNECT_LINKS} />
        </div>

        <Outlet />
      </div>
    </div>
  )
}
