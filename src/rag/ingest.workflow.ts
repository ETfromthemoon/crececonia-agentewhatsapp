import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import type { Env } from '../env';
import { chunkText } from './chunk';
import { embed } from './embed';
import { fetchText } from './crawl';

export interface IngestParams {
  urls?: string[];
}

/**
 * Workflow de ingesta RAG: por cada URL → fetch → chunk → embed → upsert a Vectorize.
 * Cada paso (`step.do`) reintenta de forma independiente y es reanudable.
 * TODO: ingesta de PDFs desde R2 (R2.list → extractPdfText → chunk → embed → upsert).
 */
export class RagIngestWorkflow extends WorkflowEntrypoint<Env, IngestParams> {
  async run(event: WorkflowEvent<IngestParams>, step: WorkflowStep): Promise<void> {
    const urls = event.payload.urls ?? [];

    for (const url of urls) {
      const text = await step.do(`fetch:${url}`, async () => fetchText(url));

      const chunks = await step.do(`chunk:${url}`, async () => chunkText(text, url));

      await step.do(`embed-upsert:${url}`, async () => {
        const vectors = await embed(this.env, chunks.map((c) => c.text));
        await this.env.VECTORIZE.upsert(
          chunks.map((c, i) => ({
            id: c.id,
            values: vectors[i],
            metadata: { text: c.text, source_url: url, chunk_index: i },
          })),
        );
      });
    }
  }
}
