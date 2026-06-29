import { Lock, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { NodeLine, PillTag, FuturisticCard, SectionHeader } from '@/components/ui/FuturisticElements'

const ARTICLES = [
  { title: 'Why Your Shoulder Hurts After Table Tennis — and What To Do', sport: 'Table Tennis', type: 'Injury Prevention', readTime: '6 min', preview: true },
  { title: 'The Science of the ACL Injury in Football', sport: 'Football', type: 'Movement Science', readTime: '8 min', preview: true },
  { title: 'Hamstring Mechanics in Sprint Running — A Biomechanical Guide', sport: 'Football', type: 'Movement Science', readTime: '7 min', preview: false },
  { title: 'Progressive Overload: Why More Isn\'t Always Better', sport: 'General', type: 'Training', readTime: '5 min', preview: false },
  { title: 'Deload Week: What It Is and When You Actually Need One', sport: 'General', type: 'Recovery', readTime: '6 min', preview: false },
  { title: 'Forehand Mechanics in Table Tennis — Wrist, Elbow, Shoulder', sport: 'Table Tennis', type: 'Movement Science', readTime: '9 min', preview: false },
]

const TYPE_COLORS: Record<string, string> = {
  'Injury Prevention': '#264653',
  'Movement Science': '#606C38',
  'Training': '#4A6FA5',
  'Recovery': '#6D071A',
}

const CATEGORIES = ['All', 'Injury Prevention', 'Movement Science', 'Training', 'Recovery']

export default function ResourcesPage() {
  return (
    <div style={{ background: '#080C14', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="scanline pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(96,108,56,0.1) 0%, transparent 70%)' }} />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <PillTag className="mb-6">Resources</PillTag>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
            Articles & Guides
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            Expert-written articles on movement science, injury prevention, training, and recovery — for the sports you play.
          </p>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <NodeLine />
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 lg:py-20" style={{ background: '#0D1420' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                  i === 0
                    ? 'bg-[#606C38] text-white border-[#606C38]'
                    : 'text-white/35 border-[#606C38]/15 hover:text-white/60 hover:border-[#606C38]/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {ARTICLES.map(article => (
              <FuturisticCard key={article.title} className="flex flex-col group cursor-pointer">
                {/* Top tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[article.type] ?? '#606C38' }} />
                    <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: TYPE_COLORS[article.type] ?? '#8a9c4a' }}>
                      {article.type}
                    </span>
                  </div>
                  <span className="text-white/20 text-[10px]">·</span>
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">{article.sport}</span>
                  {!article.preview && (
                    <Lock size={10} className="text-white/20 ml-auto" />
                  )}
                </div>

                <h3 className="text-white/85 font-semibold text-sm leading-snug mb-4 flex-1 group-hover:text-white transition-colors">
                  {article.title}
                </h3>

                <div className="flex items-center justify-between pt-4 border-t border-[#606C38]/10">
                  <span className="font-mono text-xs text-white/25">{article.readTime} read</span>
                  {article.preview ? (
                    <button className="text-xs text-[#8a9c4a] hover:text-white transition-colors flex items-center gap-1 font-medium">
                      Read <BookOpen size={11} />
                    </button>
                  ) : (
                    <span className="text-xs text-white/20">Sign in to read</span>
                  )}
                </div>
              </FuturisticCard>
            ))}
          </div>

          <div className="text-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="font-bold text-white"
                style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}>
                Unlock All Articles <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <p className="text-white/25 text-xs mt-3 font-mono">Free account · No credit card</p>
          </div>
        </div>
      </section>

      {/* What's in the full library */}
      <section className="py-16 lg:py-20 relative overflow-hidden" style={{ background: '#080C14' }}>
        <div className="absolute inset-0 grid-overlay pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="The Full Library"
            title="What's inside the platform"
            subtitle="The 6 free preview articles above are just the start. A full account unlocks all lessons, learning paths, warmup protocols, and the AI coach."
            dark
            accentWord="full library"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { num: '50+', label: 'Expert articles' },
              { num: '5', label: 'Learning paths' },
              { num: '8', label: 'Sports covered' },
              { num: 'AI', label: 'Personal coach' },
            ].map(s => (
              <div key={s.label} className="relative text-center p-5 rounded-xl border border-[#606C38]/15">
                <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#606C38]/30" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#606C38]/30" />
                <p className="text-2xl font-black text-gradient-olive mb-1">{s.num}</p>
                <p className="text-white/35 text-xs uppercase tracking-wider font-mono">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
