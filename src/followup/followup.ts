import type { Env } from '../env';
import { sendText } from '../whatsapp/client';
import { FOLLOWUP_AFTER_HOURS, SERVICE_WINDOW_HOURS } from '../config';

const REMINDER = '¡Hola de nuevo! 👋 ¿Quedaste con alguna duda o te ayudo en algo más? Aquí estoy 🙂';

/**
 * Recordatorio suave (1 sola vez) para conversaciones donde Nia habló último, el
 * contacto no respondió, seguimos dentro de la ventana de 24h y no está escalado.
 * Lo invoca scheduled() (cron). Free-form dentro de 24h ⇒ coste 0.
 */
export async function runFollowups(env: Env): Promise<void> {
  const now = Date.now();
  const olderThan = now - FOLLOWUP_AFTER_HOURS * 3_600_000;
  const windowStart = now - SERVICE_WINDOW_HOURS * 3_600_000;

  const res = await env.DB.prepare(
    `SELECT c.id AS conversation_id, ct.wa_id AS wa_id
       FROM conversations c
       JOIN contacts ct ON ct.id = c.contact_id
      WHERE c.status = 'open'
        AND ct.human_handoff = 0
        AND c.followup_sent = 0
        AND c.last_outbound_at IS NOT NULL
        AND c.last_outbound_at <= ?
        AND c.last_outbound_at >= ?
        AND (c.last_inbound_at IS NULL OR c.last_inbound_at < c.last_outbound_at)
      LIMIT 50`,
  )
    .bind(olderThan, windowStart)
    .all<{ conversation_id: string; wa_id: string }>();

  for (const row of res.results ?? []) {
    await sendText(env, row.wa_id, REMINDER).catch(() => undefined);
    await env.DB.prepare(
      'UPDATE conversations SET followup_sent = 1, updated_at = ? WHERE id = ?',
    )
      .bind(now, row.conversation_id)
      .run();
  }
}
