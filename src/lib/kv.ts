import type { Env } from '../env';
import { DEDUPE_TTL_SECONDS } from '../config';

/** ¿Ya se procesó este message.id? (dedupe de reintentos de Meta). */
export async function alreadyProcessed(env: Env, messageId: string): Promise<boolean> {
  return (await env.KV.get(`msg:${messageId}`)) !== null;
}

/** Marca un message.id como procesado (TTL 24h). */
export async function markProcessed(env: Env, messageId: string): Promise<void> {
  await env.KV.put(`msg:${messageId}`, '1', { expirationTtl: DEDUPE_TTL_SECONDS });
}
