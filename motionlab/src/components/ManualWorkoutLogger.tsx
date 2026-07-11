import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkout } from '@/contexts/WorkoutContext'
import { useToast } from '@/components/ui/Toast'
import { updateVolumeLog, subtractVolumeLog } from '@/lib/volumeTracker'
import { classifyExercise } from '@/lib/exerciseClassifier'

interface ExerciseItem {
  id: string
  name: string
  muscle_groups?: string[]
  isCustom?: boolean
}

interface SetEntry {
  weight: string
  reps: string
}

interface ExerciseEntry {
  exercise: ExerciseItem
  sets: SetEntry[]
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function slugify(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

// motionlab olive/dark theme tokens (KavaFit used CSS vars; inlined here)
const T = {
  surface: '#0D1420',
  surfaceDeep: '#080C14',
  input: 'rgba(8,12,20,0.9)',
  border: 'rgba(96,108,56,0.12)',
  border2: 'rgba(96,108,56,0.28)',
  accent: '#8a9c4a',
  action: '#606C38',
  text: 'rgba(255,255,255,0.9)',
  muted: 'rgba(255,255,255,0.45)',
  dim: 'rgba(255,255,255,0.25)',
  amber: '#F5C542',
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: T.surface, border: `1px solid ${T.border2}`, borderRadius: '14px', padding: '0', maxWidth: '540px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  cardHeader: { padding: '24px 28px 20px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 },
  cardBody: { padding: '20px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' },
  cardFooter: { padding: '16px 28px', borderTop: `1px solid ${T.border}`, flexShrink: 0, background: T.surface },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '22px', fontWeight: 800, letterSpacing: '0.02em', color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: T.muted, fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  label: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: T.muted, marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '9px 12px', boxSizing: 'border-box', background: T.input, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text, fontSize: '14px', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', colorScheme: 'dark' },
  divider: { borderTop: `1px solid ${T.border}`, margin: '0' },
  searchWrap: { position: 'relative' },
  dropdown: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 10, background: T.surfaceDeep, border: `1px solid ${T.border2}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
  dropdownItem: { padding: '10px 14px', cursor: 'pointer', fontSize: '13px', borderBottom: `1px solid ${T.border}`, transition: 'background 0.1s', color: T.text },
  dropdownCustom: { padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: T.accent, display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.1s' },
  exBlock: { background: T.surfaceDeep, border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden' },
  exBlockHeader: { padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` },
  exName: { fontSize: '14px', fontWeight: 600, color: T.text },
  exMuscles: { fontSize: '11px', color: T.accent, marginTop: '2px' },
  exCustomBadge: { fontSize: '10px', color: T.amber, marginTop: '2px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' },
  removeExBtn: { background: 'none', border: 'none', color: T.muted, fontSize: '16px', cursor: 'pointer', lineHeight: 1 },
  setHeadRow: { display: 'grid', gridTemplateColumns: '36px 1fr 1fr 28px', gap: '8px', padding: '6px 14px', borderBottom: `1px solid ${T.border}` },
  setColLabel: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.dim, textAlign: 'center' },
  setRow: { display: 'grid', gridTemplateColumns: '36px 1fr 1fr 28px', gap: '8px', padding: '5px 14px', alignItems: 'center' },
  setNum: { fontSize: '12px', color: T.muted, textAlign: 'center' },
  setInput: { padding: '5px 7px', background: T.input, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '13px', outline: 'none', width: '100%', textAlign: 'center', fontFamily: 'inherit', transition: 'border-color 0.15s', colorScheme: 'dark' },
  removeSetBtn: { background: 'none', border: 'none', color: T.dim, fontSize: '14px', cursor: 'pointer', textAlign: 'center' },
  addSetRow: { padding: '8px 14px', borderTop: `1px solid ${T.border}` },
  addSetBtn: { background: 'none', border: 'none', color: T.muted, fontSize: '12px', cursor: 'pointer', padding: 0 },
  saveBtn: { padding: '12px', background: T.action, border: `1px solid ${T.border2}`, borderRadius: '9px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', width: '100%', transition: 'opacity 0.15s' },
  saveBtnDisabled: { opacity: 0.45, pointerEvents: 'none' },
  emptyExercises: { fontSize: '13px', color: T.dim, textAlign: 'center', padding: '12px 0' },
  sectionLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.dim, marginBottom: '10px' },
}

const ManualWorkoutLogger = React.memo(function ManualWorkoutLogger({ onClose, onSaved, editSessionId = null }: {
  onClose: () => void
  onSaved?: () => void
  editSessionId?: string | null
}) {
  const { user } = useAuth()
  const { triggerHeatmapRefresh } = useWorkout()
  const { showToast } = useToast()

  const isEditing = !!editSessionId

  const [sessionName, setSessionName] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [durationMinutes, setDurationMinutes] = useState('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ExerciseItem[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(isEditing)
  const [classifying, setClassifying] = useState<Record<string, boolean>>({})
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const originalDateRef = useRef(selectedDate)

  useEffect(() => {
    if (!editSessionId) return
    loadEditSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSessionId])

  async function loadEditSession() {
    setLoadingEdit(true)
    try {
      type SessRow = { id: string; name: string | null; date: string; duration: number | null }
      type SetRow = { exercise_id: string; set_number: number; weight_kg: number | null; reps: number | null }
      type ExRow = { id: string; name: string; muscle_groups: string[] }

      const sessRes = await supabase.from('sessions').select('id, name, date, duration').eq('id', editSessionId!).single()
      const sess = sessRes.data as SessRow | null

      if (sess) {
        setSessionName(sess.name || '')
        setSelectedDate(sess.date || todayStr())
        setDurationMinutes(sess.duration?.toString() || '')
        originalDateRef.current = sess.date || todayStr()
      }

      const setsRes = await supabase.from('session_sets').select('exercise_id, set_number, weight_kg, reps').eq('session_id', editSessionId!).eq('completed', true).order('set_number')
      const sets = setsRes.data as SetRow[] | null

      if (sets?.length) {
        const exIds = [...new Set(sets.map(x => x.exercise_id))]
        const exsRes = await supabase.from('exercises').select('id, name, muscle_groups').in('id', exIds)
        const exs = exsRes.data as ExRow[] | null
        const exMap: Record<string, ExRow> = {}
        exs?.forEach(ex => { exMap[ex.id] = ex })

        const grouped: Record<string, ExerciseEntry> = {}
        const order: string[] = []
        sets.forEach(x => {
          if (!grouped[x.exercise_id]) {
            const exData = exMap[x.exercise_id]
            grouped[x.exercise_id] = { exercise: exData || { id: x.exercise_id, name: 'Unknown', muscle_groups: [] }, sets: [] }
            order.push(x.exercise_id)
          }
          grouped[x.exercise_id].sets.push({ weight: x.weight_kg?.toString() || '', reps: x.reps?.toString() || '' })
        })
        setExercises(order.map(id => grouped[id]))
      }
    } catch (err) {
      console.error('Failed to load session for editing:', err)
      showToast('Failed to load session', 'error')
    } finally {
      setLoadingEdit(false)
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      type ExRow = { id: string; name: string; muscle_groups: string[] }
      const { data } = await supabase.from('exercises').select('id, name, muscle_groups').ilike('name', `%${searchQuery.trim()}%`).limit(8)
      const results = data as ExRow[] | null
      const already = new Set(exercises.map(e => e.exercise.id))
      setSearchResults((results || []).filter(ex => !already.has(ex.id)))
      setSearching(false)
    }, 280)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [searchQuery, exercises])

  function addExercise(ex: ExerciseItem) {
    setExercises(prev => [...prev, { exercise: ex, sets: [{ weight: '', reps: '' }, { weight: '', reps: '' }, { weight: '', reps: '' }] }])
    setSearchQuery('')
    setSearchResults([])
  }

  async function addCustomExercise(name: string) {
    const tempId = `__custom_${Date.now()}`
    const trimmed = name.trim()
    addExercise({ id: tempId, name: trimmed, muscle_groups: [], isCustom: true })
    setClassifying(prev => ({ ...prev, [tempId]: true }))
    const groups = await classifyExercise(trimmed)
    setExercises(prev => prev.map(ex => ex.exercise.id === tempId ? { ...ex, exercise: { ...ex.exercise, muscle_groups: groups } } : ex))
    setClassifying(prev => { const next = { ...prev }; delete next[tempId]; return next })
  }

  function removeExercise(idx: number) {
    setExercises(prev => prev.filter((_, i) => i !== idx))
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof SetEntry, value: string) {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex
      return { ...ex, sets: ex.sets.map((x, si) => si === setIdx ? { ...x, [field]: value } : x) }
    }))
  }

  function addSet(exIdx: number) {
    setExercises(prev => prev.map((ex, i) => i === exIdx ? { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] } : ex))
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex
      if (ex.sets.length <= 1) return ex
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
    }))
  }

  function countFilledSets() {
    return exercises.reduce((total, ex) => total + ex.sets.filter(x => String(x.reps || '').trim() !== '').length, 0)
  }

  function isValid() {
    if (!sessionName.trim() || !selectedDate) return false
    return exercises.some(ex => ex.sets.some(x => String(x.reps || '').trim() !== ''))
  }

  async function resolveExerciseId(ex: ExerciseItem): Promise<string> {
    if (!ex.isCustom) return ex.id
    type ExIdRow = { id: string }
    const { data: existing } = await supabase.from('exercises').select('id').ilike('name', ex.name).limit(1).maybeSingle()
    const existingRow = existing as ExIdRow | null
    if (existingRow) return existingRow.id
    const { data: created, error } = await (supabase.from('exercises') as any)
      .insert({ name: ex.name, slug: slugify(ex.name), muscle_groups: ex.muscle_groups || [], category: 'strength' })
      .select('id').single()
    if (error) throw error
    return (created as ExIdRow).id
  }

  function buildInsertSets(sessionId: string, resolvedExercises: ExerciseEntry[]) {
    const allInsertSets: object[] = []
    const setsForVolume: { muscle_groups: string[] }[] = []
    resolvedExercises.forEach(ex => {
      ex.sets.forEach((x, si) => {
        const repsStr = String(x.reps || '').trim()
        if (!repsStr) return
        const repsNum = parseInt(repsStr)
        const weightNum = parseFloat(x.weight) || null
        allInsertSets.push({
          session_id: sessionId,
          exercise_id: ex.exercise.id,
          set_number: si + 1,
          weight_kg: weightNum,
          reps: isNaN(repsNum) ? null : repsNum,
          completed: true,
        })
        setsForVolume.push({ muscle_groups: ex.exercise.muscle_groups || [] })
      })
    })
    return { allInsertSets, setsForVolume }
  }

  async function handleSave() {
    if (!isValid() || saving) return
    setSaving(true)
    try {
      const name = sessionName.trim()
      const resolvedExercises = await Promise.all(
        exercises.map(async ex => ({ ...ex, exercise: { ...ex.exercise, id: await resolveExerciseId(ex.exercise) } }))
      )

      type SessIdRow = { id: string }
      const { data: sessionRow, error: sessionErr } = await (supabase.from('sessions') as any)
        .insert({
          user_id: user!.id,
          date: selectedDate,
          name,
          plan_day_id: null,
          duration: durationMinutes !== '' ? parseInt(durationMinutes) || null : null,
        })
        .select('id').single()

      if (sessionErr) throw sessionErr

      const sessionId = (sessionRow as SessIdRow).id
      const { allInsertSets, setsForVolume } = buildInsertSets(sessionId, resolvedExercises)

      if (allInsertSets.length > 0) {
        const { error: setsErr } = await (supabase.from('session_sets') as any).insert(allInsertSets)
        if (setsErr) throw setsErr
        await updateVolumeLog(user!.id, setsForVolume, selectedDate)
      }

      triggerHeatmapRefresh()
      showToast('Session logged successfully', 'success')
      onSaved?.()
      onClose()
    } catch (err) {
      console.error('Failed to log workout:', err)
      showToast('Failed to save session', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!isValid() || saving) return
    setSaving(true)
    try {
      const name = sessionName.trim()

      type OldSetRow = { exercise_id: string }
      type ExMgRow = { id: string; muscle_groups: string[] }

      const { data: oldSets } = await supabase.from('session_sets').select('exercise_id').eq('session_id', editSessionId!).eq('completed', true)
      const oldSetsTyped = oldSets as OldSetRow[] | null

      let oldSetsForVolume: { muscle_groups: string[] }[] = []
      if (oldSetsTyped?.length) {
        const oldExIds = [...new Set(oldSetsTyped.map(x => x.exercise_id))]
        const { data: oldExs } = await supabase.from('exercises').select('id, muscle_groups').in('id', oldExIds)
        const oldExsTyped = oldExs as ExMgRow[] | null
        const exMgMap: Record<string, string[]> = {}
        oldExsTyped?.forEach(ex => { exMgMap[ex.id] = ex.muscle_groups || [] })
        oldSetsForVolume = oldSetsTyped.map(x => ({ muscle_groups: exMgMap[x.exercise_id] || [] }))
      }

      const resolvedExercises = await Promise.all(
        exercises.map(async ex => ({ ...ex, exercise: { ...ex.exercise, id: await resolveExerciseId(ex.exercise) } }))
      )

      await (supabase.from('sessions') as any).update({
        name,
        date: selectedDate,
        duration: durationMinutes !== '' ? parseInt(durationMinutes) || null : null,
      }).eq('id', editSessionId!)

      await supabase.from('session_sets').delete().eq('session_id', editSessionId!)
      const { allInsertSets, setsForVolume } = buildInsertSets(editSessionId!, resolvedExercises)
      if (allInsertSets.length > 0) {
        await (supabase.from('session_sets') as any).insert(allInsertSets)
      }

      await subtractVolumeLog(user!.id, oldSetsForVolume, originalDateRef.current)
      if (setsForVolume.length > 0) {
        await updateVolumeLog(user!.id, setsForVolume, selectedDate)
      }

      triggerHeatmapRefresh()
      showToast('Session updated', 'success')
      onSaved?.()
      onClose()
    } catch (err) {
      console.error('Failed to update session:', err)
      showToast('Failed to update session', 'error')
    } finally {
      setSaving(false)
    }
  }

  function formatMuscles(muscleGroups: string[] | undefined) {
    if (!muscleGroups?.length) return ''
    const unique = [...new Set(muscleGroups.map(m => m.split('_')[0]))]
    return unique.slice(0, 3).join(', ')
  }

  const trimmedQuery = searchQuery.trim()
  const showCustomOption = trimmedQuery.length > 1 && !searching && !exercises.some(e => e.exercise.name.toLowerCase() === trimmedQuery.toLowerCase())
  const showDropdown = searching || searchResults.length > 0 || showCustomOption
  const filledSets = countFilledSets()
  const valid = isValid()

  if (loadingEdit) {
    return (
      <div style={s.overlay}>
        <div style={{ ...s.card, alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <div style={{ color: T.muted, fontSize: '13px' }}>Loading session…</div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.card}>

        <div style={s.cardHeader}>
          <div style={s.header}>
            <div>
              <div style={s.title}>{isEditing ? 'Edit Session' : 'Log Session'}</div>
              <div style={{ fontSize: '12px', color: T.muted, marginTop: '3px' }}>
                {isEditing ? 'Update exercises and sets, then save' : 'Add all exercises from your session, then save'}
              </div>
            </div>
            <button style={s.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={s.cardBody}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={s.label}>Session name</label>
              <input style={s.input} placeholder="e.g. Push Day, Upper Body…" value={sessionName} onChange={e => setSessionName(e.target.value)}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div>
              <label style={s.label}>Date</label>
              <input type="date" style={{ ...s.input, width: 'auto' }} value={selectedDate} max={todayStr()} onChange={e => setSelectedDate(e.target.value)}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
          </div>

          <div>
            <label style={s.label}>Duration (optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="number" min="1" max="300" placeholder="—" style={{ ...s.input, width: '80px', textAlign: 'center' }} value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
              <span style={{ fontSize: '13px', color: T.muted }}>minutes</span>
            </div>
          </div>

          <div style={s.divider} />

          <div>
            <label style={s.label}>Add exercises</label>
            <div style={s.searchWrap}>
              <input style={s.input} placeholder="Search or type any exercise name…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => { e.target.style.borderColor = T.border; setTimeout(() => setSearchResults([]), 150) }} />
              {showDropdown && (
                <div style={s.dropdown}>
                  {searching && <div style={{ padding: '10px 14px', fontSize: '12px', color: T.muted }}>Searching…</div>}
                  {searchResults.map(ex => (
                    <div key={ex.id} style={s.dropdownItem} onMouseDown={() => addExercise(ex)}
                      onMouseOver={e => e.currentTarget.style.background = T.surface} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ fontWeight: 500 }}>{ex.name}</div>
                      {ex.muscle_groups && ex.muscle_groups.length > 0 && (
                        <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px' }}>{formatMuscles(ex.muscle_groups)}</div>
                      )}
                    </div>
                  ))}
                  {showCustomOption && (
                    <div style={s.dropdownCustom} onMouseDown={() => addCustomExercise(trimmedQuery)}
                      onMouseOver={e => e.currentTarget.style.background = T.surface} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
                      <span>Add "<strong>{trimmedQuery}</strong>" as new exercise</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {exercises.length === 0 ? (
            <div style={s.emptyExercises}>Search above to add exercises, or type a name to create a custom one</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={s.sectionLabel}>Exercises added ({exercises.length})</div>
              {exercises.map((ex, exIdx) => (
                <div key={ex.exercise.id} style={s.exBlock}>
                  <div style={s.exBlockHeader}>
                    <div>
                      <div style={s.exName}>{ex.exercise.name}</div>
                      {ex.exercise.isCustom && (
                        classifying[ex.exercise.id]
                          ? <div style={s.exCustomBadge}>Identifying muscles…</div>
                          : ex.exercise.muscle_groups && ex.exercise.muscle_groups.length > 0
                            ? <div style={s.exMuscles}>{ex.exercise.muscle_groups.join(', ')}</div>
                            : <div style={s.exCustomBadge}>Custom · no muscles identified</div>
                      )}
                      {!ex.exercise.isCustom && ex.exercise.muscle_groups && ex.exercise.muscle_groups.length > 0 && (
                        <div style={s.exMuscles}>{formatMuscles(ex.exercise.muscle_groups)}</div>
                      )}
                    </div>
                    <button style={s.removeExBtn} onClick={() => removeExercise(exIdx)}>✕</button>
                  </div>

                  <div style={s.setHeadRow}>
                    <div style={s.setColLabel}>Set</div>
                    <div style={s.setColLabel}>Weight (kg)</div>
                    <div style={s.setColLabel}>Reps</div>
                    <div />
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} style={s.setRow}>
                      <div style={s.setNum}>{setIdx + 1}</div>
                      <input type="number" min="0" step="0.5" placeholder="—" style={s.setInput} value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                        onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
                      <input type="number" min="1" step="1" placeholder="—" style={s.setInput} value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                        onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
                      <button style={s.removeSetBtn} onClick={() => removeSet(exIdx, setIdx)} title="Remove set">✕</button>
                    </div>
                  ))}

                  <div style={s.addSetRow}>
                    <button style={s.addSetBtn} onClick={() => addSet(exIdx)}>+ Add set</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.cardFooter}>
          {valid && (
            <div style={{ fontSize: '12px', color: T.muted, marginBottom: '10px', textAlign: 'center' }}>
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} · {filledSets} set{filledSets !== 1 ? 's' : ''} ready to save
            </div>
          )}
          <button style={{ ...s.saveBtn, ...(!valid || saving ? s.saveBtnDisabled : {}) }} onClick={isEditing ? handleUpdate : handleSave}
            onMouseOver={e => valid && !saving && (e.currentTarget.style.opacity = '0.85')} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            {saving ? (isEditing ? 'Updating…' : 'Saving…') : (isEditing ? 'Update Session' : 'Save Session')}
          </button>
        </div>
      </div>
    </div>
  )
})

export default ManualWorkoutLogger
