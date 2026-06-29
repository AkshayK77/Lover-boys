import { Link, useParams } from 'react-router-dom'
import { Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { NodeLine, PillTag, FuturisticCard, SectionHeader } from '@/components/ui/FuturisticElements'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const SPORTS = [
  {
    slug: 'table-tennis',
    name: 'Table Tennis',
    icon: '🏓',
    description: 'Wrist mechanics, footwork biomechanics, shoulder injury prevention, and serving science.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: true,
    tag: 'Full coverage',
  },
  {
    slug: 'football',
    name: 'Football / Soccer',
    icon: '⚽',
    description: 'ACL prevention, hamstring mechanics, sprint biomechanics, and sport-supplementary training.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: true,
    tag: 'Full coverage',
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    description: 'Knee health, jump mechanics, ankle stability, and vertical leap development.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: false,
    tag: 'Coming soon',
  },
  {
    slug: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    description: 'Shoulder mechanics, court movement efficiency, wrist and elbow injury prevention.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: false,
    tag: 'Coming soon',
  },
  {
    slug: 'running',
    name: 'Running',
    icon: '🏃',
    description: 'Gait analysis, shin splint prevention, cadence optimisation, and running economy.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: false,
    tag: 'Coming soon',
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    description: 'Serve mechanics, lateral agility, elbow and shoulder health, and clay vs hard court adaptation.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: false,
    tag: 'Coming soon',
  },
  {
    slug: 'cycling',
    name: 'Cycling',
    icon: '🚴',
    description: 'Bike fit mechanics, knee tracking, power output, and saddle sore prevention.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: false,
    tag: 'Coming soon',
  },
  {
    slug: 'swimming',
    name: 'Swimming',
    icon: '🏊',
    description: 'Stroke mechanics, shoulder impingement prevention, breathing patterns, and open water preparation.',
    pillars: ['Learn the Sport', 'Movement Science', 'Injury Prevention', 'Training', 'Recovery'],
    available: false,
    tag: 'Coming soon',
  },
]

const PILLARS = [
  { label: 'Learn the Sport', icon: '📚', desc: 'Technique, history, rules, and skill progressions' },
  { label: 'Movement Science', icon: '🧬', desc: 'Biomechanics, force vectors, and joint mechanics' },
  { label: 'Injury Prevention', icon: '🛡️', desc: 'Expert warmup protocols and risk reduction' },
  { label: 'Training', icon: '💪', desc: 'Sport-supplementary and periodised strength plans' },
  { label: 'Recovery', icon: '🔄', desc: 'Deload, load management, and return-to-play' },
]

export default function SportsPage() {
  const { slug } = useParams()

  // If a slug is passed, redirect to sport detail — handled by SportDetailPage in App.tsx
  // This component handles the /sports listing page only

  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="scanline pointer-events-none" />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(96,108,56,0.1) 0%, transparent 70%)' }} />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-6">Sports Library</PillTag>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
            Every sport,{' '}
            <span className="text-gradient-olive">5 pillars</span> deep
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            Deep sports science coverage — movement mechanics, injury prevention, expert-verified warmup protocols, and training plans built around your sport schedule.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <NodeLine />
        </div>
      </section>

      {/* 5 Pillars legend */}
      <section className="py-12" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-5">Every sport includes all 5 pillars</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {PILLARS.map((p, i) => (
              <div key={p.label} className="flex items-start gap-3 p-4 rounded-xl border border-[#606C38]/12 bg-[#080C14]/50">
                <div className="step-badge mt-0.5">{i + 1}</div>
                <div>
                  <p className="text-white/80 text-sm font-semibold mb-0.5">{p.label}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <NodeLine />
        </div>
      </section>

      {/* Sports grid */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 grid-overlay-fine pointer-events-none opacity-50" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="8 Sports"
            title="Choose your sport"
            subtitle="Table Tennis and Football launch with full 5-pillar coverage. More sports unlocking throughout 2025."
            dark
            accentWord="your sport"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {SPORTS.map(sport => (
              <div key={sport.slug} className="group">
                <FuturisticCard className={cn('flex flex-col h-full', !sport.available && 'opacity-60')}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{sport.icon}</span>
                    <div className="flex items-center gap-1.5">
                      {!sport.available && <Lock size={13} className="text-white/25" />}
                      <span className={cn(
                        'font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border',
                        sport.available
                          ? 'text-[#8a9c4a] border-[#606C38]/40 bg-[#606C38]/10'
                          : 'text-white/25 border-white/10',
                      )}>
                        {sport.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-base mb-2">{sport.name}</h3>
                  <p className="text-white/40 text-xs leading-relaxed mb-4 flex-1">{sport.description}</p>

                  {/* Pillars */}
                  <div className="flex flex-col gap-1.5 mb-5">
                    {sport.pillars.map(pillar => (
                      <div key={pillar} className="flex items-center gap-2 text-xs">
                        <CheckCircle size={11} className={sport.available ? 'text-[#606C38]' : 'text-white/15'} />
                        <span className={sport.available ? 'text-white/55' : 'text-white/20'}>{pillar}</span>
                      </div>
                    ))}
                  </div>

                  {sport.available ? (
                    <Link to={`/sports/${sport.slug}`}>
                      <Button size="sm" fullWidth className="text-white font-semibold"
                        style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
                        Explore {sport.name} <ArrowRight size={13} className="ml-1.5" />
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" fullWidth disabled variant="ghost"
                      className="border border-white/8 text-white/20">
                      Coming Soon
                    </Button>
                  )}
                </FuturisticCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#0D1420' }}>
        <div className="absolute inset-0 grid-overlay pointer-events-none opacity-60" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <PillTag className="mb-6 mx-auto">Join Free</PillTag>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Unlock the full <span className="text-gradient-olive">sports science library</span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto mb-8 text-base">
            Sign up free to access all lessons, learning paths, warmup protocols, and the AI coach — tailored to your sport.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="font-bold text-white px-8"
              style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
