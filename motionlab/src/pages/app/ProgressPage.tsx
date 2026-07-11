import React, { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import VolumeTracker from '@/components/VolumeTracker'
import { getWeekStart } from '@/lib/workoutPlan'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useToast } from '@/components/ui/Toast'

function todayStr() { return new Date().toISOString().split('T')[0] }
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }
function toDateStr(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const T = {
  card: '#0D1420', surface2: 'rgba(8,12,20,0.6)', surface: '#080C14',
  border: 'rgba(96,108,56,0.12)', border2: 'rgba(96,108,56,0.28)',
  accent: '#8a9c4a', accentDim: 'rgba(138,156,74,0.15)', action: '#606C38',
  text: 'rgba(255,255,255,0.9)', muted: 'rgba(255,255,255,0.5)', dim: 'rgba(255,255,255,0.3)',
}

function getWeekRange() {
  const ws = getWeekStart()
  const mon = new Date(ws + 'T00:00:00')
  const sun = new Date(mon); sun.setDate(sun.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(mon)} – ${fmt(sun)}`
}

function formatWorkoutName(sessionName: string | null | undefined, exercises: Array<{ exercise?: { name?: string; muscle_groups?: string[] } | null }>) {
  if (sessionName) return sessionName
  const muscleList = [...new Set((exercises || []).flatMap(e => e.exercise?.muscle_groups || []))].map(m => m.replace(/_/g, ' '))
  if (muscleList.length > 0) {
    const top = muscleList.slice(0, 2)
    return top.length === 2 ? `${top[0]} & ${top[1]}` : top[0]
  }
  // No muscle data on this view — fall back to the first exercise names.
  const names = (exercises || []).map(e => e.exercise?.name).filter(Boolean) as string[]
  if (names.length) return names.slice(0, 2).join(' · ')
  return 'Workout'
}

function parseSessionNotes(notes: unknown): Record<string, unknown> {
  if (!notes || typeof notes !== 'string') return {}
  try { const parsed = JSON.parse(notes); return parsed && typeof parsed === 'object' ? parsed : {} } catch { return {} }
}

// ─── SVG line graph ───────────────────────────────────────────────────────────
function LineGraph({ points, color = T.accent, height = 160, unit = 'kg' }: { points: Array<{ x: number; y: number }>; color?: string; height?: number; unit?: string }) {
  if (!points || points.length < 2) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface2, borderRadius: '8px' }}>
      <p style={{ color: T.dim, fontSize: '12px' }}>Not enough data to plot</p>
    </div>
  }
  const W = 560, H = height
  const pad = { top: 18, right: 64, bottom: 28, left: 42 }
  const gW = W - pad.left - pad.right, gH = H - pad.top - pad.bottom
  const xs = points.map(p => p.x), ys = points.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const rawMin = Math.min(...ys), rawMax = Math.max(...ys)
  const yPad = (rawMax - rawMin) * 0.12 || 1
  const minY = rawMin - yPad, maxY = rawMax + yPad
  const px = (x: number) => pad.left + ((x - minX) / (maxX - minX || 1)) * gW
  const py = (y: number) => pad.top + gH - ((y - minY) / (maxY - minY || 1)) * gH
  const polyPts = points.map(p => `${px(p.x)},${py(p.y)}`).join(' ')
  const areaPts = [`${px(xs[0])},${pad.top + gH}`, ...points.map(p => `${px(p.x)},${py(p.y)}`), `${px(xs[xs.length - 1])},${pad.top + gH}`].join(' ')
  const last = points[points.length - 1]
  const yTicks = [rawMin, (rawMin + rawMax) / 2, rawMax]
  const xTickIdxs = points.length <= 5 ? points.map((_, i) => i) : [0, Math.floor(points.length / 3), Math.floor(2 * points.length / 3), points.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }}>
      <defs><linearGradient id="lg-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {yTicks.map((v, i) => <line key={i} x1={pad.left} y1={py(v)} x2={pad.left + gW} y2={py(v)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />)}
      <polygon points={areaPts} fill="url(#lg-grad)" />
      <polyline points={polyPts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(last.x)} cy={py(last.y)} r="5" fill={color} />
      <text x={px(last.x) + 8} y={py(last.y) + 4} fill={color} fontSize="11" fontWeight="600">{last.y.toFixed(1)}{unit}</text>
      {yTicks.map((v, i) => <text key={i} x={pad.left - 4} y={py(v) + 4} fill="#555" fontSize="10" textAnchor="end">{v.toFixed(1)}</text>)}
      {xTickIdxs.map(idx => { const p = points[idx]; const label = new Date(p.x).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); return <text key={idx} x={px(p.x)} y={H - 4} fill="#555" fontSize="9" textAnchor="middle">{label}</text> })}
    </svg>
  )
}

const s: Record<string, React.CSSProperties> = {
  pageTitle: { fontSize: '28px', fontWeight: 800, letterSpacing: '0.01em', marginBottom: '24px', color: '#fff' },
  section: { marginBottom: '24px', background: T.card, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '22px 24px', overflow: 'hidden' },
  sectionHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  sectionTitle: { fontSize: '16px', fontWeight: 700, letterSpacing: '0.01em', color: T.text },
  sectionLabel: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dim },
  filterRow: { display: 'flex', gap: '4px' },
  filterBtn: { padding: '4px 10px', borderRadius: '6px', border: `1px solid ${T.border}`, background: 'transparent', color: T.muted, fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
  filterBtnActive: { background: T.accentDim, borderColor: T.accent, color: T.accent },
  summaryRow: { display: 'flex', gap: '24px', marginTop: '14px' },
  summaryItem: { textAlign: 'center' },
  summaryVal: { fontSize: '22px', fontWeight: 800, letterSpacing: '0.01em', color: T.text },
  summaryLbl: { fontSize: '10px', color: T.muted, marginTop: '2px' },
  btnSm: { padding: '6px 14px', background: 'transparent', border: `1px solid ${T.border2}`, borderRadius: '7px', color: T.text, fontSize: '12px', fontWeight: 500, cursor: 'pointer', marginTop: '12px' },
  btnAccent: { padding: '7px 14px', background: T.action, border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  inlineForm: { marginTop: '14px', padding: '14px', background: T.surface2, borderRadius: '10px', border: `1px solid ${T.border}`, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' },
  formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  formLabel: { fontSize: '10px', fontWeight: 600, color: T.dim, letterSpacing: '0.06em', textTransform: 'uppercase' },
  formInput: { padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', outline: 'none', width: '90px', colorScheme: 'dark' },
  formInputWide: { padding: '7px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', outline: 'none', width: '140px', colorScheme: 'dark' },
  prGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' },
  prCard: { background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '14px', position: 'relative' },
  prName: { fontSize: '12px', fontWeight: 600, color: T.muted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  prWeight: { fontSize: '26px', fontWeight: 800, letterSpacing: '0.01em', color: T.text },
  prMeta: { fontSize: '11px', color: T.dim, marginTop: '2px' },
  newBadge: { position: 'absolute', top: '10px', right: '10px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.accent, background: T.accentDim, borderRadius: '4px', padding: '2px 6px' },
  measRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${T.border}` },
  measName: { fontSize: '13px', fontWeight: 500, width: '100px', color: T.text },
  measVal: { fontSize: '20px', fontWeight: 800, letterSpacing: '0.01em', color: T.text },
  measChange: { fontSize: '12px', fontWeight: 500, minWidth: '60px', textAlign: 'right' },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' },
  photoCard: { borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: T.surface2 },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  photoDate: { fontSize: '10px', color: T.muted, textAlign: 'center', marginTop: '4px' },
  addPhotoCard: { borderRadius: '10px', border: `2px dashed ${T.border2}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', aspectRatio: '3/4', gap: '6px', transition: 'border-color 0.15s' },
  compareRow: { display: 'flex', gap: '10px', marginBottom: '16px' },
  compareImg: { flex: 1, borderRadius: '8px', overflow: 'hidden', background: T.surface2, position: 'relative', aspectRatio: '3/4' },
  selectedOverlay: { position: 'absolute', inset: 0, border: `2px solid ${T.accent}`, borderRadius: '10px', pointerEvents: 'none' },
  calNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  calMonth: { fontSize: '15px', fontWeight: 700, color: T.text },
  calNavBtn: { background: 'none', border: 'none', color: T.muted, fontSize: '16px', cursor: 'pointer', padding: '2px 8px' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' },
  calDayLabel: { fontSize: '9px', color: T.dim, textAlign: 'center', padding: '3px 0', fontWeight: 500 },
  calCell: { aspectRatio: '1', borderRadius: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px', transition: 'background 0.12s', position: 'relative', color: T.text },
  calDot: { width: '4px', height: '4px', borderRadius: '50%', background: T.accent, position: 'absolute', bottom: '2px' },
  detailBlock: { marginTop: '16px', padding: '16px', background: T.surface2, borderRadius: '10px', border: `1px solid ${T.border}` },
  detailTitle: { fontSize: '17px', fontWeight: 800, letterSpacing: '0.01em', marginBottom: '4px', color: T.text },
  detailMeta: { fontSize: '11px', color: T.muted, marginBottom: '12px' },
  exBlock: { marginBottom: '10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '8px', overflow: 'hidden' },
  exBlockHeader: { padding: '8px 12px', borderBottom: `1px solid ${T.border}`, fontSize: '12px', fontWeight: 600, color: T.text },
  setRowD: { display: 'grid', gridTemplateColumns: '36px 1fr 1fr 1fr', gap: '6px', padding: '5px 12px', borderBottom: `1px solid ${T.border}`, fontSize: '11px', color: T.text },
  setRowDHead: { color: T.dim, fontSize: '9px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' },
  searchInput: { width: '100%', padding: '8px 12px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text, fontSize: '13px', outline: 'none', marginBottom: '10px' },
  searchResult: { padding: '10px 0', borderBottom: `1px solid ${T.border}` },
  searchResultName: { fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: T.text },
  historyChip: { fontSize: '10px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '5px', padding: '2px 6px', color: T.muted, display: 'inline-block', marginRight: '4px', marginBottom: '3px' },
}

export default function ProgressPage() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const now = new Date()

  const [weightRange, setWeightRange] = useState('3M')
  const [weightData, setWeightData] = useState<Array<{ x: number; y: number; label: string }>>([])
  const [showWeightForm, setShowWeightForm] = useState(false)
  const [newWeightVal, setNewWeightVal] = useState('')
  const [newWeightDate, setNewWeightDate] = useState(todayStr())
  const [savingWeight, setSavingWeight] = useState(false)

  const [prs, setPrs] = useState<Array<{ name: string; weight: number; reps?: number | null; date?: string | null; isNew: boolean }>>([])
  const [showPrs, setShowPrs] = useState(false)

  const [measurements, setMeasurements] = useState<Array<Record<string, unknown>>>([])
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [showMeasForm, setShowMeasForm] = useState(false)
  const [measForm, setMeasForm] = useState({ date: todayStr(), chest_cm: '', waist_cm: '', hips_cm: '', arms_cm: '', thighs_cm: '' })
  const [savingMeas, setSavingMeas] = useState(false)

  const [photos, setPhotos] = useState<Array<{ id: string; date: string; storage_path: string; url: string }>>([])
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [sessionDates, setSessionDates] = useState<Set<string>>(new Set())
  const [selectedSessions, setSelectedSessions] = useState<Array<Record<string, unknown>>>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ exercise: { id: string; name: string }; history: Array<{ date?: string; weight: number; reps?: number; x: number; y: number }>; maxWeight: number }>>([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    loadWeightData(weightRange); loadPRs(); loadMeasurements(); loadPhotos()
    // eslint-disable-next-line
  }, [user])
  useEffect(() => { if (user) loadWeightData(weightRange) /* eslint-disable-next-line */ }, [weightRange, user])
  useEffect(() => { if (user) loadMonthSessionDates(calYear, calMonth) /* eslint-disable-next-line */ }, [user, calYear, calMonth])
  useEffect(() => {
    if (!searchQuery.trim() || !user) { setSearchResults([]); return }
    const t = setTimeout(() => doSearch(searchQuery.trim()), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line
  }, [searchQuery, user])

  async function loadWeightData(range: string) {
    const from = range === '1M' ? new Date(Date.now() - 30 * 86400000) : range === '3M' ? new Date(Date.now() - 90 * 86400000) : range === '6M' ? new Date(Date.now() - 180 * 86400000) : null
    let q = supabase.from('measurements').select('date,weight_kg').eq('user_id', user!.id).not('weight_kg', 'is', null).order('date')
    if (from) q = q.gte('date', from.toISOString().split('T')[0])
    const { data } = await q
    const rows = data as Array<{ date: string; weight_kg: number | null }> | null
    setWeightData((rows || []).map(d => ({ x: new Date(d.date + 'T12:00:00').getTime(), y: parseFloat(String(d.weight_kg ?? 0)), label: d.date })))
  }

  async function saveWeight() {
    if (!newWeightVal) return
    setSavingWeight(true)
    const kg = parseFloat(newWeightVal)
    await Promise.all([
      (supabase.from('measurements') as any).insert({ user_id: user!.id, date: newWeightDate, weight_kg: kg }),
      (supabase.from('profiles') as any).update({ weight_kg: kg }).eq('id', user!.id),
    ])
    setSavingWeight(false); setShowWeightForm(false); setNewWeightVal(''); loadWeightData(weightRange)
  }

  async function loadPRs() {
    const { data: sessData } = await supabase.from('sessions').select('id,date').eq('user_id', user!.id).order('date', { ascending: false }).limit(500)
    const sess = sessData as Array<{ id: string; date: string }> | null
    if (!sess?.length) return
    const ids = sess.map(x => x.id)
    const dateMap = Object.fromEntries(sess.map(x => [x.id, x.date]))
    const { data: setsData } = await supabase.from('session_sets').select('exercise_id, weight_kg, reps, session_id').in('session_id', ids).eq('completed', true).not('weight_kg', 'is', null)
    const sets = setsData as Array<{ exercise_id: string | null; weight_kg: number | null; reps: number | null; session_id: string }> | null
    if (!sets?.length) return
    const exIds = [...new Set(sets.map(x => x.exercise_id).filter(Boolean) as string[])]
    const { data: exData } = await supabase.from('exercises').select('id,name').in('id', exIds)
    const exMap = Object.fromEntries(((exData as Array<{ id: string; name: string }> | null) || []).map(e => [e.id, e.name]))
    const prMap: Record<string, { name: string; weight: number; reps?: number | null; date?: string | null }> = {}
    sets.forEach(set => {
      if (!set.exercise_id) return
      const w = parseFloat(String(set.weight_kg ?? 0)) || 0
      if (!prMap[set.exercise_id] || w > prMap[set.exercise_id].weight) prMap[set.exercise_id] = { name: exMap[set.exercise_id], weight: w, reps: set.reps, date: dateMap[set.session_id] }
    })
    const sevenAgo = new Date(Date.now() - 7 * 86400000)
    const list = Object.values(prMap).filter(p => p.name).map(p => ({ ...p, isNew: new Date(p.date ?? '').getTime() > sevenAgo.getTime() })).sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.weight - a.weight)
    setPrs(list)
  }

  async function loadMeasurements() {
    const { data } = await supabase.from('measurements').select('date,chest_cm,waist_cm,hips_cm,arms_cm,thighs_cm').eq('user_id', user!.id).order('date', { ascending: false }).limit(10)
    setMeasurements((data as Array<Record<string, unknown>>) || [])
  }

  async function saveMeasurements() {
    setSavingMeas(true)
    const row: Record<string, unknown> = { user_id: user!.id, date: measForm.date }
    ;['chest_cm', 'waist_cm', 'hips_cm', 'arms_cm', 'thighs_cm'].forEach(f => { const v = (measForm as Record<string, string>)[f]; if (v) row[f] = parseFloat(v) })
    await (supabase.from('measurements') as any).upsert(row, { onConflict: 'user_id,date' })
    setSavingMeas(false); setShowMeasForm(false)
    setMeasForm({ date: todayStr(), chest_cm: '', waist_cm: '', hips_cm: '', arms_cm: '', thighs_cm: '' })
    loadMeasurements()
  }

  function measChangeColor(field: string, change: number | null) {
    if (!change) return T.dim
    const goal = profile?.fitness_goal
    if (field === 'waist_cm' || field === 'hips_cm') return change < 0 ? '#4ade80' : '#ff5c5c'
    if (goal === 'muscle_gain') return change > 0 ? '#4ade80' : '#f5a623'
    return change < 0 ? '#4ade80' : '#ff5c5c'
  }

  async function loadPhotos() {
    const { data } = await supabase.from('progress_photos').select('id,date,storage_path').eq('user_id', user!.id).order('date', { ascending: false })
    const rows = data as Array<{ id: string; date: string; storage_path: string }> | null
    if (!rows?.length) { setPhotos([]); return }
    const withUrls = await Promise.all(rows.map(async row => {
      const { data: urlData } = await supabase.storage.from('progress-photos').createSignedUrl(row.storage_path, 3600)
      return { ...row, url: urlData?.signedUrl || null }
    }))
    setPhotos(withUrls.filter(p => p.url) as typeof photos)
  }

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const path = `${user!.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('progress-photos').upload(path, file, { contentType: file.type, upsert: false })
    if (error) {
      console.error('Photo upload error:', error)
      showToast('Photo upload failed — please try again', 'error')
    } else {
      await (supabase.from('progress_photos') as any).insert({ user_id: user!.id, date: todayStr(), storage_path: path })
      loadPhotos()
    }
    setUploading(false); e.target.value = ''
  }

  function togglePhotoSelect(id: string) {
    setSelectedPhotoIds(prev => { if (prev.includes(id)) return prev.filter(x => x !== id); if (prev.length >= 2) return [prev[1], id]; return [...prev, id] })
  }

  async function deletePhoto(photo: { id: string; storage_path: string }) {
    if (!window.confirm('Delete this progress photo?')) return
    await supabase.storage.from('progress-photos').remove([photo.storage_path])
    await supabase.from('progress_photos').delete().eq('id', photo.id).eq('user_id', user!.id)
    setSelectedPhotoIds(prev => prev.filter(x => x !== photo.id))
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  async function loadMonthSessionDates(year: number, month: number) {
    const from = toDateStr(year, month, 1), to = toDateStr(year, month, getDaysInMonth(year, month))
    const { data } = await supabase.from('sessions').select('date').eq('user_id', user!.id).gte('date', from).lte('date', to)
    setSessionDates(new Set(((data as Array<{ date: string }> | null) || []).map(x => x.date)))
  }

  async function handleDateClick(dateStr: string) {
    setSelectedDate(dateStr); setDetailLoading(true)
    const { data: sessData } = await supabase.from('sessions').select('id,date,name,notes,duration,plan_day_id,plan_days(id,name,exercises)').eq('user_id', user!.id).eq('date', dateStr)
    type PlanDayJ = { exercises?: Array<{ exercise_id?: string }> }
    type SessRow = { id: string; date: string; name: string | null; notes: string | null; duration: number | null; plan_day_id: string | null; plan_days: { id: string; name: string | null; exercises: PlanDayJ | null } | null }
    const sessions = sessData as SessRow[] | null
    if (!sessions?.length) { setSelectedSessions([]); setDetailLoading(false); return }

    const sessIds = sessions.map(x => x.id)
    const { data: setsData } = await supabase.from('session_sets').select('session_id,exercise_id,set_number,weight_kg,reps,completed').in('session_id', sessIds).order('set_number')
    type SetRow = { session_id: string; exercise_id: string | null; set_number: number; weight_kg: number | null; reps: number | null; completed: boolean | null }
    const sets = setsData as SetRow[] | null

    const planIdsFor = (sess: SessRow) => (sess.plan_days?.exercises?.exercises || []).map(e => e.exercise_id).filter(Boolean) as string[]
    const allPlanIds = sessions.flatMap(planIdsFor)
    const exIds = [...new Set([...(sets || []).map(x => x.exercise_id).filter(Boolean) as string[], ...allPlanIds])]
    const exMap: Record<string, { id: string; name: string; muscle_groups?: string[] }> = {}
    if (exIds.length) {
      const { data: exsData } = await supabase.from('exercises').select('id,name,muscle_groups').in('id', exIds)
      ;((exsData as Array<{ id: string; name: string; muscle_groups?: string[] }> | null) || []).forEach(e => { exMap[e.id] = e })
    }

    const enriched = sessions.map(sess => {
      const ss = (sets || []).filter(x => x.session_id === sess.id)
      const byEx: Record<string, SetRow[]> = {}
      ss.forEach(x => { const k = String(x.exercise_id); if (!byEx[k]) byEx[k] = []; byEx[k].push(x) })
      const planExerciseIds = planIdsFor(sess)
      const parsedNotes = parseSessionNotes(sess.notes)
      const noteExerciseIds = Array.isArray(parsedNotes.generatedExerciseIds) ? parsedNotes.generatedExerciseIds as string[] : []
      const orderedIds = [...planExerciseIds, ...noteExerciseIds.filter(id => !planExerciseIds.includes(id))]

      const exercises = orderedIds.map(exId => { const exSets = byEx[exId] || []; return { exercise: exMap[exId] || null, sets: exSets, completed: exSets.filter(x => x.completed).length } })
      Object.entries(byEx).forEach(([exId, exSets]) => { if (orderedIds.includes(exId)) return; exercises.push({ exercise: exMap[exId] || null, sets: exSets, completed: exSets.filter(x => x.completed).length }) })

      const completedCount = exercises.reduce((sum, ex) => sum + ex.completed, 0)
      const workoutName = formatWorkoutName(sess.name || (parsedNotes.sessionName as string | undefined) || sess.plan_days?.name, exercises)
      return { ...sess, exercises, completedCount, workoutName }
    }).filter(sess => sess.completedCount > 0 && sess.workoutName)
    setSelectedSessions(enriched as Array<Record<string, unknown>>)
    setDetailLoading(false)
  }

  async function doSearch(query: string) {
    setSearchLoading(true)
    const { data: exData } = await supabase.from('exercises').select('id,name').ilike('name', `%${query}%`).limit(5)
    const exercises = exData as Array<{ id: string; name: string }> | null
    if (!exercises?.length) { setSearchResults([]); setSearchLoading(false); return }
    const results = await Promise.all(exercises.map(async ex => {
      const { data: setsData } = await supabase.from('session_sets').select('weight_kg, reps, logged_at, sessions!inner(date)').eq('exercise_id', ex.id).eq('completed', true).order('logged_at', { ascending: true }).limit(30)
      type SetHistRow = { weight_kg: number | null; reps: number | null; logged_at: string; sessions: { date: string } | null }
      const sets = setsData as SetHistRow[] | null
      const history = (sets || []).map(x => ({ date: x.sessions?.date, weight: parseFloat(String(x.weight_kg ?? 0)) || 0, reps: x.reps ?? undefined, x: new Date(x.logged_at).getTime(), y: parseFloat(String(x.weight_kg ?? 0)) || 0 }))
      const maxWeight = history.length ? Math.max(...history.map(h => h.weight)) : 0
      return { exercise: ex, history, maxWeight }
    }))
    setSearchResults(results); setSearchLoading(false)
  }

  const calCells = useMemo(() => {
    const days = getDaysInMonth(calYear, calMonth), first = getFirstDayOfMonth(calYear, calMonth)
    const cells: (number | null)[] = []
    for (let i = 0; i < first; i++) cells.push(null)
    for (let d = 1; d <= days; d++) cells.push(d)
    return cells
  }, [calYear, calMonth])

  const todayDateStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate())
  const latest = measurements[0] || {}
  const prev = measurements[1] || {}
  const measFields = [{ key: 'chest_cm', label: 'Chest' }, { key: 'waist_cm', label: 'Waist' }, { key: 'hips_cm', label: 'Hips' }, { key: 'arms_cm', label: 'Arms' }, { key: 'thighs_cm', label: 'Thighs' }]
  const comparePhotos = selectedPhotoIds.length === 2 ? selectedPhotoIds.map(id => photos.find(p => p.id === id)).filter((p): p is typeof photos[number] => !!p) : null

  return (
    <div style={{ paddingBottom: isMobile ? '40px' : '20px' }}>
      <h1 style={s.pageTitle}>Progress</h1>

      {/* Body weight */}
      <div style={s.section}>
        <div style={s.sectionHeaderRow}>
          <span style={s.sectionTitle}>Body weight</span>
          <div style={s.filterRow}>{['1M', '3M', '6M', 'All'].map(r => <button key={r} style={{ ...s.filterBtn, ...(weightRange === r ? s.filterBtnActive : {}) }} onClick={() => setWeightRange(r)}>{r}</button>)}</div>
        </div>
        <LineGraph points={weightData} />
        {weightData.length >= 2 && (
          <div style={s.summaryRow}>
            <div style={s.summaryItem}><div style={s.summaryVal}>{weightData[weightData.length - 1].y.toFixed(1)}kg</div><div style={s.summaryLbl}>Current</div></div>
            <div style={s.summaryItem}><div style={s.summaryVal}>{weightData[0].y.toFixed(1)}kg</div><div style={s.summaryLbl}>Start of period</div></div>
            <div style={s.summaryItem}>
              {(() => {
                const diff = weightData[weightData.length - 1].y - weightData[0].y
                const col = diff < 0 ? (profile?.fitness_goal === 'muscle_gain' ? '#f5a623' : '#4ade80') : diff > 0 ? (profile?.fitness_goal === 'fat_loss' ? '#ff5c5c' : '#4ade80') : T.muted
                return <><div style={{ ...s.summaryVal, color: col }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}kg</div><div style={s.summaryLbl}>Change</div></>
              })()}
            </div>
          </div>
        )}
        <button style={s.btnSm} onClick={() => setShowWeightForm(v => !v)}>{showWeightForm ? 'Cancel' : 'Log weight'}</button>
        {showWeightForm && (
          <div style={s.inlineForm}>
            <div style={s.formField}><span style={s.formLabel}>Weight (kg)</span><input type="number" placeholder="75.0" value={newWeightVal} onChange={e => setNewWeightVal(e.target.value)} style={s.formInput} /></div>
            <div style={s.formField}><span style={s.formLabel}>Date</span><input type="date" value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} style={s.formInputWide} /></div>
            <button style={{ ...s.btnAccent, opacity: savingWeight ? 0.5 : 1 }} onClick={saveWeight} disabled={savingWeight}>{savingWeight ? 'Saving…' : 'Save'}</button>
          </div>
        )}
      </div>

      {/* Personal records */}
      <div style={s.section}>
        <div style={s.sectionHeaderRow}>
          <span style={s.sectionTitle}>Personal records</span>
          <button onClick={() => setShowPrs(v => !v)} style={{ ...s.sectionLabel, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }} aria-expanded={showPrs}>{showPrs ? 'Hide' : 'Show'} ({prs.length})</button>
        </div>
        {!showPrs ? null : prs.length === 0 ? (
          <p style={{ color: T.dim, fontSize: '13px' }}>Complete sessions with logged weights to see your PRs here.</p>
        ) : (
          <div style={s.prGrid}>
            {prs.map(pr => (
              <div key={pr.name} style={{ ...s.prCard, ...(pr.isNew ? { borderColor: T.accent } : {}) }}>
                {pr.isNew && <span style={s.newBadge}>New</span>}
                <div style={s.prName}>{pr.name}</div>
                <div style={s.prWeight}>{pr.weight}kg</div>
                <div style={s.prMeta}>{pr.reps ? `× ${pr.reps} reps` : ''}{pr.reps && pr.date ? ' · ' : ''}{pr.date ? new Date(pr.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Measurements */}
      <div style={s.section}>
        <div style={s.sectionHeaderRow}>
          <span style={s.sectionTitle}>Measurements</span>
          {!!(latest as Record<string, unknown>).date && <span style={s.sectionLabel}>Last: {(latest as Record<string, string>).date}</span>}
        </div>
        {measFields.map(({ key, label }) => {
          const cur = (latest as Record<string, string | undefined>)[key]
          const old = (prev as Record<string, string | undefined>)[key]
          const change = cur && old ? parseFloat(cur) - parseFloat(old) : null
          return (
            <div key={key} style={s.measRow}>
              <span style={s.measName}>{label}</span>
              <span style={s.measVal}>{cur ? `${cur} cm` : '—'}</span>
              {change !== null ? <span style={{ ...s.measChange, color: measChangeColor(key, change) }}>{change > 0 ? '+' : ''}{change.toFixed(1)} cm</span> : <span style={{ ...s.measChange, color: T.dim }}>—</span>}
            </div>
          )
        })}
        <button style={s.btnSm} onClick={() => setShowMeasForm(v => !v)}>{showMeasForm ? 'Cancel' : 'Log measurements'}</button>
        {showMeasForm && (
          <div style={s.inlineForm}>
            {['Date', 'Chest', 'Waist', 'Hips', 'Arms', 'Thighs'].map((label, i) => {
              const keys = ['date', 'chest_cm', 'waist_cm', 'hips_cm', 'arms_cm', 'thighs_cm']; const k = keys[i]
              return (
                <div key={k} style={s.formField}>
                  <span style={s.formLabel}>{label}{i > 0 ? ' (cm)' : ''}</span>
                  <input type={i === 0 ? 'date' : 'number'} placeholder={i === 0 ? '' : '0.0'} value={measForm[k as keyof typeof measForm]} onChange={e => setMeasForm(f => ({ ...f, [k]: e.target.value }))} style={i === 0 ? s.formInputWide : s.formInput} />
                </div>
              )
            })}
            <button style={{ ...s.btnAccent, opacity: savingMeas ? 0.5 : 1 }} onClick={saveMeasurements} disabled={savingMeas}>{savingMeas ? 'Saving…' : 'Save'}</button>
          </div>
        )}
      </div>

      {/* Progress photos */}
      <div style={s.section}>
        <div style={s.sectionHeaderRow}><span style={s.sectionTitle}>Progress photos</span></div>
        {comparePhotos && (
          <div style={s.compareRow}>
            {comparePhotos.map(p => (
              <div key={p.id} style={s.compareImg}>
                <img src={p.url} alt={p.date} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px 8px', fontSize: '10px', color: '#fff' }}>{p.date}</div>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoFile} />
        <div style={s.photoGrid}>
          {photos.map(photo => {
            const isSel = selectedPhotoIds.includes(photo.id)
            return (
              <div key={photo.id}>
                <div style={{ ...s.photoCard, ...(isSel ? { outline: `2px solid ${T.accent}` } : {}) }} onClick={() => togglePhotoSelect(photo.id)}>
                  <img src={photo.url} alt={photo.date} style={s.photoImg} />
                  {isSel && <div style={s.selectedOverlay} />}
                  <button onClick={e => { e.stopPropagation(); deletePhoto(photo) }} title="Delete photo"
                    style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: '14px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>×</button>
                </div>
                <div style={s.photoDate}>{photo.date}</div>
              </div>
            )
          })}
          <div style={{ ...s.addPhotoCard, ...(uploading ? { opacity: 0.5, pointerEvents: 'none' } : {}) }} onClick={() => fileInputRef.current?.click()}
            onMouseOver={e => e.currentTarget.style.borderColor = T.accent} onMouseOut={e => e.currentTarget.style.borderColor = T.border2}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={T.accent} strokeWidth="2" strokeLinecap="round" /></svg>
            <span style={{ fontSize: '11px', color: T.muted }}>{uploading ? 'Uploading…' : 'Add photo'}</span>
          </div>
        </div>
        {photos.length === 0 && !uploading && <p style={{ fontSize: '12px', color: T.dim, marginTop: '8px' }}>Click a photo to select it. Select two to compare side-by-side.</p>}
      </div>

      {/* Weekly volume */}
      <div style={s.section}>
        <div style={s.sectionHeaderRow}><span style={s.sectionTitle}>Weekly volume</span><span style={s.sectionLabel}>{getWeekRange()}</span></div>
        <VolumeTracker userId={user?.id ?? ''} />
      </div>

      {/* Session history */}
      <div style={s.section}>
        <span style={s.sectionTitle}>Session history</span>
        <div style={{ marginTop: '16px', maxWidth: '300px' }}>
          <div style={s.calNav}>
            <button style={s.calNavBtn} onClick={() => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) } else setCalMonth(m => m - 1) }}>‹</button>
            <span style={s.calMonth}>{MONTH_NAMES[calMonth]} {calYear}</span>
            <button style={s.calNavBtn} onClick={() => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) } else setCalMonth(m => m + 1) }}>›</button>
          </div>
          <div style={s.calGrid}>
            {DAY_NAMES.map(d => <div key={d} style={s.calDayLabel}>{d}</div>)}
            {calCells.map((day, idx) => {
              if (!day) return <div key={`e${idx}`} style={{ aspectRatio: '1' }} />
              const ds = toDateStr(calYear, calMonth, day)
              const hasSess = sessionDates.has(ds), isToday = ds === todayDateStr, isSel = ds === selectedDate
              return (
                <div key={day} style={{ ...s.calCell, ...(isToday ? { border: `1px solid ${T.border2}` } : {}), ...(isSel ? { background: T.accentDim, color: T.accent } : {}), ...(!hasSess && !isToday ? { color: T.dim } : {}) }} onClick={() => handleDateClick(ds)}>
                  {day}{hasSess && <div style={s.calDot} />}
                </div>
              )
            })}
          </div>
        </div>

        {selectedDate && !detailLoading && selectedSessions.length === 0 && (
          <div style={s.detailBlock}>
            <div style={s.detailTitle}>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style={s.detailMeta}>No sessions logged for this day.</div>
          </div>
        )}
        {selectedDate && !detailLoading && selectedSessions.length > 0 && (selectedSessions as Array<{
          id: string; name: string | null; date: string; duration: number | null
          exercises: Array<{ exercise: { id?: string; name?: string } | null; sets: Array<Record<string, unknown>>; completed: number }>; workoutName?: string
        }>).map(sess => (
          <div key={sess.id} style={s.detailBlock}>
            <div style={s.detailTitle}>{formatWorkoutName(sess.name, sess.exercises)}</div>
            <div style={s.detailMeta}>{new Date(sess.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}{sess.duration ? ` · ${sess.duration} min` : ''}</div>
            <div style={{ marginBottom: '10px' }}><span style={{ ...s.sectionLabel, marginRight: '8px' }}>Exercises</span><span style={{ fontSize: '12px', color: T.muted }}>{sess.exercises.map(e => e.exercise?.name || 'Unknown').join(', ') || '—'}</span></div>
            {sess.exercises.map(({ exercise, sets }) => (
              <div key={exercise?.id ?? Math.random()} style={s.exBlock}>
                <div style={s.exBlockHeader}>{exercise?.name ?? 'Unknown'}</div>
                <div style={{ ...s.setRowD, ...s.setRowDHead }}><div>Set</div><div>Weight</div><div>Reps</div><div>RPE</div></div>
                {sets.map((set, i) => (
                  <div key={i} style={s.setRowD}>
                    <div style={{ color: T.muted }}>{set.set_number as number}</div>
                    <div>{set.weight_kg != null ? `${set.weight_kg}` : '—'}kg</div>
                    <div>{set.reps != null ? `${set.reps}` : '—'}</div>
                    <div style={{ color: T.dim }}>{set.rpe != null ? `${set.rpe}` : '—'}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
        {detailLoading && <p style={{ color: T.muted, fontSize: '12px', marginTop: '12px' }}>Loading…</p>}

        <div style={{ marginTop: '20px' }}>
          <div style={{ ...s.sectionLabel, marginBottom: '8px' }}>Search by exercise</div>
          <input type="text" placeholder="e.g. Barbell Squat" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={s.searchInput} />
          {searchLoading && <p style={{ fontSize: '12px', color: T.muted }}>Searching…</p>}
          {searchResults.map(({ exercise, history, maxWeight }) => (
            <div key={exercise.id} style={s.searchResult}>
              <div style={s.searchResultName}>{exercise.name} <span style={{ color: T.accent, fontWeight: 700 }}>— {maxWeight > 0 ? maxWeight + 'kg PR' : 'No weight data'}</span></div>
              {history.length >= 2 && <div style={{ marginBottom: '8px' }}><LineGraph points={history.map(h => ({ x: h.x, y: h.y }))} height={80} /></div>}
              <div>{history.slice(-8).map((h, i) => { const isBest = h.weight === maxWeight; return <span key={i} style={{ ...s.historyChip, ...(isBest ? { borderColor: T.accent, color: T.accent, background: T.accentDim } : {}) }}>{h.date} · {h.weight || '—'}kg × {h.reps || '—'}</span> })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
