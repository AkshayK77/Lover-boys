import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Brain, TrendingUp, Star, ChevronRight, Zap, Users, BookOpen, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const SPORTS = [
  { slug: 'table-tennis', name: 'Table Tennis', emoji: '🏓', available: true,  label: "Aditya's sport" },
  { slug: 'football',     name: 'Football',     emoji: '⚽', available: true,  label: 'Most popular' },
  { slug: 'tennis',       name: 'Tennis',       emoji: '🎾', available: false, label: 'Coming soon' },
  { slug: 'basketball',   name: 'Basketball',   emoji: '🏀', available: false, label: 'Coming soon' },
  { slug: 'badminton',    name: 'Badminton',    emoji: '🏸', available: false, label: 'Coming soon' },
  { slug: 'running',      name: 'Running',      emoji: '🏃', available: false, label: 'Coming soon' },
]

const PILLARS = [
  { icon: '🧬', title: 'Movement Science',   desc: 'Skeleton overlays, force vectors, and muscle activation sequences — visual biomechanics for every sport.' },
  { icon: '🛡️', title: 'Injury Prevention',  desc: 'Physio-reviewed warmup protocols and sport-specific prevention content. Not just generic stretches.' },
  { icon: '🤖', title: 'AI Training Coach',  desc: 'Context-aware AI with your full training history, sport schedule, nutrition, and movement science knowledge built in.' },
  { icon: '📊', title: 'Live Session Tracking', desc: 'Real-time PR detection, progressive overload guidance, and offline-first reliability — works with zero connectivity.' },
]

const TESTIMONIALS = [
  { name: 'Rahul M.',  sport: 'Table Tennis', quote: 'The shoulder warmup protocol alone saved me from re-injury. Finally a platform that connects what I learn to how I train.' },
  { name: 'Priya K.', sport: 'Football',      quote: 'The sport-supplementary plan is incredible — it accounts for my football schedule and avoids heavy leg work the day before matches.' },
  { name: 'Arjun S.', sport: 'Strength',      quote: "I've tried every fitness app. Nothing comes close to MotionLab's AI coach — it knows my history and gives real, grounded advice." },
]

/* Decorative SVG line with nodes — spans full width */
function NodeLine({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-px overflow-visible ${className}`}>
      <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none" className="absolute top-1/2 -translate-y-1/2 overflow-visible">
        <line x1="0" y1="6" x2="1200" y2="6" stroke="rgba(96,108,56,0.25)" strokeWidth="1" />
        {[120, 300, 480, 600, 720, 900, 1080].map(x => (
          <g key={x}>
            <circle cx={x} cy="6" r="2.5" fill="#606C38" opacity="0.6" />
            <circle cx={x} cy="6" r="5" fill="none" stroke="#606C38" strokeWidth="0.5" opacity="0.3" />
          </g>
        ))}
        <circle cx="600" cy="6" r="4" fill="#606C38" opacity="0.9" />
        <circle cx="600" cy="6" r="8" fill="none" stroke="#606C38" strokeWidth="1" opacity="0.4" />
      </svg>
    </div>
  )
}

/* Animated "targeting" corner brackets for the hero stat boxes */
function CornerBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative p-4 ${className}`}>
      {/* TL */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#606C38]/50" />
      {/* TR */}
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#606C38]/50" />
      {/* BL */}
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#606C38]/50" />
      {/* BR */}
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#606C38]/50" />
      {children}
    </div>
  )
}

/* Abstract sport figure SVG */
function SportFigureSVG() {
  return (
    <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-[480px]">
      {/* Grid background */}
      <defs>
        <pattern id="heroGrid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(96,108,56,0.1)" strokeWidth="0.5"/>
        </pattern>
        <radialGradient id="figureGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#606C38" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#606C38" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="400" height="480" fill="url(#heroGrid)" />
      <ellipse cx="200" cy="240" rx="160" ry="180" fill="url(#figureGlow)" />

      {/* Human figure — athlete in motion */}
      {/* Head */}
      <circle cx="200" cy="80" r="28" stroke="#606C38" strokeWidth="1.5" fill="rgba(96,108,56,0.08)" filter="url(#glow)" />
      {/* Spine */}
      <line x1="200" y1="108" x2="200" y2="220" stroke="rgba(96,108,56,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Shoulders */}
      <line x1="140" y1="148" x2="260" y2="148" stroke="#606C38" strokeWidth="1.5" />
      {/* Left arm — raised */}
      <line x1="140" y1="148" x2="95" y2="105" stroke="#606C38" strokeWidth="1.5" />
      <line x1="95" y1="105" x2="60" y2="75" stroke="rgba(96,108,56,0.5)" strokeWidth="1.5" />
      {/* Right arm — down */}
      <line x1="260" y1="148" x2="300" y2="195" stroke="#606C38" strokeWidth="1.5" />
      <line x1="300" y1="195" x2="325" y2="235" stroke="rgba(96,108,56,0.5)" strokeWidth="1.5" />
      {/* Hip */}
      <line x1="170" y1="220" x2="230" y2="220" stroke="#606C38" strokeWidth="1.5" />
      <circle cx="200" cy="220" r="4" fill="#606C38" opacity="0.8" />
      {/* Left leg */}
      <line x1="170" y1="220" x2="145" y2="320" stroke="#606C38" strokeWidth="1.5" />
      <line x1="145" y1="320" x2="125" y2="400" stroke="rgba(96,108,56,0.5)" strokeWidth="1.5" />
      {/* Right leg — bent forward */}
      <line x1="230" y1="220" x2="265" y2="300" stroke="#606C38" strokeWidth="1.5" />
      <line x1="265" y1="300" x2="295" y2="370" stroke="rgba(96,108,56,0.5)" strokeWidth="1.5" />

      {/* Joint nodes */}
      {[
        [140, 148], [260, 148], [200, 220], [170, 220], [230, 220],
        [95, 105], [300, 195], [145, 320], [265, 300],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4" fill="#606C38" opacity="0.7" filter="url(#glow)" />
          <circle cx={cx} cy={cy} r="7" stroke="#606C38" strokeWidth="0.5" fill="none" opacity="0.3" />
        </g>
      ))}

      {/* Force vector lines */}
      <line x1="200" y1="148" x2="200" y2="108" stroke="rgba(96,108,56,0.3)" strokeWidth="0.75" strokeDasharray="3 3" />
      <polygon points="200,100 196,112 204,112" fill="rgba(96,108,56,0.3)" />

      {/* Annotation lines */}
      <line x1="60" y1="75" x2="30" y2="60" stroke="rgba(96,108,56,0.25)" strokeWidth="0.75" />
      <text x="8" y="58" fill="rgba(96,108,56,0.6)" fontSize="9" fontFamily="monospace">WRIST</text>
      <line x1="265" y1="300" x2="310" y2="308" stroke="rgba(96,108,56,0.25)" strokeWidth="0.75" />
      <text x="314" y="312" fill="rgba(96,108,56,0.6)" fontSize="9" fontFamily="monospace">KNEE</text>
      <line x1="200" y1="80" x2="245" y2="45" stroke="rgba(96,108,56,0.25)" strokeWidth="0.75" />
      <text x="248" y="44" fill="rgba(96,108,56,0.6)" fontSize="9" fontFamily="monospace">C.O.G</text>
      <line x1="125" y1="400" x2="80" y2="415" stroke="rgba(96,108,56,0.25)" strokeWidth="0.75" />
      <text x="8" y="420" fill="rgba(96,108,56,0.6)" fontSize="9" fontFamily="monospace">GROUND FORCE</text>

      {/* Muscle activation overlay on torso */}
      <ellipse cx="200" cy="175" rx="35" ry="42" fill="none" stroke="rgba(96,108,56,0.2)" strokeWidth="0.75" strokeDasharray="3 4" />
      <text x="240" y="170" fill="rgba(96,108,56,0.5)" fontSize="8" fontFamily="monospace">CORE</text>

      {/* Data panel — top right */}
      <rect x="290" y="60" width="90" height="68" rx="4" fill="rgba(8,12,20,0.8)" stroke="rgba(96,108,56,0.25)" strokeWidth="0.75" />
      <text x="298" y="78" fill="rgba(96,108,56,0.5)" fontSize="7.5" fontFamily="monospace">RPE SCORE</text>
      <text x="298" y="94" fill="#8a9c4a" fontSize="18" fontFamily="monospace" fontWeight="bold">7.4</text>
      <text x="298" y="114" fill="rgba(96,108,56,0.4)" fontSize="7" fontFamily="monospace">LOAD OPTIMAL</text>
      <rect x="298" y="118" width="60" height="3" rx="1.5" fill="rgba(96,108,56,0.15)" />
      <rect x="298" y="118" width="44" height="3" rx="1.5" fill="#606C38" />

      {/* Data panel — bottom left */}
      <rect x="18" y="290" width="90" height="58" rx="4" fill="rgba(8,12,20,0.8)" stroke="rgba(96,108,56,0.25)" strokeWidth="0.75" />
      <text x="26" y="308" fill="rgba(96,108,56,0.5)" fontSize="7.5" fontFamily="monospace">INJURY RISK</text>
      <text x="26" y="326" fill="#4a9a7a" fontSize="16" fontFamily="monospace" fontWeight="bold">LOW</text>
      <text x="26" y="342" fill="rgba(96,108,56,0.4)" fontSize="7" fontFamily="monospace">WARMUP DONE ✓</text>
    </svg>
  )
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[95svh] flex items-center" style={{ background: '#080C14' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-100" />

        {/* Scanline */}
        <div className="scanline" />

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(38,70,83,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(96,108,56,0.12) 0%, transparent 70%)' }} />

        {/* Top border line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#606C38]/30 to-transparent" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* LEFT */}
            <div>
              <div className="pill-tag mb-8 w-fit">
                <Zap size={10} />
                Sports science for every athlete
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.0] tracking-tight mb-6 text-white">
                Train with<br />
                <span className="text-gradient-olive text-glow-olive">
                  Understanding
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/50 leading-relaxed mb-10 max-w-lg">
                MotionLab unifies sports science education, AI-powered workout planning, and sport-specific performance tracking. Learn why your body moves — then train smarter.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="w-full sm:w-auto font-semibold"
                    style={{ background: '#606C38', color: '#fff', border: 'none' }}>
                    Get Started Free
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/sports">
                  <Button size="lg" variant="ghost"
                    className="w-full sm:w-auto border text-white/70 hover:text-white hover:bg-white/5"
                    style={{ borderColor: 'rgba(96,108,56,0.3)' }}>
                    Explore Sports
                  </Button>
                </Link>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '8',   label: 'Sports covered',     icon: <Activity size={12} /> },
                  { value: '5',   label: 'Pillars per sport',  icon: <BookOpen size={12} /> },
                  { value: 'AI',  label: 'Grounded coaching',  icon: <Brain size={12} /> },
                ].map(stat => (
                  <CornerBox key={stat.label}>
                    <div className="flex items-center gap-1.5 mb-1 text-[#606C38]/60">
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-black text-white mb-0.5">{stat.value}</p>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider leading-tight">{stat.label}</p>
                  </CornerBox>
                ))}
              </div>
            </div>

            {/* RIGHT — sport figure */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-2xl" style={{
                background: 'radial-gradient(ellipse at center, rgba(96,108,56,0.06) 0%, transparent 70%)',
              }} />
              <div className="relative w-full max-w-md">
                <SportFigureSVG />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom node line */}
        <div className="absolute bottom-0 left-0 right-0 px-8">
          <NodeLine />
        </div>
      </section>

      {/* ── SPORTS GRID ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="pill-tag mb-6 mx-auto w-fit">Sports Library</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D1420] tracking-tight mb-4">
              Deep coverage for <span className="text-[#606C38]">your sport</span>
            </h2>
            <p className="text-base text-[#6B7280] max-w-xl mx-auto">
              5 pillars per sport: Learn, Movement Science, Injury Prevention, Training, Recovery. Expert-reviewed and visual-first.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {SPORTS.map(sport => (
              <Link key={sport.slug} to={`/sports/${sport.slug}`} className="group">
                <div className="relative rounded-xl border text-center p-5 transition-all duration-200 overflow-hidden"
                  style={{
                    borderColor: sport.available ? 'rgba(96,108,56,0.25)' : '#E5E7EB',
                    background: sport.available ? 'rgba(96,108,56,0.03)' : '#FAFAFA',
                  }}>
                  {/* Corner brackets on available */}
                  {sport.available && (
                    <>
                      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#606C38]/40" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#606C38]/40" />
                    </>
                  )}
                  <div className="text-3xl mb-3" style={{ filter: sport.available ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                    {sport.emoji}
                  </div>
                  <p className="font-semibold text-xs text-[#1F2937] mb-2">{sport.name}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: sport.available ? 'rgba(96,108,56,0.1)' : '#F3F4F6',
                      color: sport.available ? '#606C38' : '#9CA3AF',
                    }}>
                    {sport.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to="/sports">
              <Button variant="outline" className="border-[#606C38]/30 text-[#606C38] hover:bg-[#606C38]/5">
                View All Sports <ChevronRight size={15} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NODE LINE DIVIDER ─────────────────────────────────────────── */}
      <div className="px-8 lg:px-16">
        <NodeLine />
      </div>

      {/* ── MOVEMENT SCIENCE ─────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden" style={{ background: '#080C14' }}>
        <div className="absolute inset-0 grid-overlay" />
        <div className="scanline" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 70% 50%, rgba(38,70,83,0.12) 0%, transparent 60%)',
        }} />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="pill-tag mb-6 w-fit">The MotionLab Difference</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6">
                The knowledge your physio has —{' '}
                <span className="text-gradient-olive">accessible to everyone</span>
              </h2>
              <p className="text-base text-white/50 leading-relaxed mb-5">
                Most athletes never understand why injuries happen, why warmups matter, or how their movement mechanics affect performance. That knowledge is locked inside physio clinics charging ₹2,000–5,000 per session.
              </p>
              <p className="text-base text-white/50 leading-relaxed mb-10">
                MotionLab makes it accessible, visual, and directly connected to your actual training.
              </p>
              <Link to="/auth?mode=signup">
                <Button className="font-semibold" style={{ background: '#606C38', color: '#fff', border: 'none' }}>
                  Start Learning Free <ArrowRight size={15} className="ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PILLARS.map(pillar => (
                <div key={pillar.title} className="card-futuristic rounded-xl p-5">
                  <div className="text-2xl mb-3">{pillar.icon}</div>
                  <h3 className="font-bold text-white text-sm mb-2">{pillar.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-8">
          <NodeLine />
        </div>
      </section>

      {/* ── KILLER LOOP ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#F8F9FA]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="pill-tag mb-6 mx-auto w-fit">The Killer Loop</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D1420] tracking-tight mb-4">
              Your sport session,{' '}
              <span className="text-[#606C38]">intelligently wrapped</span>
            </h2>
            <p className="text-base text-[#6B7280] max-w-xl mx-auto">
              From pre-session warmup to post-session recovery — grounded in movement science, not generic advice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Schedule your sport session',  desc: "Tell MotionLab when you're playing. Football on Saturday? Done." },
              { step: '02', title: 'Get your warmup reminder',      desc: 'Evening before: a sport-specific warmup sourced from expert injury prevention content.' },
              { step: '03', title: 'Warm up with understanding',    desc: 'Every exercise explained — what muscle it targets, why it matters for your sport.' },
              { step: '04', title: 'Play your session',             desc: 'Log the session. MotionLab tracks sport load across your week automatically.' },
              { step: '05', title: 'Recovery protocol surfaces',    desc: 'Post-session: the specific recovery module for the sport you just played.' },
              { step: '06', title: 'Injury risk flagged early',     desc: "High-load weeks? MotionLab surfaces the relevant prevention content before something goes wrong." },
            ].map((item, i) => (
              <div key={item.step} className="relative rounded-xl border p-5 bg-white transition-all duration-200 hover:border-[#606C38]/30 hover:shadow-sm group"
                style={{ borderColor: '#E5E7EB' }}>
                {/* Corner brackets on hover */}
                <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-transparent group-hover:border-[#606C38]/40 transition-colors" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-transparent group-hover:border-[#606C38]/40 transition-colors" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="step-badge">{item.step}</div>
                  {i < 5 && (
                    <div className="flex-1 h-px" style={{
                      background: i === 2 ? 'linear-gradient(90deg, rgba(96,108,56,0.3), transparent)' : 'transparent',
                    }} />
                  )}
                </div>
                <h3 className="font-bold text-[#1F2937] text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NODE LINE ────────────────────────────────────────────────── */}
      <div className="px-8 lg:px-16">
        <NodeLine />
      </div>

      {/* ── EXPERTS ──────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="pill-tag mb-6 mx-auto w-fit">Expert Network</div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0D1420] tracking-tight mb-4">
              Built on credentialled expertise
            </h2>
            <p className="text-base text-[#6B7280] max-w-md mx-auto">
              All biomechanics content reviewed by credentialled sports scientists and physiotherapists before publish.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {[
              { name: 'Dr. Ananya Sharma', title: 'Sports Physiotherapist', sport: 'Table Tennis + Football' },
              { name: 'Vikram Patel',       title: 'Sports Scientist',       sport: 'Basketball + Running' },
            ].map(expert => (
              <div key={expert.name}
                className="relative w-full sm:w-72 rounded-xl border p-6 text-center transition-all duration-200 hover:border-[#606C38]/30"
                style={{ borderColor: '#E5E7EB', background: '#FAFAFA' }}>
                <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#606C38]/30" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#606C38]/30" />
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(96,108,56,0.08)', border: '1px solid rgba(96,108,56,0.2)' }}>
                  <Users size={22} className="text-[#606C38]" />
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <p className="font-bold text-sm text-[#1F2937]">{expert.name}</p>
                  <Shield size={12} className="text-[#606C38]" />
                </div>
                <p className="text-xs text-[#6B7280] mb-3">{expert.title}</p>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(96,108,56,0.08)', color: '#606C38' }}>
                  {expert.sport}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/experts">
              <Button variant="outline" className="border-[#606C38]/30 text-[#606C38] hover:bg-[#606C38]/5">
                Meet Our Experts <BookOpen size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#F8F9FA]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-[#0D1420] tracking-tight">
              Athletes training smarter
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-xl border bg-white p-6 transition-all duration-200 hover:border-[#606C38]/25"
                style={{ borderColor: '#E5E7EB' }}>
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={12} className="fill-[#606C38] text-[#606C38]" />
                  ))}
                </div>
                <p className="text-sm text-[#374151] leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-[#606C38]"
                    style={{ background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.2)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1F2937]">{t.name}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{t.sport}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden" style={{ background: '#080C14' }}>
        <div className="absolute inset-0 grid-overlay" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(96,108,56,0.1) 0%, transparent 70%)',
        }} />
        <div className="absolute top-0 left-0 right-0 px-8"><NodeLine /></div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill-tag mb-8 mx-auto w-fit">Start for free</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Ready to train with{' '}
            <span className="text-gradient-olive text-glow-olive">understanding?</span>
          </h2>
          <p className="text-base text-white/40 max-w-md mx-auto mb-10">
            Join athletes who are training smarter, preventing injuries, and finally understanding how their bodies work.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="font-semibold" style={{ background: '#606C38', color: '#fff', border: 'none' }}>
              Get Started Free <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-white/20 mt-4">No credit card required</p>
        </div>
      </section>

    </div>
  )
}
