/**
 * Phase 2 — Injury Prevention Page (/injury-prevention)
 * PRD §5.4: Sport-specific injury prevention hub with expert-reviewed warmup protocols.
 */

import { useState } from 'react'
import { Shield, Clock, ChevronRight, AlertTriangle } from 'lucide-react'
import { NodeLine, PillTag, FuturisticCard, SectionHeader, DarkSection } from '@/components/ui/FuturisticElements'
import { cn } from '@/lib/utils'

const RISK_DATA = [
  { muscle: 'Rotator Cuff', sport: 'Table Tennis', risk: 'HIGH', cause: 'Repetitive shoulder internal rotation without adequate posterior capsule mobility', prevention: '8-min TT shoulder warmup, posterior capsule stretch, external rotation strengthening' },
  { muscle: 'Hamstring', sport: 'Football', risk: 'HIGH', cause: 'Eccentric overload during late swing phase of sprinting, especially when fatigued', prevention: 'Nordic curl protocol (3×6 eccentric), progressive pre-season loading, FIFA 11+' },
  { muscle: 'ACL', sport: 'Football', risk: 'HIGH', cause: 'Knee valgus during deceleration, cutting, and landing — especially in female athletes', prevention: 'FIFA 11+, single-leg squat screening, hip abductor strengthening' },
  { muscle: 'Medial Epicondyle', sport: 'Table Tennis', risk: 'MODERATE', cause: 'Forearm pronation overload from high-volume topspin play without adequate forearm strength', prevention: 'Reverse wrist curls, eccentric wrist extension, session volume management' },
  { muscle: 'Achilles Tendon', sport: 'Football', risk: 'MODERATE', cause: 'Sudden increase in training load, inadequate calf strength, poor ankle mobility', prevention: 'Progressive loading, eccentric calf raises, load management' },
  { muscle: 'Ankle (lateral)', sport: 'Football', risk: 'MODERATE', cause: 'Lateral ankle sprain during change of direction on uneven surfaces', prevention: 'Proprioception training, peroneal strengthening, taping during high-risk matches' },
]

const PROTOCOLS = [
  {
    sport: 'Table Tennis',
    icon: '🏓',
    duration: '8 min',
    title: 'TT Shoulder & Wrist Warmup',
    phases: [
      { name: 'Phase 1 — Circulation', duration: '2 min', exercises: ['Arm circles: 30 sec each direction per arm', 'Shoulder shrugs with rotation: 30 reps', 'Band pull-aparts: 20 reps (if band available)'] },
      { name: 'Phase 2 — Mobility', duration: '3 min', exercises: ['Cross-body posterior shoulder stretch: 30 sec × 2 each side', 'Doorway chest opener: 30 sec × 2', 'Wrist circles: 30 sec each direction', 'Forearm pronation/supination: 20 reps each'] },
      { name: 'Phase 3 — Activation', duration: '3 min', exercises: ['Band external rotation: 15 reps each arm', 'Side-lying external rotation: 12 reps each arm', 'Scapular wall slides: 10 reps'] },
    ],
    expertNote: 'The posterior capsule stretch in Phase 2 is the most evidence-backed exercise for TT shoulder injury prevention. Do not skip it.',
    expert: 'Dr. Ananya Sharma, MPT (Sports)',
  },
  {
    sport: 'Football',
    icon: '⚽',
    duration: '15–20 min',
    title: 'FIFA 11+ Protocol',
    phases: [
      { name: 'Part 1 — Running', duration: '8 min', exercises: ['Jogging in straight lines with progressive speed', 'Hip abduction / adduction whilst jogging', 'Hip external / internal rotation whilst jogging', 'Jogging with shoulder contact (partner exercise)'] },
      { name: 'Part 2 — Strength & Balance', duration: '10 min', exercises: ['Nordic hamstring curls: 2-3 × 6-8 reps ← MOST CRITICAL', 'Single-leg balance: 3 × 30 sec each leg', 'Dynamic lunges with trunk rotation: 3 × 5 each', 'Lateral hops with stabilisation: 3 × 5 each', 'Squat jumps with soft landing: 2 × 10', 'Vertical jumps with proper landing mechanics: 2 × 10'] },
      { name: 'Part 3 — Running', duration: '2 min', exercises: ['Progressive speed runs: easy → fast → sprint', 'Bounding strides: 4 × 20m'] },
    ],
    expertNote: 'RCT evidence shows FIFA 11+ reduces overall injury incidence by 30-50%. The Nordic hamstring curl in Part 2 accounts for most of the hamstring protection benefit.',
    expert: 'Vikram Patel, MSc Sports Science',
  },
]

const RISK_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  HIGH: { text: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)' },
  MODERATE: { text: '#fbbf24', bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)' },
  LOW: { text: '#8a9c4a', bg: 'rgba(138,156,74,0.06)', border: 'rgba(138,156,74,0.2)' },
}

export default function InjuryPreventionPage() {
  const [openProtocol, setOpenProtocol] = useState<number | null>(0)
  const [openPhase, setOpenPhase] = useState<Record<string, boolean>>({})

  function togglePhase(key: string) {
    setOpenPhase(p => ({ ...p, [key]: !p[key] }))
  }

  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Header */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute inset-0 grid-overlay pointer-events-none opacity-60" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-5">Injury Prevention</PillTag>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            <span className="text-gradient-olive">Sport-specific</span> warmup & prevention
          </h1>
          <p className="text-white/45 max-w-2xl text-sm leading-relaxed">
            Expert-reviewed warmup protocols and evidence-based injury prevention strategies for every sport on MotionLab. Prevention, not treatment.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <NodeLine />
        </div>
      </section>

      {/* Injury risk map */}
      <section className="py-12 lg:py-14" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={18} className="text-[#fbbf24]" />
            <h2 className="text-xl font-bold text-white">Injury Risk Map</h2>
          </div>
          <p className="text-white/35 text-sm mb-8">The injuries that occur most frequently in each sport — and how to prevent them.</p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(96,108,56,0.1)' }}>
                  {['Injury Site', 'Sport', 'Risk Level', 'Mechanism', 'Prevention'].map(h => (
                    <th key={h} className="pb-3 pr-4 text-left font-mono text-[9px] text-white/25 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RISK_DATA.map((row, i) => {
                  const color = RISK_COLORS[row.risk]
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(96,108,56,0.06)' }}>
                      <td className="py-4 pr-4 text-white/80 text-sm font-medium">{row.muscle}</td>
                      <td className="py-4 pr-4 text-white/50 text-xs">{row.sport}</td>
                      <td className="py-4 pr-4">
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-white/35 text-xs max-w-[200px]">{row.cause}</td>
                      <td className="py-4 text-[#8a9c4a]/70 text-xs max-w-[200px]">{row.prevention}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <NodeLine />
        </div>
      </section>

      {/* Warmup protocols */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Expert Protocols"
            title="Warmup protocols by sport"
            subtitle="Evidence-based warmup sequences reviewed by credentialled sports scientists and physiotherapists. Not generic stretching — sport-specific activation."
            dark
            accentWord="by sport"
          />

          <div className="space-y-4 max-w-4xl mx-auto">
            {PROTOCOLS.map((protocol, pi) => (
              <div key={protocol.sport} className="rounded-xl overflow-hidden" style={{ border: openProtocol === pi ? '1px solid rgba(96,108,56,0.35)' : '1px solid rgba(96,108,56,0.1)' }}>
                {/* Protocol header */}
                <button
                  onClick={() => setOpenProtocol(o => o === pi ? null : pi)}
                  className="w-full flex items-center gap-5 p-5 text-left hover:bg-white/[0.01] transition-colors"
                >
                  <span className="text-3xl">{protocol.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#8a9c4a]">{protocol.sport}</span>
                      <span className="flex items-center gap-1 font-mono text-[9px] text-white/25">
                        <Clock size={9} /> {protocol.duration}
                      </span>
                    </div>
                    <p className="text-white/85 font-bold text-sm">{protocol.title}</p>
                  </div>
                  <Shield size={16} className={openProtocol === pi ? 'text-[#8a9c4a]' : 'text-white/20'} />
                  <ChevronRight size={16} className={cn('text-white/20 transition-transform', openProtocol === pi && 'rotate-90')} />
                </button>

                {/* Protocol body */}
                {openProtocol === pi && (
                  <div className="px-5 pb-5 border-t border-[#606C38]/10">
                    {/* Expert note */}
                    <div className="rounded-lg px-4 py-3 mt-4 mb-5" style={{ background: 'rgba(96,108,56,0.06)', border: '1px solid rgba(96,108,56,0.1)' }}>
                      <p className="font-mono text-[9px] text-[#8a9c4a] uppercase tracking-wider mb-1">Expert Note — {protocol.expert}</p>
                      <p className="text-white/50 text-xs leading-relaxed italic">"{protocol.expertNote}"</p>
                    </div>

                    {/* Phases */}
                    <div className="space-y-3">
                      {protocol.phases.map((phase, phi) => {
                        const key = `${pi}-${phi}`
                        return (
                          <div key={phi} className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(96,108,56,0.08)' }}>
                            <button
                              onClick={() => togglePhase(key)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left"
                            >
                              <div className="step-badge shrink-0">{String(phi + 1).padStart(2, '0')}</div>
                              <div className="flex-1">
                                <p className="text-white/75 text-sm font-medium">{phase.name}</p>
                              </div>
                              <span className="font-mono text-[9px] text-white/25">{phase.duration}</span>
                              <ChevronRight size={13} className={cn('text-white/20 transition-transform', openPhase[key] && 'rotate-90')} />
                            </button>
                            {openPhase[key] && (
                              <ul className="px-4 pb-3 space-y-1.5 border-t border-[#606C38]/8">
                                {phase.exercises.map((ex, ei) => (
                                  <li key={ei} className="flex items-start gap-2 text-xs text-white/45 pt-1.5">
                                    <span className="text-[#606C38] mt-0.5">→</span>
                                    {ex}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prevention principles */}
      <DarkSection>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Principles" title="How injury prevention works" dark accentWord="works" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Load management', body: 'Most injuries occur when training load spikes faster than the tissue\'s adaptation rate. Progressive loading is the primary prevention tool.' },
              { step: '02', title: 'Tissue strength > flexibility', body: 'Static stretching doesn\'t reduce injury risk. Eccentric strength training of the target tissue does — Nordic curl, eccentric calf raises, rotator cuff loading.' },
              { step: '03', title: 'Warm tissue, fast tissue', body: 'Muscle temperature increases contractile force and reduces viscosity. A proper warmup increases peak power output by 8-12% — and reduces strain risk.' },
            ].map(p => (
              <FuturisticCard key={p.step}>
                <div className="step-badge mb-4">{p.step}</div>
                <h4 className="text-white/90 font-bold text-sm mb-2">{p.title}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{p.body}</p>
              </FuturisticCard>
            ))}
          </div>
        </div>
      </DarkSection>
    </div>
  )
}
