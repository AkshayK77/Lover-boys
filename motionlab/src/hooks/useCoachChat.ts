import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkout } from '@/contexts/WorkoutContext'
import { callAgent, parseAgentJSON } from '@/lib/ai'
import type { WorkoutUpdate } from '@/contexts/WorkoutContext'
import { buildAgentContext } from '@/lib/agentContext'
import { getOrCreateConversation, loadRecentMessages, saveMessage } from '@/lib/coach'

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string | null
  showApplyBtn?: boolean
  originalUserMsg?: string
}

// Shared coach state. Persistence-lite: loads the rolling conversation and
// saves each turn. Both AIDrawer and AIPage call this so they share the thread.
export function useCoachChat(initialMessage?: string | null, onInitialConsumed?: () => void) {
  const { user } = useAuth()
  const { activeSessionExercises, setWorkoutUpdate } = useWorkout()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [contextChips, setContextChips] = useState<string[]>([])
  const convIdRef = useRef<string | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  messagesRef.current = messages

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      loadContextChips()
      const cid = await getOrCreateConversation(user.id)
      if (cancelled) return
      convIdRef.current = cid
      if (cid) {
        const stored = await loadRecentMessages(cid)
        if (!cancelled) setMessages(stored.map((m, i) => ({ id: i, role: m.role, text: m.content })))
      }
    })()
    if (initialMessage) {
      setInput(initialMessage)
      onInitialConsumed?.()
    }
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadContextChips = useCallback(async () => {
    if (!user) return
    try {
      const ctx = await buildAgentContext(user.id)
      const chips: string[] = []
      if (ctx.todayDay?.dayName) chips.push(ctx.todayDay.dayName)
      if (ctx.todayNutrition.protein > 0) chips.push(`Protein: ${ctx.todayNutrition.protein}g today`)
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      chips.push(`Week ${Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)}`)
      if (ctx.profile?.injuries && ctx.profile.injuries !== 'None') chips.push(`Injury: ${ctx.profile.injuries}`)
      if (ctx.sportSchedule.length) chips.push(`${ctx.sportSchedule[0].sport} ${ctx.sportSchedule[0].day}`)
      setContextChips(chips)
    } catch { /* non-critical */ }
  }, [user])

  const sendMessage = useCallback(async (text: string) => {
    const msg = text.trim()
    if (!msg || isTyping || !user) return
    setInput('')
    const history = messagesRef.current.map(m => ({ role: m.role, content: m.text || '' }))
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg }])
    setIsTyping(true)
    if (convIdRef.current) saveMessage(convIdRef.current, 'user', msg, 'default')

    const responseText = await callAgent(user.id, msg, null, history)
    setIsTyping(false)

    const names = activeSessionExercises.map(e => e.toLowerCase())
    const responseLC = (responseText ?? '').toLowerCase()
    const mentionsCurrentSession = names.length > 0 && names.some(n => responseLC.includes(n))

    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: responseText, showApplyBtn: mentionsCurrentSession, originalUserMsg: msg }])
    if (convIdRef.current && responseText) saveMessage(convIdRef.current, 'assistant', responseText, 'default')
  }, [isTyping, user, activeSessionExercises])

  const applyWorkoutChanges = useCallback(async (originalMsg: string) => {
    if (!user) return
    setIsTyping(true)
    const text = await callAgent(user.id, originalMsg, 'workout')
    setIsTyping(false)
    const parsed = parseAgentJSON(text)
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { exercises?: unknown }).exercises)) {
      setWorkoutUpdate(parsed as unknown as WorkoutUpdate)
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', text: 'Workout updated. Head to the Workout page to see the changes.' }])
    } else {
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', text: 'Could not parse the workout update. Try rephrasing your request.' }])
    }
  }, [user, setWorkoutUpdate])

  return { messages, input, setInput, isTyping, contextChips, sendMessage, applyWorkoutChanges }
}
