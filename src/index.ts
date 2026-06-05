import type { Env } from './env';
import type { IncomingJob } from './types';
import { handleFetch } from './http/router';
import { handleQueueBatch } from './queue/consumer';
import { runFollowups } from './followup/followup';

// Durable Object y Workflow deben exportarse desde el entry del Worker.
export { ConversationDO } from './do/ConversationDO';
export { RagIngestWorkflow } from './rag/ingest.workflow';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleFetch(request, env, ctx);
  },

  async queue(batch: MessageBatch<IncomingJob>, env: Env, ctx: ExecutionContext): Promise<void> {
    return handleQueueBatch(batch, env, ctx);
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // Recordatorio suave (1 vez) a leads en visto, dentro de la ventana de 24h.
    ctx.waitUntil(runFollowups(env));
    // TODO (Fase 2/3): resúmenes rolling, limpieza de KV, nurture fuera de 24h (plantillas).
  },
} satisfies ExportedHandler<Env, IncomingJob>;
