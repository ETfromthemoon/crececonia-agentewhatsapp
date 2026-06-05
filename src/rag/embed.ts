import type { Env } from '../env';
import { AI_MODELS } from '../config';

/** Genera embeddings con bge-m3 (1024 dim, multilingüe) vía Workers AI. */
export async function embed(env: Env, texts: string[]): Promise<number[][]> {
  const ai = env.AI as unknown as {
    run: (model: string, input: unknown) => Promise<{ data?: number[][] }>;
  };
  const res = await ai.run(AI_MODELS.embeddings, { text: texts });
  return res.data ?? [];
}
