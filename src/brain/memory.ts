import type Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { getOrCreateContact } from '../db/leads';
import { getOrCreateConversation, recentMessages, insertMessage } from '../db/conversations';
import { HISTORY_WINDOW } from '../config';

export interface ConversationContext {
  contactId: string;
  conversationId: string;
  history: Anthropic.MessageParam[];
}

/**
 * Construye el contexto de la conversación: identifica al contacto, su conversación
 * abierta y los últimos N mensajes como historial para Claude.
 * TODO (Fase 2): incorporar el resumen rolling para no reenviar todo el historial.
 */
export async function buildContext(
  env: Env,
  job: IncomingJob,
  _userText: string,
): Promise<ConversationContext> {
  const contact = await getOrCreateContact(env, job.waId, job.contactName ?? null);
  const conversation = await getOrCreateConversation(env, contact.id);
  const rows = await recentMessages(env, conversation.id, HISTORY_WINDOW);

  const history: Anthropic.MessageParam[] = rows
    .filter((r) => (r.body ?? '').trim().length > 0)
    .map((r) => ({
      role: r.direction === 'inbound' ? 'user' : 'assistant',
      content: r.body ?? '',
    }));

  return { contactId: contact.id, conversationId: conversation.id, history };
}

/** Persiste el turno (mensaje entrante + respuesta del agente) en D1. */
export async function persistTurn(
  env: Env,
  job: IncomingJob,
  userText: string,
  assistantText: string,
  ctx: ConversationContext,
): Promise<void> {
  const now = Date.now();
  await insertMessage(env, {
    id: job.message.id,
    conversationId: ctx.conversationId,
    contactId: ctx.contactId,
    direction: 'inbound',
    type: job.message.type,
    body: userText,
    createdAt: now,
  });
  await insertMessage(env, {
    id: crypto.randomUUID(),
    conversationId: ctx.conversationId,
    contactId: ctx.contactId,
    direction: 'outbound',
    type: 'text',
    body: assistantText,
    createdAt: now + 1,
  });
}
