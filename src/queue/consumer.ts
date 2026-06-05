import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { alreadyProcessed, markProcessed } from '../lib/kv';
import { checkRateLimit } from '../lib/ratelimit';

/**
 * Consumidor de la Queue `whatsapp-incoming`.
 * Deduplica por message.id y delega el procesamiento al Durable Object
 * de la conversación (orden/exclusión por `wa_id`).
 */
export async function handleQueueBatch(
  batch: MessageBatch<IncomingJob>,
  env: Env,
  _ctx: ExecutionContext,
): Promise<void> {
  for (const msg of batch.messages) {
    const job = msg.body;
    try {
      if (await alreadyProcessed(env, job.message.id)) {
        msg.ack();
        continue;
      }

      // Protección anti-abuso/coste: por encima del límite, descarta el mensaje.
      if (!(await checkRateLimit(env, job.waId))) {
        await markProcessed(env, job.message.id);
        msg.ack();
        continue;
      }

      const id = env.CONVERSATION_DO.idFromName(job.waId);
      const stub = env.CONVERSATION_DO.get(id);
      const res = await stub.fetch('https://do/process', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(job),
      });

      if (res.ok) {
        await markProcessed(env, job.message.id);
        msg.ack();
      } else {
        msg.retry();
      }
    } catch (err) {
      console.error('queue consumer error', err);
      msg.retry();
    }
  }
}
