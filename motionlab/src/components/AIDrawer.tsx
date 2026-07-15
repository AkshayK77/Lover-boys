import { useEffect, useRef } from 'react'
import { useUI } from '@/contexts/UIContext'
import { useCoachChat } from '@/hooks/useCoachChat'

const QUICK_PROMPTS = ["Adjust today's workout", 'What should I eat?', 'Am I overtraining?', 'How close am I to my goal?', 'Generate a warm-up']

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => <span key={i} className="ml-typing-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)', animationDelay: `${i * 0.15}s` }} />)}
    </span>
  )
}

export default function AIDrawer({ onClose }: { onClose: () => void }) {
  const { drawerInitMessage } = useUI()
  const { messages, input, setInput, isTyping, contextChips, sendMessage, applyWorkoutChanges } = useCoachChat(drawerInitMessage)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])
  useEffect(() => { inputRef.current?.focus() }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <>
      <style>{`
        @keyframes mlDrawerUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes mlTyping { 0%,60%,100% { opacity: 0.25 } 30% { opacity: 1 } }
        .ml-typing-dot { animation: mlTyping 1.2s infinite }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={onClose} />

      <div className="flex flex-col overflow-hidden"
        style={{ position: 'fixed', bottom: '24px', right: '24px', width: 'min(360px, calc(100vw - 32px))', height: 'min(500px, calc(100vh - 120px))', background: '#0D1420', border: '1px solid rgba(96,108,56,0.28)', borderRadius: '16px', zIndex: 300, boxShadow: '0 8px 40px rgba(0,0,0,0.6)', animation: 'mlDrawerUp 0.2s ease' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 shrink-0" style={{ borderBottom: '1px solid rgba(96,108,56,0.12)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#8a9c4a', boxShadow: '0 0 6px rgba(138,156,74,0.8)' }} />
            <span className="font-bold text-white/85 text-sm">AI Coach</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-sm px-1.5">✕</button>
        </div>

        {/* Chips */}
        {contextChips.length > 0 && (
          <div className="px-3.5 pt-2.5 shrink-0">
            <div className="flex gap-1.5 flex-wrap">
              {contextChips.slice(0, 4).map(c => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.22)', color: '#8a9c4a' }}>{c}</span>
              ))}
            </div>
          </div>
        )}
        <div className="px-3.5 pt-2 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)} className="shrink-0 text-[11px] px-2.5 py-1 rounded-full text-white/55 hover:text-[#8a9c4a] whitespace-nowrap transition-colors"
                style={{ background: 'rgba(8,12,20,0.7)', border: '1px solid rgba(96,108,56,0.14)' }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5" style={{ borderTop: '1px solid rgba(96,108,56,0.1)' }}>
          {messages.length === 0 && <p className="text-xs text-white/30 text-center mt-5">Ask me anything about your training, nutrition, or recovery.</p>}
          {messages.map(m => (
            <div key={m.id} className={m.role === 'user' ? 'self-end max-w-[85%]' : 'self-start max-w-[90%]'}>
              <div className="text-[13px] leading-relaxed whitespace-pre-wrap px-3 py-2"
                style={m.role === 'user'
                  ? { background: '#606C38', color: '#fff', borderRadius: '12px 12px 2px 12px' }
                  : { background: 'rgba(8,12,20,0.7)', border: '1px solid rgba(96,108,56,0.14)', color: 'rgba(255,255,255,0.88)', borderRadius: '2px 12px 12px 12px' }}>
                {m.text}
              </div>
              {m.showApplyBtn && (
                <button onClick={() => applyWorkoutChanges(m.originalUserMsg ?? '')} className="mt-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-[6px] text-[#8a9c4a] block"
                  style={{ background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.3)' }}>Apply these changes →</button>
              )}
            </div>
          ))}
          {isTyping && <div className="self-start px-3.5 py-2.5 rounded-[2px_12px_12px_12px]" style={{ background: 'rgba(8,12,20,0.7)', border: '1px solid rgba(96,108,56,0.14)' }}><TypingDots /></div>}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-end px-3 py-2.5 shrink-0" style={{ borderTop: '1px solid rgba(96,108,56,0.12)' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask your coach…" rows={1}
            className="flex-1 px-3 py-2 rounded-[8px] text-[13px] text-white/90 outline-none resize-none"
            style={{ background: 'rgba(8,12,20,0.7)', border: '1px solid rgba(96,108,56,0.15)', maxHeight: '80px' }} />
          <button onClick={() => sendMessage(input)} disabled={isTyping} className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 disabled:opacity-40" style={{ background: '#606C38' }} aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </>
  )
}
