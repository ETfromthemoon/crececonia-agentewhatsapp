import type { Env } from './env';
import type { IncomingJob } from './types';
import { handleFetch } from './http/router';
import { handleQueueBatch } from './queue/consumer';

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

  async scheduled(_event: ScheduledController, _env: Env, _ctx: ExecutionContext): Promise<void> {
    // TODO (Fase 2/3): resúmenes rolling, limpieza de KV, follow-ups programados (nurture).
  },
} satisfies ExportedHandler<Env, IncomingJob>;
