import type Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { getOrCreateContact } from '../db/leads';
import {
  getOrCreateConversation,
  recentMessages,
  insertMessage,
  getConversationSummary,
  setConversationSummary,
  getMessagesForSummary,
  type MessageRow,
} from '../db/conversations';
import { makeAnthropic } from './anthropic';
import { HISTORY_WINDOW } from '../config';

export interface ConversationContext {
  contactId: string;
  conversationId: string;
  summary: string | null;
  messages: Anthropic.MessageParam[];
}

/**
 * Contexto de la conversación: contacto, conversación abierta, resumen rolling y los
 * últimos mensajes ya normalizados (alternando roles e incluyendo el mensaje actual).
 */
export async function buildContext(
  env: Env,
  job: IncomingJob,
  userText: string,
): Promise<ConversationContext> {
  const contact = await getOrCreateContact(env, job.waId, job.contactName ?? null);
  const conversation = await getOrCreateConversation(env, contact.id);
  const [rows, summary] = await Promise.all([
    recentMessages(env, conversation.id, HISTORY_WINDOW),
    getConversationSummary(env, conversation.id),
  ]);
  return {
    contactId: contact.id,
    conversationId: conversation.id,
    summary,
    messages: toMessages(rows, userText),
  };
}

/** Normaliza a un historial válido para Anthropic: empieza en user y alterna roles. */
function toMessages(rows: MessageRow[], currentUserText: string): Anthropic.MessageParam[] {
  const raw: Anthropic.MessageParam[] = rows
    .filter((r) => (r.body ?? '').trim().length > 0)
    .map((r) => ({ role: r.direction === 'inbound' ? 'user' : 'assistant', content: r.body ?? '' }));
  raw.push({ role: 'user', content: currentUserText });

  while (raw.length && raw[0].role === 'assistant') raw.shift();

  const merged: Anthropic.MessageParam[] = [];
  for (const m of raw) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content = `${last.content as string}\n${m.content as string}`;
    } else {
      merged.push({ role: m.role, content: m.content });
    }
  }
  return merged;
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

/** Resume la conversación (modelo barato) y guarda el resumen en D1. */
export async function summarizeConversation(env: Env, conversationId: string): Promise<void> {
  const rows = await getMessagesForSummary(env, conversationId, 60);
  if (rows.length < 6) return;

  const transcript = rows
    .map((r) => `${r.direction === 'inbound' ? 'Cliente' : 'Nia'}: ${r.body ?? ''}`)
    .join('\n');

  const anthropic = makeAnthropic(env);
  const resp = await anthropic.messages.create({
    model: env.MODEL_CLASSIFY,
    max_tokens: 256,
    system:
      'Resume esta conversación de WhatsApp en 3-5 frases: necesidad del contacto, estado del ' +
      'lead, acuerdos y próximos pasos. Español, conciso.',
    messages: [{ role: 'user', content: transcript }],
  });

  const block = resp.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (block?.text) await setConversationSummary(env, conversationId, block.text.trim());
}
