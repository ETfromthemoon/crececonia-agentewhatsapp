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

/**
 * Envía un mensaje con hasta 3 botones de respuesta rápida (WhatsApp interactive).
 * Los títulos se truncan a 20 caracteres (límite de Meta).
 */
export async function sendInteractiveButtons(
  env: Env,
  to: string,
  bodyText: string,
  buttons: { id: string; titulo: string }[],
): Promise<void> {
  const action = {
    buttons: buttons.slice(0, 3).map((b) => ({
      type: 'reply',
      reply: { id: b.id, title: b.titulo.slice(0, 20) },
    })),
  };
  await graph(env, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: { type: 'button', body: { text: bodyText }, action },
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
