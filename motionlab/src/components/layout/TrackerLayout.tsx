import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * Sub-shell for the Train section. Rendered inside the protected AppLayout
 * (which already renders AuthNav with top-level Train/Learn/Connect nav).
 * This adds the Train-only tab strip so Dashboard/Workout/Nutrition/
 * Progress/Body Lab can be switched between without leaving the section.
 */
const TRAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workout', label: 'Workout' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/progress', label: 'Progress' },
  { to: '/anatomy', label: 'Body Lab' },
  { to: '/exercises', label: 'Exercises' },
]

export function TrackerLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div
        className="sticky top-16 z-30 flex flex-wrap items-center gap-1.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3"
        style={{ background: '#080C14', borderBottom: '1px solid rgba(96,108,56,0.08)' }}
      >
        {TRAIN_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'px-3.5 py-2 rounded-[8px] text-sm font-semibold transition-colors min-h-[42px] flex items-center',
                isActive ? 'text-[#8a9c4a]' : 'text-white/55 hover:text-white/85',
              )
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.3)' }
                : { background: '#0D1420', border: '1px solid rgba(96,108,56,0.14)' }
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
