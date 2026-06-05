import type { Env } from '../env';

/**
 * Descarga media de WhatsApp en 2 pasos:
 *  1) GET /{media_id} → devuelve una URL temporal (host lookaside, caduca ~5 min)
 *  2) GET de esa URL con el mismo Bearer → binario.
 */
export async function downloadWhatsAppMedia(
  env: Env,
  mediaId: string,
): Promise<{ data: ArrayBuffer; mime: string }> {
  const metaRes = await fetch(
    `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${mediaId}`,
    { headers: { authorization: `Bearer ${env.WHATSAPP_TOKEN}` } },
  );
  if (!metaRes.ok) {
    throw new Error(`media meta fetch failed: ${metaRes.status}`);
  }
  const meta = (await metaRes.json()) as { url: string; mime_type: string };

  const binRes = await fetch(meta.url, {
    headers: { authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
  });
  if (!binRes.ok) {
    throw new Error(`media binary fetch failed: ${binRes.status}`);
  }

  return { data: await binRes.arrayBuffer(), mime: meta.mime_type };
}
