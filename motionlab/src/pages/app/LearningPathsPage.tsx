/**
 * Phase 2 — Learning Paths Page (/learn)
 * PRD §5.5: Structured beginner→advanced journeys per sport.
 */

import { Link } from 'react-router-dom'
import { CheckCircle, Lock, ArrowRight, BookOpen, Trophy } from 'lucide-react'
import { NodeLine, PillTag, FuturisticCard, SectionHeader, DarkSection } from '@/components/ui/FuturisticElements'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const LEARNING_PATHS = [
  {
    sport: 'Table Tennis',
    icon: '🏓',
    slug: 'table-tennis',
    available: true,
    paths: [
      {
        level: 'beginner',
        title: 'TT Foundations',
        desc: 'Grip, stance, forehand & backhand basics, first warmup protocol',
        lessons: 8,
        duration: '3 hours',
        completed: 0,
      },
      {
        level: 'intermediate',
        title: 'TT Performance',
        desc: 'Topspin mechanics, footwork patterns, serve science, shoulder injury prevention',
        lessons: 12,
        duration: '5 hours',
        completed: 0,
      },
      {
        level: 'advanced',
        title: 'TT Mastery',
        desc: 'Match tactics, kinetic chain analysis, deload protocols, elite warmup',
        lessons: 10,
        duration: '4 hours',
        completed: 0,
      },
    ],
  },
  {
    sport: 'Football',
    icon: '⚽',
    slug: 'football',
    available: true,
    paths: [
      {
        level: 'beginner',
        title: 'Football Foundations',
        desc: 'Passing mechanics, first touch, FIFA 11+ warmup protocol basics',
        lessons: 7,
        duration: '2.5 hours',
        completed: 0,
      },
      {
        level: 'intermediate',
        title: 'Football Performance',
        desc: 'Sprint mechanics, ACL prevention, hamstring loading, positional demands',
        lessons: 11,
        duration: '4.5 hours',
        completed: 0,
      },
      {
        level: 'advanced',
        title: 'Football Mastery',
        desc: 'Periodisation, pre-season conditioning, return from injury science',
        lessons: 9,
        duration: '4 hours',
        completed: 0,
      },
    ],
  },
  {
    sport: 'Basketball',
    icon: '🏀',
    slug: 'basketball',
    available: false,
    paths: [],
  },
  {
    sport: 'Running',
    icon: '🏃',
    slug: 'running',
    available: false,
    paths: [],
  },
]

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#264653',
  intermediate: '#606C38',
  advanced: '#8a9c4a',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
}

export default function LearningPathsPage() {
  const available = LEARNING_PATHS.filter(p => p.available)
  const coming = LEARNING_PATHS.filter(p => !p.available)

  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Header */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute inset-0 grid-overlay pointer-events-none opacity-60" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-5">Learning Paths</PillTag>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Structured journeys, <span className="text-gradient-olive">sport by sport</span>
          </h1>
          <p className="text-white/45 max-w-2xl text-sm leading-relaxed">
            Each sport has three progressive learning paths — Beginner, Intermediate, and Advanced — covering technique, movement science, injury prevention, training, and recovery.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <NodeLine />
        </div>
      </section>

      {/* Progress summary row */}
      <div className="py-5" style={{ background: '#0D1420', borderBottom: '1px solid rgba(96,108,56,0.1)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 flex-wrap">
            {[
              { num: '0', label: 'Lessons completed' },
              { num: '0', label: 'Paths started' },
              { num: '0', label: 'Certifications earned' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <p className="text-xl font-black text-gradient-olive">{s.num}</p>
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available paths */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {available.map(sport => (
              <div key={sport.slug}>
                {/* Sport header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{sport.icon}</span>
                  <h2 className="text-lg font-bold text-white">{sport.sport}</h2>
                  <div className="flex-1 h-px" style={{ background: 'rgba(96,108,56,0.1)' }} />
                  <Link to={`/sports/${sport.slug}`} className="text-xs text-[#8a9c4a]/70 hover:text-[#8a9c4a] transition-colors font-mono flex items-center gap-1">
                    Sport hub <ArrowRight size={10} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sport.paths.map((path, i) => {
                    const color = LEVEL_COLORS[path.level]
                    const pct = path.lessons > 0 ? Math.round((path.completed / path.lessons) * 100) : 0
                    return (
                      <FuturisticCard key={path.level} className="flex flex-col">
                        {/* Level badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}>
                            {LEVEL_LABELS[path.level]}
                          </span>
                          <div className="step-badge">{String(i + 1).padStart(2, '0')}</div>
                        </div>

                        <h3 className="text-white/90 font-bold text-base mb-1.5">{path.title}</h3>
                        <p className="text-white/40 text-xs leading-relaxed mb-4 flex-1">{path.desc}</p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mb-4">
                          <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/25">
                            <BookOpen size={10} /> {path.lessons} lessons
                          </span>
                          <span className="font-mono text-[9px] text-white/25">{path.duration}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(96,108,56,0.1)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <p className="font-mono text-[9px] text-white/20 mt-1">{pct}% complete</p>
                        </div>

                        <Link to={`/sports/${sport.slug}`}>
                          <Button size="sm" fullWidth className="font-semibold text-white"
                            style={{ background: i === 0 ? color : 'transparent', border: `1px solid ${color}40` }}>
                            {path.completed > 0 ? 'Continue' : 'Start Path'} <ArrowRight size={12} className="ml-1.5" />
                          </Button>
                        </Link>
                      </FuturisticCard>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <DarkSection>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Coming Soon" title="More sports unlocking in 2025" dark />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {coming.map(sport => (
              <div key={sport.slug} className="text-center p-5 rounded-xl border border-[#606C38]/8 opacity-50">
                <span className="text-3xl mb-2 block">{sport.icon}</span>
                <p className="text-white/40 text-sm font-medium">{sport.sport}</p>
                <p className="font-mono text-[9px] text-white/20 mt-1 uppercase tracking-wider">Soon</p>
              </div>
            ))}
          </div>
        </div>
      </DarkSection>

      {/* Certification callout */}
      <section className="py-14" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <FuturisticCard className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.3)' }}>
              <Trophy size={22} className="text-[#8a9c4a]" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Earn certifications</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-md mx-auto mb-6">
              Complete a full learning path (all 3 levels) for a sport and earn a MotionLab certificate — verifying your sports science knowledge for that discipline.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-white/25">
              <span>Table Tennis Foundation</span>
              <span>·</span>
              <span>Football Performance</span>
              <span>·</span>
              <span>More coming</span>
            </div>
          </FuturisticCard>
        </div>
      </section>
    </div>
  )
}
