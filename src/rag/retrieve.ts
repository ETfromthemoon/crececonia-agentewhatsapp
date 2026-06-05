import type { Env } from '../env';
import { embed } from './embed';
import { RAG_TOP_K, RAG_MIN_SCORE } from '../config';

export interface KnowledgeChunk {
  texto: string;
  fuente_url: string;
  score: number;
}

/** Recupera fragmentos relevantes de la base de conocimiento (Vectorize). */
export async function retrieve(
  env: Env,
  query: string,
  topK = RAG_TOP_K,
): Promise<KnowledgeChunk[]> {
  const [vector] = await embed(env, [query]);
  if (!vector) return [];

  const res = await env.VECTORIZE.query(vector, { topK, returnMetadata: true });

  return res.matches
    .map((m) => ({
      texto: String((m.metadata?.text as string | undefined) ?? ''),
      fuente_url: String((m.metadata?.source_url as string | undefined) ?? ''),
      score: m.score ?? 0,
    }))
    .filter((c) => c.score >= RAG_MIN_SCORE && c.texto.length > 0);
}
