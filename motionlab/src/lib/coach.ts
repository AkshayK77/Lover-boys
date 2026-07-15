import { supabase } from './supabase'

// Persistence-lite chat: one rolling conversation per user, messages saved to
// coach_messages. Drawer + full page share the same conversation so a chat
// survives navigation and reloads.

export interface StoredMessage { role: 'user' | 'assistant'; content: string; mode?: string | null }

export async function getOrCreateConversation(userId: string): Promise<string | null> {
  const { data } = await supabase.from('coach_conversations').select('id').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle()
  if ((data as { id: string } | null)?.id) return (data as { id: string }).id
  const { data: created, error } = await (supabase.from('coach_conversations') as any).insert({ user_id: userId, title: 'Coach chat' }).select('id').single()
  if (error) return null
  return (created as { id: string }).id
}

export async function loadRecentMessages(conversationId: string, limit = 20): Promise<StoredMessage[]> {
  const { data } = await supabase.from('coach_messages').select('role, content, mode').eq('conversation_id', conversationId).order('created_at', { ascending: false }).limit(limit)
  return ((data as StoredMessage[] | null) || []).reverse()
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string, mode: string | null = 'default'): Promise<void> {
  if (!content) return
  await (supabase.from('coach_messages') as any).insert({ conversation_id: conversationId, role, content, mode })
  await (supabase.from('coach_conversations') as any).update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
}
