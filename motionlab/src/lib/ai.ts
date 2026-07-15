import { supabase } from './supabase'
import { buildAgentContext } from './agentContext'
import { showGlobalToast } from './globalToast'
import type { AgentContext } from './agentContext'

// Client wrapper around the `ai-proxy` Supabase Edge Function, which proxies
// to Groq (llama-3.3-70b-versatile) server-side so GROQ_API_KEY is never in the
// client bundle. Ported from KavaFit's gemini.ts (the "gemini" name there was a
// misnomer — it has always been Groq).

const MODEL = 'llama-3.3-70b-versatile'

// Send a prompt and parse the model's reply as JSON. Throws on transport error,
// empty content, or unparseable output.
export async function callAI(prompt: string): Promise<Record<string, unknown>> {
  const jsonOnlySuffix = 'Return only valid JSON. No markdown, no backticks, no explanation, no text before or after the JSON object.'
  const finalPrompt = `${prompt.trim()}\n\n${jsonOnlySuffix}`

  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      messages: [{ role: 'user', content: finalPrompt }],
      model: MODEL,
      temperature: 0.7,
    },
  })

  if (error) throw new Error(error.message)

  const text = (data as { content?: string } | null)?.content
  if (!text) throw new Error('AI returned no content')

  const cleaned = text.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    console.error('AI returned non-JSON:', text)
    throw new Error('AI response was not valid JSON. Check the console for the raw response.')
  }
}

// Free-form text completion (no JSON constraint). Used for the warm-up card and
// future coach chat. Returns the raw model text.
export async function callAIText(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: { role: string; content: string }[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: { messages, model: MODEL, temperature: 0.7 },
  })
  if (error) throw new Error(error.message)
  const text = (data as { content?: string } | null)?.content
  if (!text) throw new Error('AI returned no content')
  return text
}

export type AgentMode = 'default' | 'flags' | 'recipe' | 'workout' | 'warmup' | 'grocery'

export function parseAgentJSON(text: string | null): unknown {
  if (!text) return null
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function buildSystemPrompt(ctx: AgentContext, mode: AgentMode | null): string {
  const { profile, recentSessions, weeklyVolume, todayNutrition, todayDay, sportSchedule, learning, deload } = ctx
  let prompt = `You are the MotionLab AI coach, built into a sports-science + training app. You have this user's data below. Always respond specifically using their data — never generic advice. Be direct, practical, and concise.

USER PROFILE:
${JSON.stringify(profile, null, 2)}

THIS WEEK'S TRAINING VOLUME:
${JSON.stringify(weeklyVolume, null, 2)}

RECENT SESSIONS:
${JSON.stringify(recentSessions, null, 2)}

TODAY'S NUTRITION:
Calories: ${todayNutrition.calories}${todayNutrition.calorieTarget ? ' / ' + todayNutrition.calorieTarget : ''}
Protein: ${todayNutrition.protein}g${todayNutrition.proteinTarget ? ' / ' + todayNutrition.proteinTarget + 'g' : ''}

TODAY'S SCHEDULED WORKOUT:
${todayDay ? `${todayDay.dayName}: ${todayDay.exercises.join(', ') || 'No exercises listed'}` : 'Rest day'}

SPORT SCHEDULE THIS WEEK:
${sportSchedule.length ? sportSchedule.map(s => `${s.sport} on ${s.day}${s.time ? ' at ' + s.time : ''}`).join('; ') : 'No sport sessions scheduled'}

LEARNING PROGRESS:
${learning.completedLessons} lessons completed${learning.recentLessons.length ? ' (recent: ' + learning.recentLessons.join(', ') + ')' : ''}

DELOAD STATUS:
${deload.deloadDue ? `Deload due — ${deload.weeksCount} consecutive weeks of hitting the training target` : `${deload.weeksCount} consecutive on-target weeks (deload not yet due)`}`

  if (mode === 'warmup') {
    prompt += '\n\nReturn only a JSON array of exactly 5 warm-up exercises: [{"exercise": "string", "sets": number, "reps": "string", "notes": "string"}]. No other text.'
  } else if (mode === 'workout') {
    prompt += '\n\nReturn only a JSON object: {"sessionName": "string", "exercises": [{"exerciseName": "string", "sets": 3, "repRange": "8-12"}]}. Use realistic exercises for this user. No other text.'
  } else if (mode === 'recipe') {
    prompt += '\n\nReturn only a JSON object with fields: recipeName (string), ingredients (array of {item: string, quantity: string}), steps (array of strings), proteinG (number), carbsG (number), fatG (number), calories (number). No other text.'
  } else if (mode === 'grocery') {
    prompt += '\n\nReturn only a JSON object with exactly these keys: Proteins, Carbs, Vegetables, Fats, Other — each an array of item strings. No other text.'
  } else if (mode === 'flags') {
    prompt += `\n\nGenerate 1-3 short, specific coaching insights from this data. Consider: undertrained or overloaded muscle groups, training consistency, whether a deload is due, nutrition vs targets, upcoming sport sessions (suggest a sport-specific warmup the day before), injury history (${profile?.injuries || 'none noted'}), and learning progress. Return only a JSON array: [{"message": string, "severity": "info"|"warning"|"success"}]. Return only the JSON array, no other text.`
  }
  return prompt
}

export interface HistoryMessage { role: 'user' | 'assistant'; content: string }

// Full-context coach call. `history` is prior turns (excluding the new message).
// Returns model text (or null in special modes on error).
export async function callAgent(userId: string, userMessage: string | null, mode: AgentMode | null = null, history: HistoryMessage[] = []): Promise<string | null> {
  try {
    const ctx = await buildAgentContext(userId)
    const systemPrompt = buildSystemPrompt(ctx, mode)
    const prompt = userMessage || 'Analyse my current training and give key insights.'
    const priorTurns = history.filter(m => m.content).slice(-10)

    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        messages: [{ role: 'system', content: systemPrompt }, ...priorTurns, { role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.7,
      },
    })

    if (error) {
      const status = (error as { context?: { status?: number } })?.context?.status
      if (status === 429) {
        showGlobalToast("You're sending messages too fast. Please wait a moment.", 'warning')
        return null
      }
      throw error
    }
    return (data as { content?: string } | null)?.content || ''
  } catch (err) {
    console.error('AI agent error:', err)
    if (mode) return null
    return "I couldn't connect right now. Please try again."
  }
}
