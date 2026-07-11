import { useEffect, useMemo, useState } from 'react'
import { Search, Dumbbell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { mapToVolumeGroup } from '@/lib/volumeTracker'
import ExerciseModal from '@/components/ExerciseModal'

interface ExerciseCard {
  id: string
  name: string
  muscle_groups: string[]
  equipment: string[]
  is_compound: boolean | null
  category: string | null
  difficulty: string | null
  thumbnail_url: string | null
}

const MUSCLE_GROUPS = [
  'chest', 'shoulders', 'triceps', 'lats', 'mid_back', 'biceps',
  'abs', 'quads', 'hamstrings', 'glutes', 'calves', 'forearms',
] as const

const GROUP_LABEL: Record<string, string> = {
  chest: 'Chest', shoulders: 'Shoulders', triceps: 'Triceps', lats: 'Lats',
  mid_back: 'Mid Back', biceps: 'Biceps', abs: 'Abs', quads: 'Quads',
  hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves', forearms: 'Forearms',
}

const EQUIP = [
  { key: 'bodyweight', label: 'Bodyweight' },
  { key: 'dumbbells_only', label: 'Dumbbells' },
  { key: 'full_gym', label: 'Full Gym' },
]

const PAGE = 48

// Collapse each exercise's granular muscle tokens into the 12 display groups.
function displayGroups(muscles: string[]): string[] {
  const set = new Set<string>()
  for (const m of muscles || []) {
    const g = mapToVolumeGroup(m)
    if (g) set.add(g)
  }
  return [...set]
}

export default function LibraryPage() {
  const [all, setAll] = useState<ExerciseCard[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState<string | null>(null)
  const [equip, setEquip] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const rows: ExerciseCard[] = []
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from('exercises')
          .select('id, name, muscle_groups, equipment, is_compound, category, difficulty, thumbnail_url')
          .order('name')
          .range(from, from + 999)
        if (error || !data) break
        rows.push(...(data as ExerciseCard[]))
        if (data.length < 1000) break
      }
      if (!cancelled) { setAll(rows); setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(ex => {
      if (q && !ex.name.toLowerCase().includes(q)) return false
      if (muscle && !displayGroups(ex.muscle_groups).includes(muscle)) return false
      if (equip && !(ex.equipment || []).includes(equip)) return false
      return true
    })
  }, [all, query, muscle, equip])

  // reset paging whenever the filter set changes
  useEffect(() => { setVisible(PAGE) }, [query, muscle, equip])

  const shown = filtered.slice(0, visible)

  return (
    <div className="flex flex-col gap-5">
      {selected && <ExerciseModal exerciseName={selected} onClose={() => setSelected(null)} />}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'rgba(96,108,56,0.12)', border: '1px solid rgba(96,108,56,0.3)' }}>
          <Dumbbell size={20} style={{ color: '#8a9c4a' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
          <p className="text-sm text-white/45">{all.length} exercises — search for form guides, images and target muscles</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search exercises… (e.g. bench press, curl, squat)"
          className="w-full pl-11 pr-4 py-3 rounded-[10px] text-sm text-white placeholder:text-white/35 outline-none"
          style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.18)' }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_GROUPS.map(g => {
            const active = muscle === g
            return (
              <button
                key={g}
                onClick={() => setMuscle(active ? null : g)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={active
                  ? { background: 'rgba(96,108,56,0.22)', border: '1px solid rgba(96,108,56,0.5)', color: '#c7d68f' }
                  : { background: '#0D1420', border: '1px solid rgba(96,108,56,0.14)', color: 'rgba(255,255,255,0.5)' }}
              >
                {GROUP_LABEL[g]}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EQUIP.map(e => {
            const active = equip === e.key
            return (
              <button
                key={e.key}
                onClick={() => setEquip(active ? null : e.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={active
                  ? { background: 'rgba(96,108,56,0.22)', border: '1px solid rgba(96,108,56,0.5)', color: '#c7d68f' }
                  : { background: '#0D1420', border: '1px solid rgba(96,108,56,0.14)', color: 'rgba(255,255,255,0.5)' }}
              >
                {e.label}
              </button>
            )
          })}
          {(muscle || equip || query) && (
            <button
              onClick={() => { setMuscle(null); setEquip(null); setQuery('') }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white/40 hover:text-white/70"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 rounded-[12px] animate-pulse" style={{ background: 'rgba(96,108,56,0.05)', border: '1px solid rgba(96,108,56,0.1)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-white/40 text-sm">No exercises match your search.</div>
      ) : (
        <>
          <p className="text-xs text-white/35">Showing {shown.length} of {filtered.length}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {shown.map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelected(ex.name)}
                className="text-left rounded-[12px] overflow-hidden transition-transform hover:scale-[1.02] focus:outline-none"
                style={{ background: '#0D1420', border: '1px solid rgba(96,108,56,0.14)' }}
              >
                <div className="aspect-square w-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {ex.thumbnail_url
                    ? <img src={ex.thumbnail_url} alt={ex.name} loading="lazy" className="w-full h-full object-contain" />
                    : <Dumbbell size={28} className="text-white/15" />}
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{ex.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {displayGroups(ex.muscle_groups).slice(0, 3).map(g => (
                      <span key={g} className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(96,108,56,0.14)', color: '#a8b872' }}>
                        {GROUP_LABEL[g]}
                      </span>
                    ))}
                    {ex.is_compound && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                        Compound
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {visible < filtered.length && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisible(v => v + PAGE)}
                className="px-5 py-2.5 rounded-[10px] text-sm font-semibold text-white transition-colors"
                style={{ background: 'rgba(96,108,56,0.18)', border: '1px solid rgba(96,108,56,0.35)' }}
              >
                Load more ({filtered.length - visible} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
