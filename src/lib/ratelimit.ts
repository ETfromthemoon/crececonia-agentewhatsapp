import type { Env } from '../env';
import { RATE_LIMIT_PER_MINUTE } from '../config';

/**
 * Rate limit sencillo por contacto y minuto (ventana fija en KV).
 * Devuelve `true` si se permite, `false` si se supera el límite.
 * TODO (Fase 2): cablear en el consumidor de la Queue.
 */
export async function checkRateLimit(env: Env, waId: string): Promise<boolean> {
  const key = `rl:${waId}:${Math.floor(Date.now() / 60_000)}`;
  const current = Number((await env.KV.get(key)) ?? '0');
  if (current >= RATE_LIMIT_PER_MINUTE) return false;
  await env.KV.put(key, String(current + 1), { expirationTtl: 120 });
  return true;
}
