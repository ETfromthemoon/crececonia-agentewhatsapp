import type Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { SYSTEM_PROMPT } from './prompt';
import { TOOLS } from './tools';
import { runTool } from './toolHandlers';
import { buildContext, persistTurn, summarizeConversation } from './memory';
import { classifyMessage } from './classify';
import { makeAnthropic } from './anthropic';
import { sendText, markRead } from '../whatsapp/client';
import { transcribeWhatsAppAudio } from '../audio/transcribe';
import { upsertLead } from '../db/leads';
import { countMessages } from '../db/conversations';
import {
  MAX_OUTPUT_TOKENS,
  MAX_TOOL_ITERATIONS,
  SUMMARY_AFTER_MESSAGES,
  SUMMARY_EVERY,
} from '../config';

/**
 * Procesa un mensaje entrante: resuelve el texto (transcribe audio si hace falta),
 * ejecuta el loop de tool-use de Claude y responde por WhatsApp. Además, en paralelo,
 * clasifica/extrae datos del lead (modelo barato) y mantiene el resumen rolling.
 * Lo invoca el ConversationDO (serializado por conversación).
 */
export async function processTurn(
  jobs: IncomingJob[],
  env: Env,
  _state: DurableObjectState,
): Promise<void> {
  if (jobs.length === 0) return;
  // El "carrier" (último mensaje del bloque) representa el turno para waId/persistencia.
  const carrier = jobs[jobs.length - 1];

  // Marca leído y resuelve+fusiona el texto de los mensajes del bloque (transcribe audios).
  const parts: string[] = [];
  for (const job of jobs) {
    await markRead(env, job.message.id).catch(() => undefined);
    const t = (await resolveUserText(job, env)).trim();
    if (t) parts.push(t);
  }
  const userText = parts.join('\n');
  if (!userText) return;

  // Clasificación/extracción en paralelo (no añade latencia a la respuesta).
  const classifyPromise = classifyMessage(env, userText).catch(() => null);

  const anthropic = makeAnthropic(env);
  const ctx = await buildContext(env, carrier, userText);
  const messages = ctx.messages;

  // Prompt caching: el system prompt es estable; el resumen va como bloque aparte.
  const system: Anthropic.TextBlockParam[] = [
    { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
  ];
  if (ctx.summary) {
    system.push({ type: 'text', text: `Resumen de la conversación con este contacto: ${ctx.summary}` });
  }

  let finalText = '';
  let dataDeleted = false;
  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const resp = await anthropic.messages.create({
      model: env.MODEL_CHAT,
      max_tokens: MAX_OUTPUT_TOKENS,
      system,
      tools: TOOLS,
      messages,
    });

    messages.push({ role: 'assistant', content: resp.content });

    if (resp.stop_reason === 'tool_use') {
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of resp.content) {
        if (block.type === 'tool_use') {
          if (block.name === 'borrar_mis_datos') dataDeleted = true;
          const out = await runTool(block.name, block.input as Record<string, any>, {
            env,
            job: carrier,
            contactId: ctx.contactId,
          });
          results.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(out),
          });
        }
      }
      messages.push({ role: 'user', content: results });
      continue;
    }

    finalText = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    break;
  }

  if (finalText) {
    await sendText(env, carrier.waId, finalText);
    // Si pidió borrar sus datos, NO repersistimos este turno (respeta el borrado).
    if (!dataDeleted) await persistTurn(env, carrier, userText, finalText, ctx);
  }

  if (dataDeleted) return;

  // Captura best-effort de datos del lead extraídos por el clasificador.
  const c = await classifyPromise;
  if (c?.lead && Object.values(c.lead).some((v) => v)) {
    await upsertLead(env, carrier.waId, {
      nombre: c.lead.nombre,
      email: c.lead.email,
      necesidad: c.lead.necesidad,
      presupuesto: c.lead.presupuesto,
      plazo: c.lead.plazo,
    }).catch(() => undefined);
  }

  // Resumen rolling cuando la conversación crece (modelo barato).
  try {
    const n = await countMessages(env, ctx.conversationId);
    if (n >= SUMMARY_AFTER_MESSAGES && n % SUMMARY_EVERY === 0) {
      await summarizeConversation(env, ctx.conversationId);
    }
  } catch {
    /* best-effort */
  }
}

async function resolveUserText(job: IncomingJob, env: Env): Promise<string> {
  if (job.message.type === 'text') return job.message.text?.body ?? '';

  if (job.message.type === 'interactive') {
    // El usuario tocó un botón / opción de lista: usamos su título como texto.
    const reply = job.message.interactive?.button_reply ?? job.message.interactive?.list_reply;
    return reply?.title ?? reply?.id ?? '';
  }

  if (job.message.type === 'audio' && job.message.audio) {
    await sendText(env, job.waId, 'Dame un segundo, escucho tu audio… 🎧').catch(() => undefined);
    return transcribeWhatsAppAudio(env, job.message.audio.id, job.waId, job.message.id);
  }

  await sendText(env, job.waId, 'De momento entiendo texto y notas de voz 🙂').catch(() => undefined);
  return '';
}
