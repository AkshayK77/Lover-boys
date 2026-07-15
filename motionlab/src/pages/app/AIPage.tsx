import { useEffect, useRef } from 'react'
import { useCoachChat } from '@/hooks/useCoachChat'
import { PillTag } from '@/components/ui/FuturisticElements'

const QUICK_PROMPTS = [
  "Adjust today's workout",
  'What should I eat for recovery?',
  'Am I overtraining?',
  'How close am I to my goal?',
  'Generate a warm-up',
  "What's my weakest muscle group this week?",
  'Should I take a rest day?',
]

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} className="ml-typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)', animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  )
}

export default function AIPage() {
  const { messages, input, setInput, isTyping, contextChips, sendMessage, applyWorkoutChanges } = useCoachChat()
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 150px)' }}>
      <style>{`@keyframes mlTyping { 0%,60%,100% { opacity: 0.25 } 30% { opacity: 1 } } .ml-typing-dot { animation: mlTyping 1.2s infinite }`}</style>

      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#8a9c4a', boxShadow: '0 0 8px rgba(138,156,74,0.8)' }} />
          <PillTag>AI Coach</PillTag>
        </div>
        {contextChips.length > 0 && (
          <>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-wider mb-1.5">Active context</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {contextChips.map(c => (
                <span key={c} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.25)', color: '#8a9c4a' }}>{c}</span>
              ))}
            </div>
          </>
        )}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)} className="shrink-0 text-xs px-3 py-1.5 rounded-full text-white/55 hover:text-[#8a9c4a] transition-colors whitespace-nowrap"
              style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.14)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-[12px] p-4 flex flex-col gap-3.5" style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
        {messages.length === 0 && (
          <div className="text-center m-auto">
            <div className="text-3xl mb-3">🏋️</div>
            <p className="text-sm font-medium text-white/60 mb-1">Your AI coach</p>
            <p className="text-xs text-white/30">Powered by your real training data. Ask anything.</p>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'self-end max-w-[75%]' : 'self-start max-w-[85%]'}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap px-3.5 py-2.5"
              style={m.role === 'user'
                ? { background: '#606C38', color: '#fff', borderRadius: '14px 14px 2px 14px' }
                : { background: 'rgba(8,12,20,0.7)', border: '1px solid rgba(96,108,56,0.14)', color: 'rgba(255,255,255,0.88)', borderRadius: '2px 14px 14px 14px' }}>
              {m.text}
            </div>
            {m.showApplyBtn && (
              <button onClick={() => applyWorkoutChanges(m.originalUserMsg ?? '')} className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-[6px] text-[#8a9c4a]"
                style={{ background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.3)' }}>
                Apply these changes →
              </button>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="self-start px-4 py-3 rounded-[2px_14px_14px_14px]" style={{ background: 'rgba(8,12,20,0.7)', border: '1px solid rgba(96,108,56,0.14)' }}>
            <TypingDots />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 items-end">
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask your coach…" rows={1}
          className="flex-1 px-3.5 py-2.5 rounded-[10px] text-sm text-white/90 outline-none resize-none"
          style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.15)', maxHeight: '100px' }} />
        <button onClick={() => sendMessage(input)} disabled={isTyping}
          className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 disabled:opacity-40"
          style={{ background: '#606C38' }} aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  )
}
