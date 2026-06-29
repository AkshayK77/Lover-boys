import { useState } from 'react'
import { Mail, MessageSquare, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { NodeLine, PillTag, FuturisticCard } from '@/components/ui/FuturisticElements'

const FAQS = [
  { q: 'Is MotionLab free?', a: 'MotionLab has a free tier with access to basic content and 3 AI queries per day. Pro gives you unlimited AI coaching, all learning paths, and certifications.' },
  { q: 'Is the content medically reviewed?', a: 'All biomechanics and injury prevention content is reviewed by credentialled sports scientists and physiotherapists before publish. MotionLab is not a medical device — content is educational, not clinical.' },
  { q: 'Can I use MotionLab if I only go to the gym and don\'t play a sport?', a: 'Absolutely. The workout planning, nutrition tracking, and AI coach work for gym-focused training. Sports is an optional layer that unlocks additional content.' },
  { q: 'How does the AI coach work?', a: 'The AI coach assembles your full context — training history, muscle volume, nutrition, sport schedule, and learning progress — and uses Groq LLM via a server-side proxy. Your data never leaves our secure infrastructure.' },
  { q: 'Does MotionLab work offline?', a: 'Workout session tracking is offline-first — sets are logged locally via IndexedDB and synced when you reconnect. Community and learning content requires connectivity.' },
  { q: 'How do I become an expert contributor?', a: 'We\'re building our expert network. If you\'re a credentialled sports scientist or physiotherapist, use the contact form below to apply.' },
]

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#606C38]/10 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 min-h-[44px]"
      >
        <span className="font-medium text-white/70 text-sm">{q}</span>
        <ChevronDown size={16} className={`text-[#606C38] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm text-white/40 leading-relaxed">{a}</p>}
    </div>
  )
}

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="scanline pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(96,108,56,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-6">Contact</PillTag>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
            Get in <span className="text-gradient-olive">touch</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl">
            Questions, feedback, expert contributor applications, or partnership enquiries — we read everything.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <NodeLine />
        </div>
      </section>

      <section className="py-16 lg:py-24" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact form */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={18} className="text-[#8a9c4a]" />
                <h2 className="text-xl font-bold text-white">Send us a message</h2>
              </div>
              <p className="text-white/35 text-sm mb-8">We'll respond within 48 hours.</p>

              {sent ? (
                <FuturisticCard className="text-center py-10">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-bold text-white mb-2">Message sent!</h3>
                  <p className="text-sm text-white/40">We'll be in touch within 48 hours.</p>
                </FuturisticCard>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    label="Your name"
                    placeholder="Aditya Saiprasad"
                    required
                    className="bg-[#080C14]/80 border-[#606C38]/20 text-white placeholder-white/20 focus:border-[#606C38]/50"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="bg-[#080C14]/80 border-[#606C38]/20 text-white placeholder-white/20 focus:border-[#606C38]/50"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70">Subject</label>
                    <select className="h-11 min-h-[44px] rounded-[8px] border text-sm px-3 focus:outline-none focus:ring-2 text-white/80"
                      style={{
                        background: 'rgba(8,12,20,0.8)',
                        borderColor: 'rgba(96,108,56,0.2)',
                        colorScheme: 'dark',
                      }}>
                      <option>General enquiry</option>
                      <option>Expert contributor application</option>
                      <option>Partnership / B2B</option>
                      <option>Content feedback</option>
                      <option>Technical support</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70">Message</label>
                    <textarea
                      className="rounded-[8px] border px-3 py-2.5 text-sm resize-none focus:outline-none min-h-[140px] text-white/80 placeholder-white/20"
                      placeholder="Tell us what you're thinking..."
                      required
                      style={{
                        background: 'rgba(8,12,20,0.8)',
                        borderColor: 'rgba(96,108,56,0.2)',
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                  <Button type="submit" size="lg" className="font-bold text-white"
                    style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
                    <Mail size={16} className="mr-2" /> Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-[#8a9c4a]" />
                <h2 className="text-xl font-bold text-white">Common questions</h2>
              </div>
              <p className="text-white/35 text-sm mb-8">Quick answers to the most frequent questions.</p>

              <FuturisticCard>
                {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
              </FuturisticCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
