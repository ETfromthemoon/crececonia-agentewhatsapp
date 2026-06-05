/** Constantes de comportamiento del agente (ajustables durante el afinado). */

export const MAX_TOOL_ITERATIONS = 5; // límite del loop de tool-use de Claude
export const MAX_OUTPUT_TOKENS = 1024;
export const HISTORY_WINDOW = 12; // nº de mensajes recientes que entran al contexto
export const RAG_TOP_K = 5;
export const RAG_MIN_SCORE = 0.3;
export const DEDUPE_TTL_SECONDS = 60 * 60 * 24; // 24h
export const RATE_LIMIT_PER_MINUTE = 20;
export const DEFAULT_TIMEZONE = 'America/Santiago'; // Crececonia es de Chile

/** Datos de marca (Crececonia). */
export const BRAND = {
  name: 'Crececonia',
  website: 'https://www.crececonia.cl',
  instagram: '@crececoniacl',
} as const;

/** Modelos de Workers AI (Cloudflare). */
export const AI_MODELS = {
  whisper: '@cf/openai/whisper-large-v3-turbo',
  embeddings: '@cf/baai/bge-m3',
} as const;

/** Construye la baseURL de Anthropic a través de Cloudflare AI Gateway. */
export function anthropicGatewayBaseURL(accountId: string, gatewayId: string): string {
  return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/anthropic`;
}
