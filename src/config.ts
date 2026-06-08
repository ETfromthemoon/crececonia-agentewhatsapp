/** Constantes de comportamiento del agente (ajustables durante el afinado). */

export const MAX_TOOL_ITERATIONS = 5; // límite del loop de tool-use de Claude
export const MAX_OUTPUT_TOKENS = 1024;
export const HISTORY_WINDOW = 12; // nº de mensajes recientes que entran al contexto
export const RAG_TOP_K = 5;
export const RAG_MIN_SCORE = 0.3;
export const DEDUPE_TTL_SECONDS = 60 * 60 * 24; // 24h
export const RATE_LIMIT_PER_MINUTE = 20;
export const DEFAULT_TIMEZONE = 'America/Santiago'; // Crececonia es de Chile
export const CALL_DURATION_MIN = 30; // duración de la llamada de diagnóstico (Cal.com)
export const FOLLOWUP_AFTER_HOURS = 20; // recordatorio suave si no responden (dentro de 24h)
export const SERVICE_WINDOW_HOURS = 24; // ventana de servicio de WhatsApp (free-form)
export const SUMMARY_AFTER_MESSAGES = 24; // empezar a resumir cuando la conversación crece
export const SUMMARY_EVERY = 10; // re-resumir cada N mensajes
export const DEBOUNCE_MS = 4000; // ventana para fusionar mensajes seguidos en un turno (DO)

/**
 * Rango de precio ORIENTATIVO para cuando el cliente insiste tras reencuadrar (Ronda 7).
 * Nia solo lo usa si insisten; aclara que el precio final depende del caso y propone la llamada.
 * Déjalo en '' si prefieres no dar nunca cifras por chat.
 * TODO Sergio: pon el rango real, p. ej. 'los proyectos parten desde $X CLP'.
 */
export const PRICE_RANGE_HINT = '';

/** Datos de marca (Crececonia). */
export const BRAND = {
  name: 'Crececonia',
  agentName: 'Nia',
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
