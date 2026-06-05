import type { Env } from '../env';
import { chunkText } from './chunk';
import { embed } from './embed';

/**
 * Ingesta directa de texto a Vectorize (chunk → embed → upsert). Útil para cargar
 * contenido manualmente (p. ej. cuando el crawl falla por 403). Devuelve nº de chunks.
 */
export async function ingestText(env: Env, source: string, text: string): Promise<number> {
  const chunks = chunkText(text, source);
  if (!chunks.length) return 0;
  const vectors = await embed(env, chunks.map((c) => c.text));
  await env.VECTORIZE.upsert(
    chunks.map((c, i) => ({
      id: c.id,
      values: vectors[i],
      metadata: { text: c.text, source_url: source, chunk_index: i },
    })),
  );
  return chunks.length;
}
