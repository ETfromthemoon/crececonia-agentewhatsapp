import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { SYSTEM_PROMPT } from './prompt';
import { TOOLS } from './tools';
import { runTool } from './toolHandlers';
import { buildContext, persistTurn } from './memory';
import { sendText, markRead } from '../whatsapp/client';
import { transcribeWhatsAppAudio } from '../audio/transcribe';
import { MAX_OUTPUT_TOKENS, MAX_TOOL_ITERATIONS, anthropicGatewayBaseURL } from '../config';

/**
 * Procesa un mensaje entrante: resuelve el texto (transcribe audio si hace falta),
 * ejecuta el loop de tool-use de Claude y responde por WhatsApp.
 * Lo invoca el ConversationDO (serializado por conversación).
 */
export async function processMessage(
  job: IncomingJob,
  env: Env,
  _state: DurableObjectState,
): Promise<void> {
  await markRead(env, job.message.id).catch(() => undefined);

  const userText = await resolveUserText(job, env);
  if (!userText.trim()) return;

  const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: anthropicGatewayBaseURL(env.CF_ACCOUNT_ID, env.AI_GATEWAY_ID),
    defaultHeaders: env.CF_AIG_TOKEN
      ? { 'cf-aig-authorization': `Bearer ${env.CF_AIG_TOKEN}` }
      : undefined,
  });

  const ctx = await buildContext(env, job, userText);
  const messages: Anthropic.MessageParam[] = [
    ...ctx.history,
    { role: 'user', content: userText },
  ];

  let finalText = '';
  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const resp = await anthropic.messages.create({
      model: env.MODEL_CHAT,
      max_tokens: MAX_OUTPUT_TOKENS,
      // Prompt caching: system + tools son estables entre turnos.
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: TOOLS,
      messages,
    });

    messages.push({ role: 'assistant', content: resp.content });

    if (resp.stop_reason === 'tool_use') {
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of resp.content) {
        if (block.type === 'tool_use') {
          const out = await runTool(block.name, block.input as Record<string, any>, {
            env,
            job,
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
    await sendText(env, job.waId, finalText);
    await persistTurn(env, job, userText, finalText, ctx);
  }
}

async function resolveUserText(job: IncomingJob, env: Env): Promise<string> {
  if (job.message.type === 'text') return job.message.text?.body ?? '';

  if (job.message.type === 'audio' && job.message.audio) {
    await sendText(env, job.waId, 'Dame un segundo, escucho tu audio… 🎧').catch(() => undefined);
    return transcribeWhatsAppAudio(env, job.message.audio.id, job.waId, job.message.id);
  }

  await sendText(env, job.waId, 'De momento entiendo texto y notas de voz 🙂').catch(() => undefined);
  return '';
}
