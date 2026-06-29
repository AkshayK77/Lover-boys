/**
 * Full-body anatomy diagram in the MotionLab futuristic design language.
 * Shows front and back views with labeled muscle groups in PRD §8.2 muscle_volume_log groups.
 * Same dark aesthetic as the hero biomechanics figure — grid, glow, monospace annotations.
 */

import { useState } from 'react'

// PRD §8.2: 11 muscle groups
const MUSCLE_GROUPS = {
  front: [
    { id: 'chest', label: 'PECTORALS', shortLabel: 'CHEST', x: 135, y: 170, annotX: 220, annotY: 155, color: '#606C38' },
    { id: 'shoulders', label: 'DELTOIDS', shortLabel: 'SHOULDERS', x: 85, y: 148, annotX: 28, annotY: 130, color: '#5a7a5a' },
    { id: 'biceps', label: 'BICEPS BRACHII', shortLabel: 'BICEPS', x: 68, y: 200, annotX: 18, annotY: 210, color: '#4a6a4a' },
    { id: 'forearms', label: 'FOREARM FLEXORS', shortLabel: 'FOREARMS', x: 60, y: 255, annotX: 10, annotY: 270, color: '#3d5c3d' },
    { id: 'abs', label: 'RECTUS ABDOMINIS', shortLabel: 'ABS', x: 135, y: 218, annotX: 222, annotY: 218, color: '#8a9c4a' },
    { id: 'quads', label: 'QUADRICEPS', shortLabel: 'QUADS', x: 118, y: 340, annotX: 200, annotY: 330, color: '#606C38' },
    { id: 'calves', label: 'GASTROCNEMIUS', shortLabel: 'CALVES', x: 118, y: 450, annotX: 200, annotY: 455, color: '#4a6a4a' },
  ],
  back: [
    { id: 'back', label: 'LATISSIMUS DORSI', shortLabel: 'LATS / BACK', x: 135, y: 185, annotX: 220, annotY: 175, color: '#606C38' },
    { id: 'shoulders', label: 'TRAPEZIUS', shortLabel: 'TRAPS', x: 135, y: 148, annotX: 220, annotY: 135, color: '#5a7a5a' },
    { id: 'triceps', label: 'TRICEPS BRACHII', shortLabel: 'TRICEPS', x: 185, y: 200, annotX: 235, annotY: 215, color: '#4a6a4a' },
    { id: 'glutes', label: 'GLUTEUS MAXIMUS', shortLabel: 'GLUTES', x: 135, y: 278, annotX: 222, annotY: 278, color: '#8a9c4a' },
    { id: 'hamstrings', label: 'BICEPS FEMORIS', shortLabel: 'HAMSTRINGS', x: 125, y: 350, annotX: 22, annotY: 345, color: '#606C38' },
    { id: 'calves', label: 'GASTROCNEMIUS', shortLabel: 'CALVES', x: 130, y: 455, annotX: 22, annotY: 455, color: '#4a6a4a' },
  ],
}

const MUSCLE_INFO: Record<string, { function: string; injury: string; exercise: string }> = {
  chest: { function: 'Horizontal push, shoulder horizontal adduction', injury: 'Pec strain, shoulder impingement', exercise: 'Bench press, cable flyes, push-ups' },
  shoulders: { function: 'Shoulder abduction, rotation, overhead press', injury: 'Rotator cuff tear, AC joint impingement', exercise: 'Overhead press, lateral raises, face pulls' },
  biceps: { function: 'Elbow flexion, forearm supination', injury: 'Bicep tendon rupture, tendinopathy', exercise: 'Barbell curl, incline dumbbell curl' },
  forearms: { function: 'Wrist flexion/extension, grip force', injury: 'Tennis elbow, golfer\'s elbow', exercise: 'Wrist curls, dead hangs, farmer carries' },
  abs: { function: 'Spinal flexion, core stabilisation, bracing', injury: 'Hernia, muscle strain, low back pain secondary', exercise: 'Planks, ab wheel, hanging leg raise' },
  quads: { function: 'Knee extension, walking, running, jumping', injury: 'ACL/MCL tear (indirect), patellar tendinopathy', exercise: 'Squats, leg press, Bulgarian split squat' },
  calves: { function: 'Plantarflexion, ankle stability, propulsion', injury: 'Achilles tendinopathy, calf strain', exercise: 'Standing calf raise, seated calf raise' },
  back: { function: 'Shoulder adduction, lat pull-down movement, posture', injury: 'Lat strain, lower back pain', exercise: 'Pull-ups, rows, deadlifts' },
  triceps: { function: 'Elbow extension, overhead push', injury: 'Tricep tendon rupture, elbow pain', exercise: 'Dips, skull crushers, tricep pushdown' },
  glutes: { function: 'Hip extension, abduction, external rotation', injury: 'Glute tendinopathy, piriformis syndrome', exercise: 'Hip thrusts, squats, deadlifts, glute bridges' },
  hamstrings: { function: 'Knee flexion, hip extension, sprint deceleration', injury: 'Hamstring strain (most common in field sports)', exercise: 'Romanian deadlift, Nordic curl, leg curl' },
}

/* ── Front view body paths ────────────────────────────── */
function FrontBody() {
  return (
    <g opacity="0.85">
      {/* Head */}
      <ellipse cx="135" cy="38" rx="24" ry="28" fill="#1a2430" stroke="rgba(96,108,56,0.5)" strokeWidth="1" />
      {/* Neck */}
      <rect x="126" y="62" width="18" height="26" rx="3" fill="#1a2430" stroke="rgba(96,108,56,0.3)" strokeWidth="1" />
      {/* Shoulders + clavicles */}
      <path d="M72 90 Q90 88 110 88 L115 118 Q90 122 72 115 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.5" />
      <path d="M198 90 Q180 88 160 88 L155 118 Q180 122 198 115 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.5" />
      {/* Torso */}
      <path d="M108 88 Q85 120 83 160 Q82 200 88 260 Q92 275 110 278 L130 280 L140 280 L160 278 Q178 275 182 260 Q188 200 187 160 Q185 120 162 88 Z" fill="#152030" stroke="rgba(96,108,56,0.35)" strokeWidth="1" />
      {/* Left arm */}
      <path d="M84 92 Q62 120 56 165 Q52 200 54 238 Q56 248 64 252 Q74 256 78 246 Q80 230 80 210 Q82 175 90 145 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Right arm */}
      <path d="M186 92 Q208 120 214 165 Q218 200 216 238 Q214 248 206 252 Q196 256 192 246 Q190 230 190 210 Q188 175 180 145 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Hips */}
      <path d="M88 270 Q85 290 88 310 L100 312 Q115 308 135 308 Q155 308 170 312 L182 310 Q185 290 182 270 Q160 278 135 280 Q110 278 88 270 Z" fill="#152030" stroke="rgba(96,108,56,0.3)" strokeWidth="0.8" />
      {/* Left thigh */}
      <path d="M88 308 Q75 340 74 380 Q74 415 80 432 Q86 445 100 448 Q112 445 116 432 Q120 415 118 380 Q116 340 110 308 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Right thigh */}
      <path d="M182 308 Q195 340 196 380 Q196 415 190 432 Q184 445 170 448 Q158 445 154 432 Q150 415 152 380 Q154 340 160 308 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Left lower leg */}
      <path d="M80 430 Q72 460 73 490 Q74 520 82 535 Q92 545 100 542 Q110 535 112 520 Q114 495 112 465 Q112 445 116 432 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Right lower leg */}
      <path d="M190 430 Q198 460 197 490 Q196 520 188 535 Q178 545 170 542 Q160 535 158 520 Q156 495 158 465 Q158 445 154 432 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Feet */}
      <ellipse cx="92" cy="546" rx="18" ry="9" fill="#1a2a38" stroke="rgba(96,108,56,0.2)" strokeWidth="0.5" />
      <ellipse cx="178" cy="546" rx="18" ry="9" fill="#1a2a38" stroke="rgba(96,108,56,0.2)" strokeWidth="0.5" />
    </g>
  )
}

/* ── Back view body paths ─────────────────────────────── */
function BackBody() {
  return (
    <g opacity="0.85">
      {/* Head */}
      <ellipse cx="135" cy="38" rx="24" ry="28" fill="#1a2430" stroke="rgba(96,108,56,0.5)" strokeWidth="1" />
      {/* Neck */}
      <rect x="126" y="62" width="18" height="26" rx="3" fill="#1a2430" stroke="rgba(96,108,56,0.3)" strokeWidth="1" />
      {/* Upper traps / shoulders */}
      <path d="M68 90 Q90 84 135 82 Q180 84 202 90 Q210 105 202 118 Q180 122 135 124 Q90 122 68 118 Q60 105 68 90 Z" fill="#152030" stroke="rgba(96,108,56,0.3)" strokeWidth="0.8" />
      {/* Back torso */}
      <path d="M110 118 Q84 150 82 200 Q80 240 86 265 Q90 278 110 280 L135 282 L160 280 Q180 278 184 265 Q190 240 188 200 Q186 150 160 118 Z" fill="#152030" stroke="rgba(96,108,56,0.35)" strokeWidth="1" />
      {/* Left arm */}
      <path d="M86 100 Q62 132 56 175 Q52 208 54 240 Q56 250 64 254 Q74 258 78 248 Q80 232 80 212 Q82 178 90 148 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Right arm */}
      <path d="M184 100 Q208 132 214 175 Q218 208 216 240 Q214 250 206 254 Q196 258 192 248 Q190 232 190 212 Q188 178 180 148 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Glutes / hips */}
      <path d="M86 268 Q82 295 86 315 Q100 325 135 325 Q170 325 184 315 Q188 295 184 268 Q160 280 135 282 Q110 280 86 268 Z" fill="#152030" stroke="rgba(96,108,56,0.35)" strokeWidth="0.8" />
      {/* Left thigh back */}
      <path d="M86 312 Q74 345 74 385 Q74 416 80 434 Q86 446 100 448 Q112 445 116 432 Q120 416 118 385 Q116 345 110 312 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Right thigh back */}
      <path d="M184 312 Q196 345 196 385 Q196 416 190 434 Q184 446 170 448 Q158 445 154 432 Q150 416 152 385 Q154 345 160 312 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Left lower leg back */}
      <path d="M80 432 Q72 462 73 490 Q74 522 82 536 Q92 546 100 542 Q110 536 112 522 Q114 496 112 466 Q112 446 116 432 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Right lower leg back */}
      <path d="M190 432 Q198 462 197 490 Q196 522 188 536 Q178 546 170 542 Q160 536 158 522 Q156 496 158 466 Q158 446 154 432 Z" fill="#152030" stroke="rgba(96,108,56,0.25)" strokeWidth="0.8" />
      {/* Feet */}
      <ellipse cx="92" cy="546" rx="18" ry="9" fill="#1a2a38" stroke="rgba(96,108,56,0.2)" strokeWidth="0.5" />
      <ellipse cx="178" cy="546" rx="18" ry="9" fill="#1a2a38" stroke="rgba(96,108,56,0.2)" strokeWidth="0.5" />
    </g>
  )
}

/* ── Muscle highlight overlay shapes ─────────────────── */
const MUSCLE_OVERLAYS: Record<string, { front?: string; back?: string }> = {
  chest:      { front: 'M108 130 Q108 128 135 124 Q162 128 162 130 Q168 145 165 170 Q160 180 135 183 Q110 180 105 170 Q102 145 108 130 Z' },
  shoulders:  {
    front: 'M72 90 Q90 84 110 90 L112 120 Q90 128 70 118 Z',
    back:  'M160 90 Q180 84 200 90 L202 118 Q180 128 158 120 Z',
  },
  biceps:     { front: 'M64 148 Q58 150 54 180 Q52 208 58 228 Q68 240 78 232 Q84 215 84 192 Q84 165 78 148 Z' },
  forearms:   { front: 'M55 226 Q50 240 52 270 Q54 286 64 288 Q76 288 80 278 Q82 258 80 240 Q72 240 64 234 Z' },
  abs:        { front: 'M110 178 Q108 205 110 240 Q112 258 135 262 Q158 258 160 240 Q162 205 160 178 Q148 184 135 185 Q122 184 110 178 Z' },
  quads:      { front: 'M88 310 Q76 340 75 382 Q74 415 80 432 Q100 446 116 432 Q122 415 120 382 Q118 340 112 310 Z' },
  calves:     {
    front: 'M80 435 Q72 462 73 495 Q74 524 85 536 Q96 546 106 538 Q114 524 114 495 Q114 462 112 435 Z',
    back:  'M80 435 Q72 462 73 495 Q74 524 85 536 Q96 546 106 538 Q114 524 114 495 Q114 462 112 435 Z',
  },
  back:       { back: 'M108 122 Q84 155 82 200 Q80 240 90 265 Q110 280 135 282 Q160 280 180 265 Q190 240 188 200 Q186 155 162 122 Q148 130 135 132 Q122 130 108 122 Z' },
  triceps:    { back: 'M190 148 Q196 165 196 192 Q196 215 202 232 Q212 240 218 228 Q222 208 220 180 Q216 150 210 148 Z' },
  glutes:     { back: 'M86 268 Q82 295 86 316 Q100 326 135 326 Q170 326 184 316 Q188 295 184 268 Q162 280 135 282 Q108 280 86 268 Z' },
  hamstrings: { back: 'M90 315 Q76 345 75 383 Q74 415 80 432 Q96 446 115 432 Q122 415 120 383 Q118 345 110 315 Z' },
}

interface AnatomyDiagramProps {
  highlightedMuscle?: string | null
  onMuscleClick?: (muscleId: string) => void
  className?: string
}

export function AnatomyDiagram({ highlightedMuscle, onMuscleClick, className = '' }: AnatomyDiagramProps) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const activeMuscle = selected || highlightedMuscle || hovered

  function handleMuscleClick(id: string) {
    setSelected(s => s === id ? null : id)
    onMuscleClick?.(id)
  }

  const muscles = MUSCLE_GROUPS[view]
  const info = activeMuscle ? MUSCLE_INFO[activeMuscle] : null

  return (
    <div className={`relative ${className}`}>
      {/* View toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(['front', 'back'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              view === v
                ? 'bg-[#606C38] text-white'
                : 'text-white/40 border border-[#606C38]/20 hover:text-white/70'
            }`}
          >
            {v} view
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SVG figure */}
        <div className="relative mx-auto shrink-0" style={{ width: 270, height: 580 }}>
          <svg
            viewBox="0 0 270 580"
            width="270"
            height="580"
            style={{ display: 'block' }}
          >
            <defs>
              {/* Grid pattern */}
              <pattern id="ana-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(96,108,56,0.08)" strokeWidth="0.5" />
              </pattern>
              {/* Glow filter */}
              <filter id="ana-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Ambient glow filter */}
              <filter id="ana-amb" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feColorMatrix in="blur" type="matrix"
                  values="0.4 0.5 0.2 0 0  0.4 0.5 0.2 0 0  0 0 0 0 0  0 0 0 0.6 0" />
              </filter>
            </defs>

            {/* Background */}
            <rect width="270" height="580" fill="#080C14" />
            <rect width="270" height="580" fill="url(#ana-grid)" />

            {/* Body */}
            {view === 'front' ? <FrontBody /> : <BackBody />}

            {/* Muscle overlays (interactive) */}
            {muscles.map(m => {
              const overlayPath = MUSCLE_OVERLAYS[m.id]?.[view]
              if (!overlayPath) return null
              const isActive = activeMuscle === m.id
              return (
                <g key={`${view}-${m.id}`}
                  onClick={() => handleMuscleClick(m.id)}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Ambient glow when active */}
                  {isActive && (
                    <path d={overlayPath} fill={m.color} filter="url(#ana-amb)" opacity="0.6" />
                  )}
                  {/* Muscle fill */}
                  <path
                    d={overlayPath}
                    fill={m.color}
                    opacity={isActive ? 0.75 : 0.18}
                    filter={isActive ? 'url(#ana-glow)' : undefined}
                    style={{ transition: 'opacity 200ms' }}
                  />
                  {/* Border */}
                  <path
                    d={overlayPath}
                    fill="none"
                    stroke={m.color}
                    strokeWidth={isActive ? 1.2 : 0.5}
                    opacity={isActive ? 0.9 : 0.3}
                    style={{ transition: 'all 200ms' }}
                  />
                </g>
              )
            })}

            {/* Annotation lines + labels */}
            {muscles.map(m => {
              const isActive = activeMuscle === m.id
              const labelLeft = m.annotX < 120
              return (
                <g key={`label-${m.id}`}
                  onClick={() => handleMuscleClick(m.id)}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Dot on body */}
                  <circle
                    cx={m.x} cy={m.y} r={isActive ? 4 : 2.5}
                    fill={m.color}
                    opacity={isActive ? 0.9 : 0.5}
                    filter={isActive ? 'url(#ana-glow)' : undefined}
                    style={{ transition: 'all 200ms' }}
                  />
                  {/* Annotation line */}
                  <line
                    x1={m.x} y1={m.y}
                    x2={m.annotX} y2={m.annotY}
                    stroke={m.color}
                    strokeWidth="0.6"
                    strokeDasharray="3,2"
                    opacity={isActive ? 0.8 : 0.3}
                    style={{ transition: 'opacity 200ms' }}
                  />
                  {/* Label */}
                  <text
                    x={labelLeft ? m.annotX - 2 : m.annotX + 2}
                    y={m.annotY - 5}
                    textAnchor={labelLeft ? 'end' : 'start'}
                    fontFamily="monospace"
                    fontSize="7.5"
                    fontWeight="600"
                    letterSpacing="0.06em"
                    fill={isActive ? '#8a9c4a' : 'rgba(138,156,74,0.45)'}
                    style={{ transition: 'fill 200ms' }}
                  >
                    {m.shortLabel}
                  </text>
                </g>
              )
            })}

            {/* View label bottom */}
            <text x="135" y="572" textAnchor="middle" fontFamily="monospace" fontSize="8" letterSpacing="0.12em" fill="rgba(96,108,56,0.3)">
              {view.toUpperCase()} VIEW — CLICK TO INSPECT
            </text>
          </svg>
        </div>

        {/* Muscle info panel */}
        <div className="flex-1 min-w-0 lg:pt-8">
          {activeMuscle && info ? (
            <div className="rounded-xl border border-[#606C38]/20 bg-[#0D1420]/80 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#606C38] shadow-[0_0_8px_rgba(96,108,56,0.8)]" />
                <span className="font-mono text-xs text-[#8a9c4a] uppercase tracking-wider font-semibold">
                  {MUSCLE_GROUPS[view].find(m => m.id === activeMuscle)?.label ?? activeMuscle.toUpperCase()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Primary Function</p>
                  <p className="text-white/75 text-sm leading-relaxed">{info.function}</p>
                </div>
                <div className="w-full h-px bg-[#606C38]/10" />
                <div>
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Common Injuries</p>
                  <p className="text-white/75 text-sm leading-relaxed">{info.injury}</p>
                </div>
                <div className="w-full h-px bg-[#606C38]/10" />
                <div>
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Key Exercises</p>
                  <p className="text-white/75 text-sm leading-relaxed">{info.exercise}</p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-5 text-xs text-white/25 hover:text-white/50 transition-colors font-mono"
              >
                [ DESELECT ]
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-[#606C38]/10 bg-[#0D1420]/40 p-6 text-center">
              <div className="w-10 h-10 rounded-full border border-[#606C38]/25 flex items-center justify-center mx-auto mb-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(96,108,56,0.5)" strokeWidth="1" />
                  <circle cx="8" cy="8" r="2" fill="rgba(96,108,56,0.5)" />
                </svg>
              </div>
              <p className="font-mono text-xs text-white/30 uppercase tracking-wider">Select a muscle group</p>
              <p className="text-white/20 text-xs mt-2">Click any highlighted region or label to inspect function, injury risk, and key exercises</p>
            </div>
          )}

          {/* All groups quick-select */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MUSCLE_GROUPS[view].map(m => (
              <button
                key={m.id}
                onClick={() => handleMuscleClick(m.id)}
                className={`px-2.5 py-2 rounded-lg border text-left transition-all ${
                  activeMuscle === m.id
                    ? 'border-[#606C38]/50 bg-[#606C38]/12 text-[#8a9c4a]'
                    : 'border-[#606C38]/10 text-white/35 hover:border-[#606C38]/25 hover:text-white/55'
                }`}
              >
                <p className="font-mono text-[9px] uppercase tracking-wider leading-none mb-0.5">{m.shortLabel}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
