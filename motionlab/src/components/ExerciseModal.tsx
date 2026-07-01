import React, { useCallback, useEffect } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

// NOTE: In KavaFit this modal fetched step-by-step instructions via two Supabase
// edge functions (rapidapi-proxy → ExerciseDB, with a Groq ai-proxy fallback).
// MotionLab has no edge functions yet, so rather than ship a call that always
// fails, we show a clear "coming with the AI Coach" state. Wire the real fetch
// back in here once the ai-proxy edge function lands.
export default function ExerciseModal({ exerciseName, onClose }: { exerciseName: string; onClose: () => void }) {
  const isMobile = useIsMobile()

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
          <p style={s.stepsLabel}>HOW TO PERFORM</p>
          <div style={s.comingWrap}>
            <div style={s.comingIcon}>◷</div>
            <p style={s.comingTitle}>Step-by-step form guide coming soon</p>
            <p style={s.comingText}>
              Detailed, form-checked instructions for <strong style={{ color: 'var(--text)' }}>{exerciseName}</strong> arrive
              with the MotionLab AI Coach — grounded in the movement science behind the lift.
            </p>
          </div>
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
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    width: '100%', maxWidth: '520px', maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '22px', letterSpacing: '0.03em', fontWeight: 700,
    color: 'var(--text)', margin: 0,
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--muted)', fontSize: '16px',
    padding: '4px 8px', borderRadius: '6px',
  },
  body: {
    overflowY: 'auto', padding: '22px 24px',
  },
  stepsLabel: {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em',
    color: 'var(--accent)', margin: '0 0 18px',
  },
  comingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', gap: '12px', padding: '18px 8px 8px',
  },
  comingIcon: {
    width: '48px', height: '48px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--accent-dim)', border: '1px solid rgba(96,108,56,0.3)',
    color: 'var(--accent)', fontSize: '22px',
  },
  comingTitle: {
    fontSize: '14px', fontWeight: '600', color: 'var(--text)', margin: 0,
  },
  comingText: {
    fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', margin: 0,
    maxWidth: '360px',
  },
}
