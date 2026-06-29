/**
 * Phase 2 — Movement Science Page (/movement-science)
 * PRD §5.6: Interactive biomechanics viewer with anatomy diagram and sport-specific content.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnatomyDiagram } from '@/components/ui/AnatomyDiagram'
import { NodeLine, PillTag, FuturisticCard, SectionHeader } from '@/components/ui/FuturisticElements'

const SPORT_BIOMECHANICS = [
  {
    sport: 'Table Tennis',
    icon: '🏓',
    slug: 'table-tennis',
    primaryMuscles: ['shoulders', 'forearms', 'abs'],
    topicCards: [
      { title: 'Forehand Kinetic Chain', body: 'Hip → trunk → shoulder → forearm → wrist. Breaking this chain shifts load to distal joints.' },
      { title: 'Wrist Pronation Velocity', body: 'Primary driver of topspin generation. Angular velocity of ~800°/sec in advanced players.' },
      { title: 'Posterior Capsule Tightness', body: 'Most common cause of TT shoulder pain. Measured by cross-body reach test; treated with horizontal stretch.' },
    ],
  },
  {
    sport: 'Football',
    icon: '⚽',
    slug: 'football',
    primaryMuscles: ['quads', 'hamstrings', 'glutes'],
    topicCards: [
      { title: 'ACL Loading in Cutting', body: 'Peak ACL stress occurs at ~25° knee flexion during deceleration. Knee valgus multiplies this load 3-4×.' },
      { title: 'Hamstring Eccentric Load', body: 'Greatest hamstring strain risk occurs at 85-90% of swing phase — when muscle is both stretched and contracting.' },
      { title: 'Hip Abductor Weakness', body: 'Most significant modifiable risk factor for knee valgus collapse. Tested via single-leg squat screening.' },
    ],
  },
]

const BIOMECH_CONCEPTS = [
  {
    id: 'kinetic-chain',
    title: 'Kinetic Chain',
    shortDef: 'How force travels from ground to contact point through sequential joint segments.',
    detail: 'In sport, ground reaction force is the start of every movement. It travels upward through the ankle, knee, hip, trunk, and into the upper limb. A break anywhere in the chain (weakness, poor mobility, fatigue) causes the next joint to compensate — and increases its injury risk. This is why a footballer with poor hip mobility develops knee problems, and why a table tennis player with stiff hips overloads their shoulder.',
    example: 'TT forehand: ground push → hip rotation → trunk drive → shoulder internal rotation → forearm pronation → wrist snap',
  },
  {
    id: 'eccentric-loading',
    title: 'Eccentric Loading',
    shortDef: 'Muscle force generated while the muscle is being lengthened — the highest-risk loading condition.',
    detail: 'Eccentric contractions generate more force than concentric (shortening) contractions, but also create more muscle damage. Most athletic injuries occur during eccentric phases: hamstring strain at late swing phase of sprinting, rotator cuff tear during deceleration of a throwing motion, ACL tear during landing. Training the eccentric phase of key movements (Nordic curl, eccentric shoulder rotation) is the primary evidence-based injury prevention strategy.',
    example: 'Nordic curl trains the eccentric hamstring phase that would otherwise fail during sprint deceleration.',
  },
  {
    id: 'valgus-collapse',
    title: 'Knee Valgus',
    shortDef: 'Inward collapse of the knee during landing, cutting, or squatting — the primary ACL injury mechanism.',
    detail: 'Knee valgus (knee caving inward) occurs when hip abductors and external rotators are insufficient to maintain alignment. It dramatically increases ACL stress during the high-load moments of sport: landing from a jump, cutting, decelerating. It is the most trainable ACL risk factor. The single-leg squat test is the most reliable screening tool — if the knee caves inward at any depth, hip abductor and gluteus medius strengthening is indicated.',
    example: 'Single-leg squat: knee should track over second toe throughout the full range. Any valgus = hip weakness.',
  },
  {
    id: 'force-couples',
    title: 'Force Couples',
    shortDef: 'Two opposing muscles acting together to produce rotation at a joint without linear displacement.',
    detail: 'The shoulder rotator cuff works as a force couple — the rotators collectively depress the humeral head against the glenoid while the deltoid abducts. If any component of this force couple is weak, the humeral head migrates superiorly and impinges on the acromion. This is the primary mechanism of rotator cuff impingement in overhead athletes and racket sports players.',
    example: 'Supraspinatus + infraspinatus + subscapularis + teres minor = rotator cuff force couple that stabilises the shoulder.',
  },
]

export default function MovementSciencePage() {
  const [activeSport, setActiveSport] = useState(0)
  const [activeConcept, setActiveConcept] = useState<string | null>(null)
  const [highlightedMuscle, setHighlightedMuscle] = useState<string | null>(null)

  const sport = SPORT_BIOMECHANICS[activeSport]

  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Header */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute inset-0 grid-overlay pointer-events-none opacity-60" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-5">Movement Science</PillTag>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            The science of <span className="text-gradient-olive">how your body moves</span>
          </h1>
          <p className="text-white/45 max-w-2xl text-sm leading-relaxed">
            Interactive biomechanics content — explore muscle groups, understand force mechanics, and see how your sport loads specific joints and tissues.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <NodeLine />
        </div>
      </section>

      {/* Anatomy viewer */}
      <section className="py-12 lg:py-16" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-white">Body Lab</h2>
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-wider">— Click any muscle group to inspect</span>
          </div>
          <p className="text-white/35 text-sm mb-8">
            Explore all 11 muscle groups tracked in MotionLab's training system. Click a muscle to see function, injury risk, and key exercises.
          </p>

          <AnatomyDiagram
            highlightedMuscle={highlightedMuscle}
            onMuscleClick={id => setHighlightedMuscle(prev => prev === id ? null : id)}
            className="max-w-4xl"
          />
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <NodeLine />
        </div>
      </section>

      {/* Sport-specific biomechanics */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Sport Biomechanics"
            title="How your sport loads your body"
            dark
            accentWord="your body"
          />

          {/* Sport selector */}
          <div className="flex gap-3 mb-10 justify-center">
            {SPORT_BIOMECHANICS.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => { setActiveSport(i); setHighlightedMuscle(null) }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                  activeSport === i
                    ? 'text-white border-[#606C38]'
                    : 'text-white/35 border-[#606C38]/15 hover:text-white/60 hover:border-[#606C38]/30'
                }`}
                style={activeSport === i ? { background: '#606C38' } : {}}
              >
                <span>{s.icon}</span> {s.sport}
              </button>
            ))}
          </div>

          {/* Primary muscle highlight prompt */}
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(96,108,56,0.06)', border: '1px solid rgba(96,108,56,0.1)' }}>
            <p className="font-mono text-[10px] text-[#8a9c4a] uppercase tracking-wider mb-2">Primary muscles loaded in {sport.sport}</p>
            <div className="flex flex-wrap gap-2">
              {sport.primaryMuscles.map(m => (
                <button
                  key={m}
                  onClick={() => setHighlightedMuscle(prev => prev === m ? null : m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                    highlightedMuscle === m
                      ? 'border-[#606C38]/60 text-[#8a9c4a]'
                      : 'border-[#606C38]/15 text-white/40 hover:text-white/65'
                  }`}
                  style={highlightedMuscle === m ? { background: 'rgba(96,108,56,0.15)' } : {}}
                >
                  {m}
                </button>
              ))}
              <span className="text-white/20 text-xs self-center ml-1">← click to highlight in the Body Lab above</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sport.topicCards.map(card => (
              <FuturisticCard key={card.title}>
                <h4 className="text-white/85 font-bold text-sm mb-2">{card.title}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{card.body}</p>
              </FuturisticCard>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link to={`/sports/${sport.slug}`} className="inline-flex items-center gap-2 text-sm text-[#8a9c4a]/70 hover:text-[#8a9c4a] transition-colors font-mono">
              Full {sport.sport} biomechanics content →
            </Link>
          </div>
        </div>
      </section>

      {/* Biomechanics concepts */}
      <section className="py-12 lg:py-16" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Core Concepts"
            title="Movement science fundamentals"
            subtitle="The biomechanical principles that underpin every sport — injury mechanisms, force transfer, and the physics of athletic movement."
            dark
            accentWord="fundamentals"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {BIOMECH_CONCEPTS.map(concept => (
              <FuturisticCard
                key={concept.id}
                onClick={() => setActiveConcept(a => a === concept.id ? null : concept.id)}
                className="cursor-pointer"
              >
                <h4 className="text-white/90 font-bold text-sm mb-1.5">{concept.title}</h4>
                <p className="text-white/45 text-xs leading-relaxed mb-3">{concept.shortDef}</p>

                {activeConcept === concept.id && (
                  <div className="mt-3 pt-3 border-t border-[#606C38]/10 space-y-3">
                    <p className="text-white/55 text-xs leading-relaxed">{concept.detail}</p>
                    <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(96,108,56,0.06)', border: '1px solid rgba(96,108,56,0.1)' }}>
                      <p className="font-mono text-[9px] text-[#8a9c4a] uppercase tracking-wider mb-1">Example</p>
                      <p className="text-white/40 text-xs">{concept.example}</p>
                    </div>
                  </div>
                )}

                <p className="font-mono text-[10px] text-white/25 mt-3">
                  {activeConcept === concept.id ? '[ COLLAPSE ]' : '[ READ MORE ]'}
                </p>
              </FuturisticCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
