import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { NodeLine, PillTag, FuturisticCard, DarkSection, SectionHeader } from '@/components/ui/FuturisticElements'

const VALUES = [
  {
    icon: '🧬',
    title: 'Movement science belongs to everyone',
    desc: 'Not just elite athletes with access to physios. Not just people who can afford ₹5,000/session guidance.',
  },
  {
    icon: '🎯',
    title: 'Understanding beats compliance',
    desc: 'Athletes who understand why an exercise exists will train smarter, stay consistent, and prevent injuries better than those just following plans.',
  },
  {
    icon: '🤝',
    title: 'Education and training must be connected',
    desc: 'Learning about biomechanics in isolation does nothing. It must connect to how you actually prepare, train, and recover every week.',
  },
]

export default function AboutPage() {
  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="scanline pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(96,108,56,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-6">Our Story</PillTag>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Two athletes.<br />
            <span className="text-gradient-olive">One gap to close.</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
            MotionLab started from a simple, frustrating observation: the knowledge that prevents injuries and unlocks performance is locked inside physio clinics and sports science departments that most athletes never access.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <NodeLine />
        </div>
      </section>

      {/* Origin story */}
      <section className="py-20 lg:py-24" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <PillTag className="mb-8">Where It Started</PillTag>
            <div className="space-y-6 text-white/60 text-base sm:text-lg leading-relaxed">
              <p>
                We both reached the same realisation from different directions. Aditya through a scapular injury that sent him to a sports physiotherapist — and the revelation that the warmup protocols, biomechanics, and movement science he was taught should have been part of his training from day one, not discovered after an injury. Akshay through recurring heel injuries from years of competitive basketball, and the frustration of never finding workout advice or nutrition guidance that actually accounted for his injury history or his preferences — every fitness app treated him like a generic user, not an athlete recovering and training with real constraints. That frustration pushed him to study the body's anatomy as a whole, so he could actually understand the space instead of just following generic advice.
              </p>
              <p>
                The existing landscape is fragmented. YouTube gives you technique videos but no structure and no injury context. Fitness apps track your workouts but don't teach you why the exercises exist. Sports physios provide expert guidance at a cost that most recreational athletes simply can't sustain. And no platform connects what you learn about your body to how you actually train day to day.
              </p>
              <p className="text-white/80">
                MotionLab is our answer to that gap. It merges sports science education with intelligent training tracking, so every exercise recommendation is grounded in movement science, every warmup protocol is sport-specific and expert-reviewed, and the AI coach giving you advice actually knows your training history, your sport schedule, and the science behind your body.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <NodeLine />
        </div>
      </section>

      {/* Founders */}
      <DarkSection>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Co-founders"
            title="The people behind MotionLab"
            dark
            accentWord="MotionLab"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Aditya */}
            <FuturisticCard>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #264653, #606C38)', border: '1px solid rgba(96,108,56,0.4)' }}>
                  A
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Aditya Saiprasad</h3>
                  <p className="text-xs text-white/40 mb-2">Co-founder · Education, Content & Community</p>
                  <a
                    href="https://www.linkedin.com/in/aditya-saiprasad/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#8a9c4a] hover:text-white transition-colors"
                  >
                    LinkedIn <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              <div className="space-y-3 text-white/55 text-sm leading-relaxed">
                <p>
                  I've played competitive Table Tennis since I was young — state opens, club tournaments, the kind of training where you're on the table for hours without ever being told what your shoulder is actually doing or why a proper warmup prevents the injury that ends seasons early.
                </p>
                <p>
                  I also play football recreationally, completely self-taught, which means I developed all the movement habits and none of the movement knowledge. That changed when I experienced a scapular injury serious enough to send me to a sports physiotherapist.
                </p>
                <p>
                  What I learned in those sessions — about scapular mechanics, rotator cuff activation, the specific warmup protocol that targets the muscles most stressed in a TT forehand — was exactly the kind of knowledge I wish I'd had years earlier. That's the gap MotionLab is designed to close.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-5">
                {['Table Tennis', 'Football', 'Sports Science Education', 'Injury Prevention'].map(tag => (
                  <span key={tag} className="pill-tag text-[9px]">{tag}</span>
                ))}
              </div>
            </FuturisticCard>

            {/* Akshay */}
            <FuturisticCard>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #264653 30%, #4A6FA5)', border: '1px solid rgba(74,111,165,0.4)' }}>
                  A
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Akshay Kannan</h3>
                  <p className="text-xs text-white/40 mb-2">Co-founder · Training, AI & Infrastructure</p>
                  <a
                    href="https://www.linkedin.com/in/akshay-kannan-8403ba230/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#8a9c4a] hover:text-white transition-colors"
                  >
                    LinkedIn <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              <div className="space-y-3 text-white/55 text-sm leading-relaxed">
                <p>
                  I've always picked up sports fast. I competed in table tennis and basketball, did well at both, but never had a dedicated strength coach or conditioning program built around either. When I started training seriously in the gym, nobody handed me a structure. I had to figure out programming, progressive overload, and recovery through pure trial and error, reading whatever I could find, testing things on myself and seeing what actually worked.
                </p>
                <p>
                  Every fitness app I tried along the way felt like it was solving a different problem. Generic templates, no sense of who I actually was as an athlete, no understanding that I had a sport schedule to train around, or that my body already knew how to move and just needed the right training logic layered on top.
                </p>
                <p>
                  So I built KavaFit. AI-powered workout planning, live session tracking, PR detection, nutrition logging, and a contextual AI coach that actually knows your training history. When Aditya and I talked, we realized immediately that our products needed each other. MotionLab is what happens when you combine both properly.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-5">
                {['Basketball', 'Gym Training', 'AI Architecture', 'AWS', 'KavaFit'].map(tag => (
                  <span key={tag} className="pill-tag text-[9px]">{tag}</span>
                ))}
              </div>
            </FuturisticCard>
          </div>
        </div>
      </DarkSection>

      {/* Values */}
      <section className="py-20 lg:py-24" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="What We Believe"
            title="The principles behind the platform"
            dark
            accentWord="principles"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {VALUES.map(v => (
              <FuturisticCard key={v.title} className="text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-white/90 mb-3 text-sm">{v.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{v.desc}</p>
              </FuturisticCard>
            ))}
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <NodeLine />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#080C14' }}>
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Train with the understanding<br />
            <span className="text-gradient-olive">we wish we'd had</span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto mb-8 text-base">
            Whether you're a recreational athlete or a serious competitor, MotionLab gives you the sports science foundation your training deserves.
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
