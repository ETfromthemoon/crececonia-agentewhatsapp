import type { Env } from '../env';
import type { IncomingJob } from '../types';
import type { WhatsAppWebhookBody } from '../whatsapp/types';
import { verifySignature } from '../whatsapp/verify';

/**
 * GET /webhook — verificación del webhook por parte de Meta.
 * Responde `hub.challenge` si el verify token coincide.
 */
export async function handleWebhookGet(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

/**
 * POST /webhook — recepción de eventos.
 * 1) verifica la firma sobre el raw body, 2) responde 200 de inmediato,
 * 3) encola el trabajo pesado (procesamiento con Claude) en la Queue.
 */
export async function handleWebhookPost(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const raw = await request.arrayBuffer();
  const signature = request.headers.get('x-hub-signature-256');

  const valid = await verifySignature(raw, signature, env.APP_SECRET);
  if (!valid) return new Response('Invalid signature', { status: 401 });

  // Acuse rápido + procesamiento diferido (evita timeouts/reintentos de Meta).
  ctx.waitUntil(enqueueMessages(raw, env));
  return new Response('EVENT_RECEIVED', { status: 200 });
}

async function enqueueMessages(raw: ArrayBuffer, env: Env): Promise<void> {
  let body: WhatsAppWebhookBody;
  try {
    body = JSON.parse(new TextDecoder().decode(raw)) as WhatsAppWebhookBody;
  } catch {
    return;
  }

  const jobs: IncomingJob[] = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue; // ignora 'statuses' y otros eventos
      const contactName = value.contacts?.[0]?.profile?.name;
      for (const message of value.messages) {
        jobs.push({
          receivedAt: Date.now(),
          phoneNumberId: value.metadata.phone_number_id,
          contactName,
          waId: message.from,
          message,
        });
      }
    }
  }

  if (jobs.length) {
    await env.INCOMING_QUEUE.sendBatch(jobs.map((body) => ({ body })));
  }
}
