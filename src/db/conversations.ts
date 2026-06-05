import type { Env } from '../env';

/** Devuelve la conversación abierta del contacto; la crea si no hay. */
export async function getOrCreateConversation(
  env: Env,
  contactId: string,
): Promise<{ id: string }> {
  const existing = await env.DB.prepare(
    "SELECT id FROM conversations WHERE contact_id = ? AND status = 'open' ORDER BY created_at DESC LIMIT 1",
  )
    .bind(contactId)
    .first<{ id: string }>();
  if (existing) return existing;

  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO conversations (id, contact_id, status, created_at, updated_at) VALUES (?, ?, 'open', ?, ?)",
  )
    .bind(id, contactId, now, now)
    .run();
  return { id };
}

export interface MessageRow {
  direction: string;
  body: string | null;
}

/** Últimos N mensajes en orden cronológico ascendente. */
export async function recentMessages(
  env: Env,
  conversationId: string,
  limit: number,
): Promise<MessageRow[]> {
  const res = await env.DB.prepare(
    'SELECT direction, body FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?',
  )
    .bind(conversationId, limit)
    .all<MessageRow>();
  return (res.results ?? []).reverse();
}

/** Mensajes en orden ascendente (para construir el resumen). */
export async function getMessagesForSummary(
  env: Env,
  conversationId: string,
  limit: number,
): Promise<MessageRow[]> {
  const res = await env.DB.prepare(
    'SELECT direction, body FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?',
  )
    .bind(conversationId, limit)
    .all<MessageRow>();
  return res.results ?? [];
}

export async function countMessages(env: Env, conversationId: string): Promise<number> {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ?',
  )
    .bind(conversationId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function getConversationSummary(
  env: Env,
  conversationId: string,
): Promise<string | null> {
  const row = await env.DB.prepare('SELECT summary FROM conversations WHERE id = ?')
    .bind(conversationId)
    .first<{ summary: string | null }>();
  return row?.summary ?? null;
}

export async function setConversationSummary(
  env: Env,
  conversationId: string,
  summary: string,
): Promise<void> {
  await env.DB.prepare('UPDATE conversations SET summary = ?, updated_at = ? WHERE id = ?')
    .bind(summary, Date.now(), conversationId)
    .run();
}

export interface InsertMessageInput {
  id: string;
  conversationId: string;
  contactId: string;
  direction: 'inbound' | 'outbound';
  type: string;
  body: string | null;
  createdAt: number;
}

/** Inserta un mensaje (idempotente por id = wamid). */
export async function insertMessage(env: Env, m: InsertMessageInput): Promise<void> {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO messages (id, conversation_id, contact_id, direction, type, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(m.id, m.conversationId, m.contactId, m.direction, m.type, m.body, m.createdAt)
    .run();

  const tsField = m.direction === 'inbound' ? 'last_inbound_at' : 'last_outbound_at';
  // Un mensaje entrante reinicia el flag de recordatorio (puede volver a programarse).
  const resetFollowup = m.direction === 'inbound' ? ', followup_sent = 0' : '';
  await env.DB.prepare(
    `UPDATE conversations SET ${tsField} = ?, updated_at = ?${resetFollowup} WHERE id = ?`,
  )
    .bind(m.createdAt, m.createdAt, m.conversationId)
    .run();
}
