import { Shield, BookOpen, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { NodeLine, PillTag, FuturisticCard, SectionHeader, DarkSection } from '@/components/ui/FuturisticElements'

const EXPERTS = [
  {
    name: 'Dr. Ananya Sharma',
    title: 'Sports Physiotherapist (MPT)',
    bio: 'Specialises in shoulder and upper limb biomechanics. Has worked with state-level tennis and table tennis players for 8+ years. Strong advocate for preventative physiotherapy in recreational athletes.',
    specialisations: ['Table Tennis', 'Tennis', 'Shoulder Mechanics', 'Injury Prevention'],
    credentials: 'MPT (Sports), BPT — Manipal Institute',
    verified: true,
    articles: 12,
  },
  {
    name: 'Vikram Patel',
    title: 'Sports Scientist & Strength Coach',
    bio: 'Former national basketball player turned sports scientist. Focuses on lower limb mechanics, jump training, and ACL risk reduction in field sports. Currently works with college-level football teams in Bangalore.',
    specialisations: ['Football', 'Basketball', 'Jump Mechanics', 'ACL Prevention'],
    credentials: 'MSc Sports Science — Loughborough University',
    verified: true,
    articles: 9,
  },
]

const PROCESS = [
  { step: '01', title: 'Expert review mandate', desc: 'Every lesson and article must be reviewed by at least one credentialled expert before publish. No exceptions.' },
  { step: '02', title: 'Credentials verified', desc: 'We independently verify qualifications and clinical or coaching experience. No self-certification.' },
  { step: '03', title: 'Science, not opinion', desc: 'Content is grounded in peer-reviewed sports science. References are attached to every major claim.' },
  { step: '04', title: 'Recreational focus', desc: 'Content is framed for the recreational and amateur athlete, not elite performance — accuracy without inaccessibility.' },
]

export default function ExpertsPage() {
  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="scanline pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-[500px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(96,108,56,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-6">Expert Network</PillTag>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
            Credentialled experts<br />
            <span className="text-gradient-olive">behind every lesson</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            All biomechanics content is reviewed by credentialled sports scientists and physiotherapists before it goes live. These are the people behind the science on MotionLab.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <NodeLine />
        </div>
      </section>

      {/* Expert cards */}
      <section className="py-16 lg:py-20" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
            {EXPERTS.map(expert => (
              <FuturisticCard key={expert.name}>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #264653, #606C38)', border: '1px solid rgba(96,108,56,0.35)' }}>
                    {expert.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-base font-bold text-white">{expert.name}</h3>
                      {expert.verified && (
                        <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.3)' }}>
                          <Shield size={10} className="text-[#8a9c4a]" />
                          <span className="text-[10px] text-[#8a9c4a] font-semibold font-mono">VERIFIED</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-white/50">{expert.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">{expert.credentials}</p>
                  </div>
                </div>

                <p className="text-sm text-white/55 leading-relaxed mb-4">{expert.bio}</p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {expert.specialisations.map(s => (
                    <span key={s} className="pill-tag text-[9px]">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#606C38]/10">
                  <span className="font-mono text-xs text-white/30">{expert.articles} published articles</span>
                  <Button size="sm" variant="ghost" className="text-white/40 hover:text-white border-[#606C38]/20 hover:border-[#606C38]/40"
                    style={{ border: '1px solid rgba(96,108,56,0.15)' }}>
                    <BookOpen size={12} className="mr-1.5" /> View Content
                  </Button>
                </div>
              </FuturisticCard>
            ))}
          </div>

          <NodeLine className="mb-14" />

          {/* Review process */}
          <SectionHeader
            tag="Our Process"
            title="How content gets verified"
            dark
            accentWord="verified"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS.map(p => (
              <FuturisticCard key={p.step}>
                <div className="step-badge mb-4">{p.step}</div>
                <h4 className="text-white/90 font-bold text-sm mb-2">{p.title}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
              </FuturisticCard>
            ))}
          </div>
        </div>
      </section>

      {/* Become an expert CTA */}
      <DarkSection>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.3)' }}>
            <ExternalLink size={22} className="text-[#8a9c4a]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Are you a sports scientist or physiotherapist?
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-lg mx-auto mb-8">
            We're building our expert contributor network. Join MotionLab to reach athletes who need your expertise, build your online presence, and get attributed for science-backed content on a credible platform.
          </p>
          <Link to="/contact">
            <Button size="lg" className="font-bold text-white"
              style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
              Apply to be an Expert Contributor
            </Button>
          </Link>
        </div>
      </DarkSection>
    </div>
  )
}
