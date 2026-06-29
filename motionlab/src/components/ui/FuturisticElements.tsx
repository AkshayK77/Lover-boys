/**
 * Shared futuristic UI primitives used across all pages.
 * Keeps the visual language consistent — olive grid lines, corner brackets, node dividers.
 */

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* ── Horizontal rule with glowing node dots ─────────────── */
export function NodeLine({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-3 ${className}`}>
      <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none"
        className="absolute top-1/2 -translate-y-1/2 overflow-visible">
        <line x1="0" y1="6" x2="1200" y2="6" stroke="rgba(96,108,56,0.25)" strokeWidth="1" />
        {[120, 300, 480, 600, 720, 900, 1080].map(x => (
          <g key={x}>
            <circle cx={x} cy="6" r="2.5" fill="#606C38" opacity="0.6" />
            <circle cx={x} cy="6" r="5" fill="none" stroke="#606C38" strokeWidth="0.5" opacity="0.3" />
          </g>
        ))}
        <circle cx="600" cy="6" r="4" fill="#606C38" opacity="0.9" />
        <circle cx="600" cy="6" r="9" fill="none" stroke="#606C38" strokeWidth="1" opacity="0.35" />
      </svg>
    </div>
  )
}

/* ── Corner bracket box (targeting reticle) ─────────────── */
export function CornerBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative p-4 ${className}`}>
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#606C38]/50" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#606C38]/50" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#606C38]/50" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#606C38]/50" />
      {children}
    </div>
  )
}

/* ── Pill tag ──────────────────────────────────────────── */
export function PillTag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('pill-tag', className)}>{children}</span>
  )
}

/* ── Section header ────────────────────────────────────── */
export function SectionHeader({
  tag,
  title,
  subtitle,
  dark = false,
  accentWord,
}: {
  tag?: string
  title: string
  subtitle?: string
  dark?: boolean
  accentWord?: string
}) {
  const headingColor = dark ? 'text-white' : 'text-[#0D1420]'
  const subColor = dark ? 'text-white/40' : 'text-[#6B7280]'

  const renderTitle = () => {
    if (!accentWord) return title
    const parts = title.split(accentWord)
    return (
      <>
        {parts[0]}
        <span className={dark ? 'text-gradient-olive' : 'text-[#606C38]'}>{accentWord}</span>
        {parts[1]}
      </>
    )
  }

  return (
    <div className="text-center mb-14">
      {tag && <PillTag className="mb-6 mx-auto">{tag}</PillTag>}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 ${headingColor}`}>
        {renderTitle()}
      </h2>
      {subtitle && <p className={`text-base max-w-xl mx-auto ${subColor}`}>{subtitle}</p>}
    </div>
  )
}

/* ── Futuristic card ───────────────────────────────────── */
export function FuturisticCard({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn('card-futuristic rounded-xl p-5 relative group', onClick && 'cursor-pointer', className)}
    >
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#606C38]/30 group-hover:border-[#606C38]/60 transition-colors" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#606C38]/30 group-hover:border-[#606C38]/60 transition-colors" />
      {children}
    </div>
  )
}

/* ── Light card (for white/light sections) ─────────────── */
export function LightCard({
  children,
  className = '',
  hover = true,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={cn(
      'relative rounded-xl border bg-white p-5 group transition-all duration-200',
      hover && 'hover:border-[#606C38]/30 hover:shadow-sm',
      className,
    )} style={{ borderColor: '#E5E7EB' }}>
      {hover && (
        <>
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-transparent group-hover:border-[#606C38]/40 transition-colors" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-transparent group-hover:border-[#606C38]/40 transition-colors" />
        </>
      )}
      {children}
    </div>
  )
}

/* ── Step badge ────────────────────────────────────────── */
export function StepBadge({ step }: { step: string }) {
  return (
    <div className="step-badge">{step}</div>
  )
}

/* ── Dark section wrapper ──────────────────────────────── */
export function DarkSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-28', className)} style={{ background: '#080C14' }}>
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <div className="scanline pointer-events-none" />
      {children}
      <div className="absolute bottom-0 left-0 right-0 px-8">
        <NodeLine />
      </div>
    </section>
  )
}
