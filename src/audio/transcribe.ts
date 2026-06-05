import type { Env } from '../env';
import { downloadWhatsAppMedia } from '../whatsapp/media';
import { AI_MODELS } from '../config';

/**
 * Descarga la nota de voz, la guarda en R2 y la transcribe con Whisper (Workers AI).
 * Las notas de voz de WhatsApp llegan en OGG/Opus.
 * TODO (audios largos): aplicar el patrón de chunking de audio de Cloudflare.
 */
export async function transcribeWhatsAppAudio(
  env: Env,
  mediaId: string,
  waId: string,
  msgId: string,
): Promise<string> {
  const { data } = await downloadWhatsAppMedia(env, mediaId);

  // Guarda el original (best-effort).
  await env.R2.put(`audios/${waId}/${msgId}.ogg`, data).catch(() => undefined);

  // `env.AI.run` se tipa por modelo; casteamos para no acoplarnos a la versión de tipos.
  const ai = env.AI as unknown as {
    run: (model: string, input: unknown) => Promise<{ text?: string }>;
  };
  const result = await ai.run(AI_MODELS.whisper, {
    audio: [...new Uint8Array(data)],
  });
  return result.text ?? '';
}
