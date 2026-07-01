import { Plus, Flame, Droplet } from 'lucide-react'
import { PillTag, NodeLine } from '@/components/ui/FuturisticElements'

// UI-only shell. Sample data is static placeholder — food search (USDA +
// Indian foods), macro logging and AI recipes get wired in a later phase.

function Card({ title, badge, children, className }: { title: string; badge?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] p-5 flex flex-col ${className ?? ''}`}
      style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.1)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-white/80 text-sm">{title}</h2>
        {badge && (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: '#8a9c4a', background: 'rgba(96,108,56,0.1)', border: '1px solid rgba(96,108,56,0.15)' }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{label}</span>
        <span className="font-mono text-[9px] text-white/30">{value} / {target}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

const MEALS = [
  { type: 'Breakfast', items: 'Oats, Greek Yogurt, Banana', kcal: 420, protein: 28 },
  { type: 'Lunch', items: 'Grilled Chicken, Basmati Rice, Dal Tadka', kcal: 680, protein: 52 },
  { type: 'Snack', items: 'Whey Protein, Almonds', kcal: 240, protein: 30 },
]

const QUICK_ADD = ['Roti', 'Paneer', 'Chicken Breast', 'Rajma', 'Curd', 'Eggs']

export default function NutritionPage() {
  const kcal = 1340
  const kcalTarget = 2200

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <PillTag>Nutrition</PillTag>
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white/30"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              Preview · sample data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
            Today's <span className="text-gradient-olive">Fuel</span>
          </h1>
          <p className="text-sm text-white/30">Macro tracking with a full Indian food database.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-sm font-bold text-white shrink-0 self-start transition-opacity hover:opacity-85"
          style={{ background: '#606C38', border: '1px solid rgba(96,108,56,0.5)' }}
        >
          <Plus size={15} /> Log Food
        </button>
      </div>

      <NodeLine />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Macro summary */}
        <Card title="Macros" badge="Today">
          <div className="flex flex-col items-center gap-1 mb-6">
            <div className="flex items-baseline gap-1.5">
              <Flame size={18} className="text-[#8a9c4a] self-center" />
              <span className="text-4xl font-black text-white/90">{kcal}</span>
              <span className="text-sm text-white/30">/ {kcalTarget} kcal</span>
            </div>
            <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest">{kcalTarget - kcal} remaining</span>
          </div>
          <div className="flex flex-col gap-4">
            <MacroBar label="Protein" value={110} target={160} color="#8a9c4a" />
            <MacroBar label="Carbs" value={140} target={240} color="#606C38" />
            <MacroBar label="Fat" value={38} target={70} color="#264653" />
            <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: '1px solid rgba(96,108,56,0.1)' }}>
              <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/25 uppercase tracking-wider">
                <Droplet size={12} className="text-[#4A6FA5]" /> Water
              </span>
              <span className="font-mono text-[10px] text-white/40">1.8 / 3.0 L</span>
            </div>
          </div>
        </Card>

        {/* Meals log */}
        <Card title="Meals" badge="3 logged" className="lg:col-span-2">
          <div className="flex flex-col gap-2">
            {MEALS.map((m, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-[10px]" style={{ border: '1px solid rgba(96,108,56,0.08)' }}>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] text-[#8a9c4a]/70 uppercase tracking-wider mb-1">{m.type}</p>
                  <p className="text-sm text-white/70 truncate">{m.items}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white/85">{m.kcal}</p>
                  <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{m.protein}g protein</p>
                </div>
              </div>
            ))}
            <button className="flex items-center justify-center gap-1.5 mt-1 py-2.5 rounded-[8px] text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
              style={{ border: '1px dashed rgba(96,108,56,0.2)' }}>
              <Plus size={13} /> Add meal
            </button>
          </div>

          <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mt-5 mb-2.5">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ADD.map(f => (
              <button key={f} className="text-xs px-3 py-1.5 rounded-full text-white/50 hover:text-[#8a9c4a] transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(96,108,56,0.12)' }}>
                {f}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
