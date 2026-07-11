import React, { useCallback, useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { supabase } from '@/lib/supabase'
import { callAI } from '@/lib/ai'
import { resolveExerciseName } from '@/lib/exerciseAliases'

// Loads step-by-step form instructions for an exercise. Primary source is the
// exercises table (backfilled from the enriched free-exercise-db dataset, which
// carries real instructions + a form thumbnail). If a row has no instructions we
// fall back to generating five concise steps via the ai-proxy (Groq).

interface ExerciseInfo {
  steps: string[]
  image: string | null
}

function parseSteps(instructions: string | null): string[] {
  if (!instructions) return []
  return instructions
    .split('\n')
    .map(l => l.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean)
}

async function lookupExercise(name: string): Promise<{ instructions: string | null; thumbnail_url: string | null } | null> {
  const { data } = await supabase
    .from('exercises')
    .select('instructions, thumbnail_url')
    .ilike('name', name)
    .limit(1)
    .maybeSingle()
  return data ?? null
}

async function fetchInfo(exerciseName: string): Promise<ExerciseInfo> {
  // Map the Body Lab's display name to its catalog name first, then strip any
  // parenthetical before the fuzzy fallbacks.
  const resolved = resolveExerciseName(exerciseName)
  const clean = resolved.replace(/\s*\(.*?\)/g, '').trim()

  let row = await lookupExercise(resolved).catch(() => null)
  if (!row && clean !== resolved) row = await lookupExercise(clean).catch(() => null)
  if (!row) {
    const firstTwo = clean.split(' ').slice(0, 2).join(' ')
    if (firstTwo !== clean) row = await lookupExercise(`${firstTwo}%`).catch(() => null)
  }

  const image = row?.thumbnail_url ?? null
  const dbSteps = parseSteps(row?.instructions ?? null)
  if (dbSteps.length) return { steps: dbSteps, image }

  // Fallback: generate with Groq via ai-proxy
  try {
    const result = await callAI(
      `Provide exactly 5 clear step-by-step instructions for performing the "${exerciseName}" exercise with proper form. Be concise — one sentence per step. Return JSON: { "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"] }`,
    )
    const steps = Array.isArray(result?.steps) ? (result.steps as string[]) : []
    return { steps, image }
  } catch {
    return { steps: [], image }
  }
}

export default function ExerciseModal({ exerciseName, onClose }: { exerciseName: string; onClose: () => void }) {
  const isMobile = useIsMobile()
  const [info, setInfo] = useState<ExerciseInfo>({ steps: [], image: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setInfo({ steps: [], image: null })
    setLoading(true)
    fetchInfo(exerciseName)
      .then(r => { if (!cancelled) { setInfo(r); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [exerciseName])

  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const modalStyle: React.CSSProperties = isMobile
    ? { ...s.modal, maxWidth: '100%', width: '100%', maxHeight: '92vh', borderRadius: '20px 20px 0 0', position: 'fixed', bottom: 0, left: 0, right: 0 }
    : s.modal

  return (
    <div style={{ ...s.backdrop, alignItems: isMobile ? 'flex-end' : 'center' }} onClick={handleBackdrop}>
      <div style={modalStyle}>
        <div style={s.header}>
          <h2 style={s.title}>{exerciseName}</h2>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={s.body}>
          {info.image && (
            <div style={s.imageRow}>
              {[info.image, info.image.replace(/\/0\.(jpg|png|jpeg)$/i, '/1.$1')].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${exerciseName} — ${i === 0 ? 'start' : 'end'} position`}
                  style={s.image}
                  loading="lazy"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              ))}
            </div>
          )}

          <p style={s.stepsLabel}>HOW TO PERFORM</p>
          {loading ? (
            <div style={s.stepsLoading}>
              {[95, 80, 92, 75, 88, 70].map((w, i) => (
                <div key={i} style={{ ...s.stepSkeleton, width: `${w}%` }} />
              ))}
            </div>
          ) : info.steps.length === 0 ? (
            <p style={s.errorText}>Could not load instructions for this exercise.</p>
          ) : (
            <ol style={s.stepsList}>
              {info.steps.map((step, i) => (
                <li key={i} style={s.stepItem}>
                  <span style={s.stepNum}>{i + 1}</span>
                  <span style={s.stepText}>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#0D1420',
    border: '1px solid rgba(96,108,56,0.2)',
    borderRadius: '14px',
    width: '100%', maxWidth: '520px', maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(96,108,56,0.2)',
    flexShrink: 0,
  },
  title: {
    fontFamily: "'Bebas Neue', system-ui, sans-serif",
    fontSize: '22px', letterSpacing: '0.03em', fontWeight: 700,
    color: '#f4f6ee', margin: 0,
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.6)', fontSize: '16px',
    padding: '4px 8px', borderRadius: '6px',
  },
  body: {
    overflowY: 'auto', padding: '22px 24px',
  },
  imageRow: {
    display: 'flex', gap: '8px', marginBottom: '20px',
  },
  image: {
    flex: 1, minWidth: 0, width: '50%', maxHeight: '150px', objectFit: 'contain',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(96,108,56,0.2)',
  },
  stepsLabel: {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
    color: '#8a9c4a', margin: '0 0 18px',
  },
  stepsList: {
    listStyle: 'none', margin: 0, padding: 0,
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  stepItem: {
    display: 'flex', gap: '14px', alignItems: 'flex-start',
  },
  stepNum: {
    flexShrink: 0,
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'rgba(96,108,56,0.18)',
    border: '1px solid rgba(96,108,56,0.4)',
    color: '#a8b872',
    fontSize: '11px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stepText: {
    fontSize: '13px', color: 'rgba(255,255,255,0.72)',
    lineHeight: '1.7', paddingTop: '3px',
  },
  stepsLoading: {
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  stepSkeleton: {
    height: '13px', borderRadius: '6px',
    background: 'rgba(96,108,56,0.18)',
    animation: 'pulse 1.4s ease-in-out infinite',
  },
  errorText: { fontSize: '13px', color: 'rgba(255,255,255,0.45)' },
}
