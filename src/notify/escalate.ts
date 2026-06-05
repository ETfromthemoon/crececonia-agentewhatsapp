import type { Env } from '../env';
import type { IncomingJob } from '../types';

/**
 * Notifica a Sergio un escalado a humano (resumen + datos para retomar).
 * Proveedor configurable por ESCALATION_PROVIDER (telegram | slack).
 */
export async function notifyEscalation(
  env: Env,
  job: IncomingJob,
  motivo: string,
  resumen: string,
): Promise<void> {
  const text =
    `🚨 Escalado a humano\n` +
    `Contacto: ${job.contactName ?? job.waId} (${job.waId})\n` +
    `Motivo: ${motivo}\n\n` +
    `${resumen}\n\n` +
    `Responde desde WhatsApp Business para retomar la conversación.`;

  if (env.ESCALATION_PROVIDER === 'telegram') {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    }).catch((err) => console.error('telegram notify failed', err));
    return;
  }

  // TODO: soporte Slack (usar un SLACK_WEBHOOK_URL como secret).
  console.warn('ESCALATION_PROVIDER no soportado todavía:', env.ESCALATION_PROVIDER);
}
