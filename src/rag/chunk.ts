export interface Chunk {
  id: string;
  text: string;
}

/**
 * Trocea texto en fragmentos con solapamiento.
 * TODO: chunking por tokens (no por caracteres) respetando límites de párrafo.
 */
export function chunkText(text: string, source = ''): Chunk[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  const size = 1500; // ~ aprox. 400-500 tokens
  const overlap = 200;
  const chunks: Chunk[] = [];

  for (let i = 0; i < clean.length; i += size - overlap) {
    const slice = clean.slice(i, i + size);
    if (!slice.trim()) continue;
    chunks.push({ id: hash(`${source}#${i}`), text: slice });
  }
  return chunks;
}

/** Hash estable (idempotencia de upsert en Vectorize). */
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}
