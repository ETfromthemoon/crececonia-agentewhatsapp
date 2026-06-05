import type { IncomingJob } from './types';

/**
 * Binding mínimo de un Workflow (evita depender del tipo exacto del runtime
 * `cloudflare:workers` en tiempo de compilación del scaffold).
 */
export interface WorkflowBinding {
  create(options?: { id?: string; params?: unknown }): Promise<{ id: string }>;
}

/** Bindings y variables disponibles en el Worker (ver wrangler.toml). */
export interface Env {
  // --- Bindings ---
  CONVERSATION_DO: DurableObjectNamespace;
  DB: D1Database;
  KV: KVNamespace;
  VECTORIZE: VectorizeIndex;
  R2: R2Bucket;
  AI: Ai;
  INCOMING_QUEUE: Queue<IncomingJob>;
  RAG_INGEST: WorkflowBinding;

  // --- Vars (wrangler.toml [vars]) ---
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_GRAPH_VERSION: string;
  CF_ACCOUNT_ID: string;
  AI_GATEWAY_ID: string;
  CALCOM_EVENT_TYPE_ID: string;
  CALCOM_API_VERSION_SLOTS: string;
  CALCOM_API_VERSION_BOOKINGS: string;
  MODEL_CLASSIFY: string;
  MODEL_CHAT: string;
  ESCALATION_PROVIDER: string;

  // --- Secrets (wrangler secret put / .dev.vars) ---
  WHATSAPP_TOKEN: string;
  WHATSAPP_VERIFY_TOKEN: string;
  APP_SECRET: string;
  ANTHROPIC_API_KEY: string;
  CF_AIG_TOKEN: string;
  CALCOM_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  ADMIN_TOKEN: string;
}
