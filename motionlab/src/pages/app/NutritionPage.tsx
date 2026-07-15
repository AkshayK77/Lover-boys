import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { callAgent, parseAgentJSON } from '@/lib/ai'
import { useToast } from '@/components/ui/Toast'
import { useIsMobile } from '@/hooks/useIsMobile'
import FoodSearch from '@/components/FoodSearch'
import { deriveMacroTargets } from '@/lib/workoutPlan'
import type { Profile } from '@/types'

interface Ingredient { quantity: unknown; item: string }
interface Recipe {
  recipeName: string; proteinG?: number; carbsG?: number; fatG?: number; calories?: number
  ingredients?: Ingredient[]; steps?: string[]
}
interface MealRow {
  id: string; food_name?: string | null; protein_g?: number | null
  carbs_g?: number | null; fat_g?: number | null; calories?: number | null; logged_date?: string | null; created_at?: string | null
}
interface MacroArg { protein: number; carbs: number; fat: number; calories: number }

function todayStr() { return new Date().toISOString().split('T')[0] }
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }
function toDateStr(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const T = {
  card: '#0D1420', surface2: 'rgba(8,12,20,0.6)', surface: '#080C14',
  border: 'rgba(96,108,56,0.12)', border2: 'rgba(96,108,56,0.28)',
  accent: '#8a9c4a', action: '#606C38', text: 'rgba(255,255,255,0.9)',
  muted: 'rgba(255,255,255,0.5)', dim: 'rgba(255,255,255,0.3)', amber: '#F5C542', blue: '#60a5fa',
}

function parseQty(quantityStr: unknown) {
  const m = String(quantityStr || '').match(/^(\d+(?:\.\d+)?)(.*)/)
  if (!m) return { num: null as number | null, unit: String(quantityStr || '') }
  return { num: parseFloat(m[1]), unit: m[2].trim() }
}

function RecipeCard({ recipe, onLog, logging, label, accentColor = T.accent, cardStyle = {} }: {
  recipe: Recipe; onLog: (macros: MacroArg) => void; logging: boolean
  label?: string; accentColor?: string; cardStyle?: React.CSSProperties
}) {
  const [qtys, setQtys] = useState<(number | null)[]>(() => (recipe.ingredients || []).map(ing => parseQty(ing.quantity).num))
  const originalTotal = (recipe.ingredients || []).reduce((sum, ing) => sum + (parseQty(ing.quantity).num || 0), 0)
  const newTotal = qtys.reduce<number>((sum, q) => sum + (q ?? 0), 0)
  const scale = originalTotal > 0 && newTotal > 0 ? newTotal / originalTotal : 1
  const macros = {
    protein: Math.round((recipe.proteinG || 0) * scale), carbs: Math.round((recipe.carbsG || 0) * scale),
    fat: Math.round((recipe.fatG || 0) * scale), calories: Math.round((recipe.calories || 0) * scale),
  }
  return (
    <div style={cardStyle}>
      {label && <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: accentColor, marginBottom: '6px' }}>{label}</div>}
      <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.02em', marginBottom: '4px', color: T.text }}>{recipe.recipeName}</div>
      <div style={{ fontSize: '12px', color: T.muted, marginBottom: '10px', lineHeight: 1.5 }}>{recipe.steps?.[0] || ''}</div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {[{ label: 'Protein', val: macros.protein, unit: 'g' }, { label: 'Carbs', val: macros.carbs, unit: 'g' }, { label: 'Fat', val: macros.fat, unit: 'g' }, { label: 'Calories', val: macros.calories, unit: 'kcal' }].map(item => (
          <div key={item.label} style={{ fontSize: '12px', color: T.muted }}>
            {item.label}: <span style={{ fontWeight: 600, color: T.text }}>{item.val}{item.unit}</span>
          </div>
        ))}
      </div>
      {(recipe.ingredients || []).length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.dim, marginBottom: '8px' }}>Ingredients</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {(recipe.ingredients ?? []).map((ing, i) => {
              const { num, unit } = parseQty(ing.quantity)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {num !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <input type="number" min="0" value={qtys[i] ?? num}
                        onChange={e => { const v = parseFloat(e.target.value) || 0; setQtys(prev => prev.map((q, idx) => idx === i ? v : q)) }}
                        style={{ width: '58px', padding: '3px 6px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: '5px', color: T.text, fontSize: '12px', outline: 'none', textAlign: 'right' }} />
                      {unit && <span style={{ fontSize: '11px', color: T.muted, minWidth: '16px' }}>{unit}</span>}
                    </div>
                  ) : <span style={{ fontSize: '12px', color: T.muted, flexShrink: 0 }}>{ing.quantity as React.ReactNode}</span>}
                  <span style={{ fontSize: '12px', color: T.text }}>{ing.item}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <button style={{ padding: '7px 14px', background: accentColor, border: 'none', borderRadius: '7px', color: '#0a0a0a', fontSize: '12px', fontWeight: 700, cursor: logging ? 'not-allowed' : 'pointer', opacity: logging ? 0.5 : 1 }}
        onClick={() => onLog(macros)} disabled={logging}>
        {logging ? 'Logging…' : 'Log this meal'}
      </button>
    </div>
  )
}

function MacroCard({ label, current, target, color, unit }: { label: string; current: number; target: number; color: string; unit: string }) {
  const pct = target > 0 ? Math.min(current / target, 1) : 0
  const remaining = target > 0 ? Math.max(target - current, 0) : null
  return (
    <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '18px 16px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.dim, marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1, marginBottom: '2px', color: T.text }}>
        {current}{target > 0 && <span style={{ fontSize: '14px', color: T.muted, fontWeight: 400 }}> / {target}</span>}
      </div>
      <div style={{ fontSize: '11px', color: T.muted, marginBottom: '10px' }}>{remaining !== null ? `${remaining}${unit} remaining` : unit}</div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: '28px', fontWeight: 800, letterSpacing: '0.01em', marginBottom: '24px', color: '#fff' },
  card: { marginBottom: '20px', background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '22px 24px' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: 700, letterSpacing: '0.01em', color: T.text },
  label: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dim },
  macroRow: { display: 'flex', gap: '10px' },
  cupBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', padding: '2px', lineHeight: 1, transition: 'transform 0.1s' },
  cupsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0 6px' },
  waterLabel: { fontSize: '13px', color: T.muted, marginTop: '2px' },
  mealRow: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` },
  mealName: { flex: 1, fontSize: '13px', fontWeight: 500, marginRight: '8px', color: T.text },
  mealMacros: { fontSize: '11px', color: T.muted, marginRight: '14px', whiteSpace: 'nowrap' },
  mealCals: { fontSize: '17px', fontWeight: 700, color: T.accent, minWidth: '48px', textAlign: 'right' },
  btnAccent: { padding: '9px 18px', background: T.action, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' },
  btnDim: { padding: '7px 14px', background: 'none', border: `1px solid ${T.border}`, borderRadius: '7px', color: T.muted, fontSize: '12px', cursor: 'pointer' },
  ingredientInput: { width: '100%', padding: '10px 14px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text, fontSize: '13px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  recipeCard: { background: 'linear-gradient(135deg, rgba(96,108,56,0.12) 0%, #0D1420 100%)', border: '1px solid rgba(138,156,74,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  groceryCategory: { marginBottom: '16px' },
  groceryCatTitle: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: '8px' },
  groceryItem: { fontSize: '13px', color: T.text, padding: '3px 0', display: 'flex', gap: '8px', alignItems: 'flex-start' },
  historyDate: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dim, padding: '12px 0 4px', borderTop: `1px solid ${T.border}`, marginTop: '4px' },
  useAgainBtn: { padding: '4px 10px', background: 'none', border: `1px solid ${T.border}`, borderRadius: '5px', color: T.muted, fontSize: '11px', cursor: 'pointer', flexShrink: 0 },
  deleteBtn: { padding: '4px 10px', background: 'none', border: `1px solid ${T.border}`, borderRadius: '5px', color: '#ff8b8b', fontSize: '11px', cursor: 'pointer', flexShrink: 0 },
  calNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  calMonth: { fontSize: '15px', fontWeight: 700, letterSpacing: '0.01em', color: T.text },
  calNavBtn: { background: 'none', border: 'none', color: T.muted, fontSize: '16px', cursor: 'pointer', padding: '2px 8px' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  calDayLabel: { fontSize: '9px', color: T.dim, textAlign: 'center', padding: '3px 0', fontWeight: 500 },
  calCell: { aspectRatio: '1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px', transition: 'background 0.12s', position: 'relative', border: 'none', color: T.text, background: 'transparent' },
  calCellActive: { background: 'rgba(138,156,74,0.15)', outline: '1px solid rgba(138,156,74,0.5)', borderRadius: '6px' },
  calDot: { width: '4px', height: '4px', borderRadius: '50%', background: T.accent, position: 'absolute', bottom: '4px' },
  mealDetailRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: `1px solid ${T.border}` },
  historyName: { flex: 1, fontSize: '13px', fontWeight: 500, marginRight: '8px', color: T.text },
  historyMacros: { fontSize: '11px', color: T.muted, marginRight: '12px', whiteSpace: 'nowrap' },
}

export default function NutritionPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const isMobile = useIsMobile()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayMeals, setTodayMeals] = useState<MealRow[]>([])
  const [allMeals, setAllMeals] = useState<MealRow[]>([])
  const [hasSessionToday, setHasSessionToday] = useState(false)
  const [todayMuscles, setTodayMuscles] = useState<string[]>([])

  const hydrKey = `ml_hydration_${todayStr()}`
  const [hydrationCups, setHydrationCups] = useState<boolean[]>(() => {
    try { const v = localStorage.getItem(hydrKey); return v ? JSON.parse(v) : Array(10).fill(false) } catch { return Array(10).fill(false) }
  })

  const [ingredients, setIngredients] = useState('')
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [altRecipe, setAltRecipe] = useState<Recipe | null>(null)
  const [generatingRecipe, setGeneratingRecipe] = useState(false)
  const [loggingRecipe, setLoggingRecipe] = useState(false)
  const [loggingAltRecipe, setLoggingAltRecipe] = useState(false)

  const [groceryList, setGroceryList] = useState<Record<string, unknown> | null>(null)
  const [generatingGrocery, setGeneratingGrocery] = useState(false)
  const [copied, setCopied] = useState(false)

  const now = new Date()
  const [mealCalYear, setMealCalYear] = useState(now.getFullYear())
  const [mealCalMonth, setMealCalMonth] = useState(now.getMonth())
  const [selectedMealDate, setSelectedMealDate] = useState(todayStr())

  useEffect(() => { if (user) loadAll() /* eslint-disable-next-line */ }, [user])
  useEffect(() => {
    const handler = () => { loadTodayMeals(); loadAllMeals() }
    window.addEventListener('foodLogUpdated', handler)
    return () => window.removeEventListener('foodLogUpdated', handler)
    // eslint-disable-next-line
  }, [user])
  useEffect(() => { try { localStorage.setItem(hydrKey, JSON.stringify(hydrationCups)) } catch { /* ignore */ } }, [hydrationCups, hydrKey])

  async function loadAll() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
    setProfile(prof as Profile)
    await Promise.all([loadTodayMeals(), loadAllMeals(), checkSessionToday()])
  }

  async function loadTodayMeals() {
    const { data } = await supabase.from('meal_history').select('*').eq('user_id', user!.id).eq('logged_date', todayStr()).order('created_at', { ascending: false })
    setTodayMeals((data as MealRow[]) || [])
  }

  async function loadAllMeals() {
    const { data } = await supabase.from('meal_history').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(150)
    setAllMeals((data as MealRow[]) || [])
  }

  async function deleteMeal(id: string) {
    if (!window.confirm('Delete this meal entry?')) return
    await supabase.from('meal_history').delete().eq('id', id).eq('user_id', user!.id)
    setTodayMeals(prev => prev.filter(m => m.id !== id))
    setAllMeals(prev => prev.filter(m => m.id !== id))
  }

  async function checkSessionToday() {
    const { data } = await supabase.from('sessions').select('id').eq('user_id', user!.id).eq('date', todayStr())
    const sessions = data as Array<{ id: string }> | null
    const hasSess = (sessions || []).length > 0
    setHasSessionToday(hasSess)
    if (hasSess) {
      const ids = (sessions || []).map(x => x.id)
      const { data: sets } = await supabase.from('session_sets').select('exercise_id').in('session_id', ids).eq('completed', true)
      const exIds = [...new Set(((sets as Array<{ exercise_id: string | null }> | null) || []).map(x => x.exercise_id).filter(Boolean) as string[])]
      if (exIds.length) {
        const { data: exs } = await supabase.from('exercises').select('muscle_groups').in('id', exIds)
        const muscles = [...new Set(((exs as Array<{ muscle_groups: string[] | null }> | null) || []).flatMap(e => e.muscle_groups || []))]
        setTodayMuscles(muscles.slice(0, 4))
      }
    }
  }

  function toggleCup(i: number) { setHydrationCups(prev => prev.map((v, idx) => idx === i ? !v : v)) }

  async function generateRecipe(ingredientsOverride?: string) {
    const ing = ingredientsOverride !== undefined ? ingredientsOverride : ingredients
    if (!ing.trim()) return
    if (ingredientsOverride !== undefined) setIngredients(ingredientsOverride)
    setGeneratingRecipe(true)
    try {
      const consumed = { calories: todayMeals.reduce((sm, m) => sm + (m.calories || 0), 0), protein: todayMeals.reduce((sm, m) => sm + (m.protein_g || 0), 0) }
      const remainingCals = Math.max((profile?.calorie_target || 0) - consumed.calories, 0)
      const remainingProtein = Math.max((profile?.protein_target || 0) - consumed.protein, 0)
      const sessionStr = hasSessionToday ? `did train (${todayMuscles.join(', ') || 'general'})` : 'did not train'
      const allergyStr = profile?.dietary_notes ? ` Avoid/respect: ${profile.dietary_notes}.` : ''
      const message = `Generate a recipe using EXACTLY these ingredients the user has provided: ${ing.trim()}. Use these ingredients as-is — do not substitute or remove them based on any dietary preference. The user chose these ingredients themselves.${allergyStr} Remaining targets today: ${Math.round(remainingCals)} kcal, ${Math.round(remainingProtein)}g protein. Today they ${sessionStr}.`

      setAltRecipe(null)
      const text = await callAgent(user!.id, message, 'recipe')
      const parsed = parseAgentJSON(text) as Recipe | null
      if (parsed) {
        setCurrentRecipe(parsed)
        showToast('Recipe generated', 'success')
        const targetCals = parsed.calories || Math.round(remainingCals / 3)
        const targetProtein = parsed.proteinG || Math.round(remainingProtein / 3)
        const altMessage = `Generate a VEGETARIAN alternative recipe for a single meal. It must closely match these macros: ~${targetCals} kcal and ~${targetProtein}g protein. Replace any non-vegetarian items from these original ingredients (${ing.trim()}) with vegetarian equivalents.${allergyStr} Use realistic portion sizes for one meal — no more than 150–200g of any single ingredient. Today they ${sessionStr}.`
        const altText = await callAgent(user!.id, altMessage, 'recipe')
        const altParsed = parseAgentJSON(altText) as Recipe | null
        if (altParsed) setAltRecipe(altParsed)
      } else {
        showToast('Could not generate recipe — try again', 'error')
      }
    } catch {
      showToast('Could not generate recipe — please try again', 'error')
    } finally {
      setGeneratingRecipe(false)
    }
  }

  async function logRecipe(recipe: Recipe | null, macros: MacroArg, setBusy: (b: boolean) => void, fallbackName: string) {
    if (!recipe) return
    setBusy(true)
    await (supabase.from('meal_history') as any).insert({
      user_id: user!.id,
      food_name: recipe.recipeName || fallbackName,
      protein_g: macros?.protein ?? recipe.proteinG ?? 0,
      carbs_g: macros?.carbs ?? recipe.carbsG ?? 0,
      fat_g: macros?.fat ?? recipe.fatG ?? 0,
      calories: macros?.calories ?? recipe.calories ?? 0,
    })
    setBusy(false)
    loadTodayMeals(); loadAllMeals()
    showToast('Meal logged', 'success')
  }

  async function generateGroceryList() {
    if (!profile) return
    setGeneratingGrocery(true)
    const message = `Generate a 5-day grocery list for a user with goal ${profile.fitness_goal || 'general fitness'}, dietary preference ${profile.dietary_preference || 'none'}, restrictions ${profile.dietary_notes || 'none'}, and daily targets of ${profile.calorie_target || 2000} calories and ${profile.protein_target || 150}g protein. Group by category: Proteins, Carbs, Vegetables, Fats, Other. Return only a JSON object with category names as keys and arrays of items as values.`
    const text = await callAgent(user!.id, message, 'grocery')
    const parsed = parseAgentJSON(text) as Record<string, unknown> | null
    if (parsed) setGroceryList(parsed)
    setGeneratingGrocery(false)
  }

  function copyGroceryList() {
    if (!groceryList) return
    const lines = Object.entries(groceryList).filter(([, items]) => Array.isArray(items) && (items as unknown[]).length)
      .map(([cat, items]) => `${cat}:\n${(items as string[]).map(i => `  • ${i}`).join('\n')}`).join('\n\n')
    navigator.clipboard.writeText(lines)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const macros = {
    calories: Math.round(todayMeals.reduce((sm, m) => sm + (m.calories || 0), 0)),
    protein: Math.round(todayMeals.reduce((sm, m) => sm + (m.protein_g || 0), 0)),
    carbs: Math.round(todayMeals.reduce((sm, m) => sm + (m.carbs_g || 0), 0)),
    fat: Math.round(todayMeals.reduce((sm, m) => sm + (m.fat_g || 0), 0)),
  }
  const derived = deriveMacroTargets(profile?.calorie_target || 0, profile?.protein_target || 0)
  const targets = {
    calories: profile?.calorie_target || 0,
    protein: profile?.protein_target || 0,
    carbs: derived.carbs,
    fat: derived.fat,
  }

  const waterTargetL = profile?.weight_kg ? Math.round((Number(profile.weight_kg) * 35 + (hasSessionToday ? 500 : 0)) / 250) * 0.25 : 2.5
  const waterConsumedL = ((hydrationCups.filter(Boolean).length / 10) * waterTargetL).toFixed(1)

  const mealsByDate: Record<string, MealRow[]> = {}
  allMeals.forEach(m => {
    const date = m.logged_date || (m.created_at || '').split('T')[0] || todayStr()
    if (!mealsByDate[date]) mealsByDate[date] = []
    mealsByDate[date].push(m)
  })
  const mealDates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a))
  const mealDateSet = new Set(mealDates)

  useEffect(() => {
    if (!mealDates.length) return
    if (!selectedMealDate || !mealDateSet.has(selectedMealDate)) setSelectedMealDate(mealDates[0])
    // eslint-disable-next-line
  }, [mealDates.join(','), selectedMealDate])

  const focusAccent = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = T.accent }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = T.border }

  return (
    <div style={{ paddingBottom: isMobile ? '40px' : '20px' }}>
      <h1 style={s.title}>Nutrition</h1>

      {/* Daily macros */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Daily macros</span>
          {!targets.calories && <span style={{ fontSize: '11px', color: T.dim }}>Set targets in onboarding</span>}
        </div>
        <div style={s.macroRow}>
          <MacroCard label="Calories" current={macros.calories} target={targets.calories} color={T.amber} unit="kcal" />
          <MacroCard label="Protein" current={macros.protein} target={targets.protein} color={T.accent} unit="g" />
          <MacroCard label="Carbs" current={macros.carbs} target={targets.carbs} color={T.blue} unit="g" />
          <MacroCard label="Fat" current={macros.fat} target={targets.fat} color="#f87171" unit="g" />
        </div>
      </div>

      {/* Hydration */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Hydration</span>
          <span style={s.label}>{waterTargetL.toFixed(1)}L target{hasSessionToday ? ' · +0.5L for session' : ''}</span>
        </div>
        <div style={s.cupsRow}>
          {hydrationCups.map((filled, i) => (
            <button key={i} style={s.cupBtn} onClick={() => toggleCup(i)} title={filled ? 'Remove' : 'Add'}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.2)' }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)' }}>
              <span style={{ opacity: filled ? 1 : 0.2 }}>💧</span>
            </button>
          ))}
        </div>
        <p style={s.waterLabel}>{waterConsumedL}L / {waterTargetL.toFixed(1)}L</p>
      </div>

      {/* Today's food log */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Today's food log</span>
          <span style={s.label}>{todayMeals.length} {todayMeals.length === 1 ? 'meal' : 'meals'}</span>
        </div>
        {todayMeals.length === 0 ? (
          <p style={{ fontSize: '13px', color: T.dim }}>Nothing logged yet today.</p>
        ) : (
          <>
            {todayMeals.map(m => (
              <div key={m.id} style={s.mealRow}>
                <span style={s.mealName}>{m.food_name || 'Meal'}</span>
                <span style={s.mealMacros}>P:{Math.round(m.protein_g || 0)}g · C:{Math.round(m.carbs_g || 0)}g · F:{Math.round(m.fat_g || 0)}g</span>
                <span style={s.mealCals}>{Math.round(m.calories || 0)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0 0', borderTop: `1px solid ${T.border}`, marginTop: '2px' }}>
              <span style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: T.muted }}>Total</span>
              <span style={{ ...s.mealMacros, fontWeight: 600 }}>P:{macros.protein}g · C:{macros.carbs}g · F:{macros.fat}g</span>
              <span style={{ ...s.mealCals, color: T.text }}>{macros.calories}</span>
            </div>
          </>
        )}
        <div style={{ marginTop: '16px', borderTop: `1px solid ${T.border}`, paddingTop: '16px' }}>
          <div style={{ ...s.label, marginBottom: '10px' }}>Search foods</div>
          <FoodSearch onLogged={() => { loadTodayMeals(); loadAllMeals() }} />
        </div>
      </div>

      {/* Describe a meal — AI recipe */}
      <div style={s.card}>
        <div style={s.cardHeader}><span style={s.cardTitle}>Describe a meal</span></div>
        {currentRecipe && <RecipeCard key={currentRecipe.recipeName} recipe={currentRecipe} onLog={m => logRecipe(currentRecipe, m, setLoggingRecipe, 'Generated recipe')} logging={loggingRecipe} cardStyle={s.recipeCard} />}
        {altRecipe && <RecipeCard key={altRecipe.recipeName} recipe={altRecipe} onLog={m => logRecipe(altRecipe, m, setLoggingAltRecipe, 'Vegetarian alternative')} logging={loggingAltRecipe} label="Vegetarian Alternative" accentColor="#6ddc7c" cardStyle={{ ...s.recipeCard, marginTop: '12px' }} />}
        {generatingRecipe && !currentRecipe && <div style={{ fontSize: '12px', color: T.dim, marginBottom: '12px' }}>Generating recipes…</div>}
        <div style={{ ...s.label, marginBottom: '8px' }}>What ingredients do you have?</div>
        <input placeholder="e.g. chicken breast, rice, broccoli, olive oil" value={ingredients} onChange={e => setIngredients(e.target.value)} style={s.ingredientInput} onFocus={focusAccent} onBlur={blurBorder} />
        <button style={{ ...s.btnAccent, opacity: (generatingRecipe || !ingredients.trim()) ? 0.5 : 1 }} onClick={() => generateRecipe()} disabled={generatingRecipe || !ingredients.trim()}>
          {generatingRecipe ? 'Generating…' : 'Generate recipe →'}
        </button>
      </div>

      {/* Meal history */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Meal history</span>
          {allMeals.length > 0 && <span style={s.label}>{allMeals.length} entries</span>}
        </div>
        <div style={s.calNav}>
          <button style={s.calNavBtn} onClick={() => { const d = new Date(mealCalYear, mealCalMonth - 1, 1); setMealCalYear(d.getFullYear()); setMealCalMonth(d.getMonth()) }}>‹</button>
          <div style={s.calMonth}>{MONTH_NAMES[mealCalMonth]} {mealCalYear}</div>
          <button style={s.calNavBtn} onClick={() => { const d = new Date(mealCalYear, mealCalMonth + 1, 1); setMealCalYear(d.getFullYear()); setMealCalMonth(d.getMonth()) }}>›</button>
        </div>
        <div style={s.calGrid}>
          {DAY_NAMES.map(d => <div key={d} style={s.calDayLabel}>{d}</div>)}
          {(() => {
            const days = getDaysInMonth(mealCalYear, mealCalMonth)
            const first = getFirstDayOfMonth(mealCalYear, mealCalMonth)
            const cells: (number | null)[] = []
            for (let i = 0; i < first; i++) cells.push(null)
            for (let d = 1; d <= days; d++) cells.push(d)
            return cells.map((d, idx) => {
              if (!d) return <div key={`empty-${idx}`} />
              const dateStr = toDateStr(mealCalYear, mealCalMonth, d)
              const hasMeals = mealDateSet.has(dateStr)
              const isActive = dateStr === selectedMealDate
              return (
                <div key={dateStr} style={{ ...s.calCell, ...(isActive ? s.calCellActive : {}) }} onClick={() => setSelectedMealDate(dateStr)} title={hasMeals ? 'Meals logged' : 'No meals logged'}>
                  {d}{hasMeals && <span style={s.calDot} />}
                </div>
              )
            })
          })()}
        </div>
        <div style={s.historyDate}>
          {selectedMealDate ? new Date(selectedMealDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'Select a day'}
        </div>
        {(mealsByDate[selectedMealDate] || []).length === 0 ? (
          <p style={{ fontSize: '13px', color: T.dim }}>No meals logged for this day.</p>
        ) : (
          (mealsByDate[selectedMealDate] || []).map(m => (
            <div key={m.id} style={s.mealDetailRow}>
              <span style={s.historyName}>{m.food_name || 'Meal'}</span>
              <span style={s.historyMacros}>P:{Math.round(m.protein_g || 0)}g · C:{Math.round(m.carbs_g || 0)}g · F:{Math.round(m.fat_g || 0)}g · {Math.round(m.calories || 0)}kcal</span>
              <button style={s.useAgainBtn} onClick={() => generateRecipe(m.food_name || '')}>Use again</button>
              <button style={s.deleteBtn} onClick={() => deleteMeal(m.id)}>Delete</button>
            </div>
          ))
        )}
      </div>

      {/* Grocery list */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Grocery list</span>
          {groceryList && <button style={s.btnDim} onClick={copyGroceryList}>{copied ? '✓ Copied' : 'Copy list'}</button>}
        </div>
        <button style={{ ...s.btnAccent, opacity: generatingGrocery ? 0.5 : 1 }} onClick={generateGroceryList} disabled={generatingGrocery}>
          {generatingGrocery ? 'Generating…' : 'Generate grocery list'}
        </button>
        {groceryList && (
          <div style={{ marginTop: '20px' }}>
            {Object.entries(groceryList).map(([cat, items]) => Array.isArray(items) && items.length > 0 ? (
              <div key={cat} style={s.groceryCategory}>
                <div style={s.groceryCatTitle}>{cat}</div>
                {items.map((item, i) => <div key={i} style={s.groceryItem}><span style={{ color: T.accent, flexShrink: 0 }}>·</span>{item as React.ReactNode}</div>)}
              </div>
            ) : null)}
          </div>
        )}
      </div>
    </div>
  )
}
