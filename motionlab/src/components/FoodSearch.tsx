import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'

// motionlab olive/dark theme tokens
const T = {
  surface: '#080C14',
  surface2: 'rgba(8,12,20,0.85)',
  border: 'rgba(96,108,56,0.15)',
  border2: 'rgba(96,108,56,0.3)',
  accent: '#8a9c4a',
  action: '#606C38',
  text: 'rgba(255,255,255,0.9)',
  muted: 'rgba(255,255,255,0.45)',
  dim: 'rgba(255,255,255,0.28)',
  amber: '#F5C542',
  blue: '#60a5fa',
}

interface FoodNutrient { nutrientNumber: string | number; value: number }

// Normalised food item. Indian rows are per-serving; USDA rows are per-100g.
interface FoodItem {
  key: string
  food_name: string
  source: 'indian' | 'usda'
  base: 'serving' | '100g'
  cals: number
  protein: number
  carbs: number
  fat: number
  serving_desc?: string | null
}

function getNutrient(nutrients: FoodNutrient[], number: string | number): number {
  const n = (nutrients || []).find(x => String(x.nutrientNumber) === String(number))
  return n?.value ?? 0
}

async function searchIndian(q: string): Promise<FoodItem[]> {
  const { data } = await supabase
    .from('indian_foods')
    .select('id, name, serving_desc, calories, protein_g, carbs_g, fat_g')
    .ilike('name', `%${q}%`)
    .limit(8)
  type Row = { id: string; name: string; serving_desc: string | null; calories: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null }
  return ((data as Row[] | null) || []).map(r => ({
    key: `in_${r.id}`,
    food_name: r.name,
    source: 'indian' as const,
    base: 'serving' as const,
    cals: r.calories || 0,
    protein: r.protein_g || 0,
    carbs: r.carbs_g || 0,
    fat: r.fat_g || 0,
    serving_desc: r.serving_desc,
  }))
}

async function searchUSDA(q: string): Promise<FoodItem[]> {
  try {
    const { data, error } = await supabase.functions.invoke('usda-proxy', { body: { query: q, pageSize: 6 } })
    if (error || !data) return []
    const typed = data as { foods?: Array<{ fdcId: number; description: string; foodNutrients: FoodNutrient[] }> }
    return (typed.foods || []).map(f => ({
      key: `usda_${f.fdcId}`,
      food_name: f.description,
      source: 'usda' as const,
      base: '100g' as const,
      cals: getNutrient(f.foodNutrients, 208),
      protein: getNutrient(f.foodNutrients, 203),
      carbs: getNutrient(f.foodNutrients, 205),
      fat: getNutrient(f.foodNutrients, 204),
    }))
  } catch { return [] }
}

// qty means servings (indian) or grams (usda).
function getMacros(food: FoodItem, qty: number) {
  const f = food.base === 'serving' ? qty : qty / 100
  return {
    calories: Math.round(food.cals * f),
    protein: Math.round(food.protein * f * 10) / 10,
    carbs: Math.round(food.carbs * f * 10) / 10,
    fat: Math.round(food.fat * f * 10) / 10,
  }
}

export default function FoodSearch({ onLogged }: { onLogged?: () => void }) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [qty, setQty] = useState(1)
  const [mealName, setMealName] = useState('')
  const [logging, setLogging] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function runSearch(q: string) {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    const [indianRes, usdaRes] = await Promise.allSettled([searchIndian(q), searchUSDA(q)])
    const indian = indianRes.status === 'fulfilled' ? indianRes.value : []
    const usda = usdaRes.status === 'fulfilled' ? usdaRes.value : []
    const seen = new Set<string>()
    const merged: FoodItem[] = []
    for (const item of [...indian, ...usda]) {
      const key = item.food_name.toLowerCase().trim()
      if (!seen.has(key)) { seen.add(key); merged.push(item) }
    }
    setResults(merged.slice(0, 12))
    setSearching(false)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(q), 350)
  }

  function selectFood(item: FoodItem) {
    setSelected(item)
    setMealName(item.food_name)
    setQty(item.base === 'serving' ? 1 : 100)
  }

  async function addToLog() {
    if (!selected || !user) return
    setLogging(true)
    const m = getMacros(selected, qty)
    const { error } = await (supabase.from('meal_history') as any).insert({
      user_id: user.id,
      food_name: mealName.trim() || selected.food_name,
      calories: m.calories,
      protein_g: m.protein,
      carbs_g: m.carbs,
      fat_g: m.fat,
      quantity_g: selected.base === '100g' ? qty : null,
    })
    if (error) {
      showToast('Failed to log meal', 'error')
    } else {
      showToast('Meal logged', 'success')
      window.dispatchEvent(new CustomEvent('foodLogUpdated'))
      onLogged?.()
      setSelected(null); setQuery(''); setResults([]); setMealName(''); setQty(1)
    }
    setLogging(false)
  }

  const macros = selected ? getMacros(selected, qty) : null
  const unitLabel = selected?.base === 'serving' ? (selected.serving_desc || 'serving') : 'grams'

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: T.surface2, border: `1px solid ${T.border}`,
    borderRadius: '8px', color: T.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark',
  }

  return (
    <div>
      <input
        placeholder="Search foods — dal makhani, chicken, oats…"
        value={query}
        onChange={handleInput}
        style={{ ...inputStyle, marginBottom: (results.length || searching) ? '8px' : 0 }}
        onFocus={e => { e.target.style.borderColor = T.accent }}
        onBlur={e => { e.target.style.borderColor = T.border }}
      />

      {searching && <div style={{ fontSize: '12px', color: T.dim, marginBottom: '8px' }}>Searching…</div>}

      {results.length > 0 && !selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
          {results.map(r => (
            <div key={r.key} onClick={() => selectFood(r)}
              style={{ display: 'flex', alignItems: 'center', padding: '9px 12px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '7px', cursor: 'pointer', gap: '10px' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = T.accent }}
              onMouseOut={e => { e.currentTarget.style.borderColor = T.border }}>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: T.text }}>{r.food_name}</span>
              <span style={{ fontSize: '11px', color: T.muted, whiteSpace: 'nowrap' }}>
                {Math.round(r.cals)} kcal · P:{Math.round(r.protein)}g {r.base === 'serving' ? '/ serving' : '/ 100g'}
              </span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap',
                background: r.source === 'indian' ? 'rgba(138,156,74,0.15)' : 'rgba(96,165,250,0.15)',
                color: r.source === 'indian' ? T.accent : T.blue }}>
                {r.source === 'indian' ? 'IN' : 'USDA'}
              </span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '10px', padding: '14px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px', color: T.text }}>{selected.food_name}</div>
              <div style={{ fontSize: '11px', color: T.muted }}>
                {selected.base === 'serving' ? `Per ${selected.serving_desc || 'serving'}` : 'Per 100g'} · {Math.round(selected.cals)} kcal
              </div>
            </div>
            <button onClick={() => { setSelected(null); setQuery('') }} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 0 0 8px', flexShrink: 0 }}>×</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input type="number" min="0.25" step={selected.base === 'serving' ? 0.5 : 10} value={qty}
              onChange={e => setQty(Math.max(0.25, Number(e.target.value) || 0.25))}
              style={{ width: '80px', padding: '6px 8px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '13px', outline: 'none' }} />
            <span style={{ fontSize: '12px', color: T.muted }}>{unitLabel}{selected.base === 'serving' && qty !== 1 ? 's' : ''}</span>
          </div>

          {macros && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {[
                { label: 'Calories', val: macros.calories, unit: 'kcal', color: T.amber },
                { label: 'Protein', val: macros.protein, unit: 'g', color: T.accent },
                { label: 'Carbs', val: macros.carbs, unit: 'g', color: T.blue },
                { label: 'Fat', val: macros.fat, unit: 'g', color: '#f87171' },
              ].map(b => (
                <div key={b.label} style={{ padding: '6px 12px', background: T.surface, borderRadius: '7px', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: '9px', color: T.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{b.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: b.color, lineHeight: 1 }}>
                    {b.val}<span style={{ fontSize: '10px', fontWeight: 400, color: T.muted, marginLeft: '2px' }}>{b.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input placeholder="Meal name (optional)" value={mealName} onChange={e => setMealName(e.target.value)}
              style={{ flex: 1, minWidth: '140px', padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = T.accent }} onBlur={e => { e.target.style.borderColor = T.border }} />
            <button onClick={addToLog} disabled={logging}
              style={{ padding: '8px 18px', background: T.action, border: 'none', borderRadius: '7px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: logging ? 'not-allowed' : 'pointer', opacity: logging ? 0.6 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {logging ? 'Logging…' : 'Add to log'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
