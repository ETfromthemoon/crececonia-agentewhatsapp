import type { Env } from '../env';

/** Envía un mensaje de texto (free-form, dentro de la ventana de 24h). */
export async function sendText(env: Env, to: string, body: string): Promise<void> {
  await graph(env, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body, preview_url: true },
  });
}

/** Marca un mensaje entrante como leído (mejora UX y feedback al usuario). */
export async function markRead(env: Env, messageId: string): Promise<void> {
  await graph(env, {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  });
}

/**
 * Envía una plantilla aprobada (necesaria FUERA de la ventana de 24h).
 * TODO (Fase 3): parámetros/componentes de plantilla + consentimiento.
 */
export async function sendTemplate(
  env: Env,
  to: string,
  templateName: string,
  languageCode = 'es',
): Promise<void> {
  await graph(env, {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: { name: templateName, language: { code: languageCode } },
  });
}

async function graph(env: Env, payload: unknown): Promise<void> {
  const url = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error('WhatsApp Graph send failed', res.status, await res.text());
  }
}
