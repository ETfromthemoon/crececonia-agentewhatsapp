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
