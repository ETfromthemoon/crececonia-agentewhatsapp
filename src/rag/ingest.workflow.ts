import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import type { Env } from '../env';
import { chunkText } from './chunk';
import { embed } from './embed';
import { fetchText } from './crawl';
import { extractPdfText } from './pdf';
import { KNOWLEDGE_SOURCES } from './sources';

export interface IngestParams {
  urls?: string[];
  texts?: { source: string; text: string }[];
}

/**
 * Workflow de ingesta RAG (largo y reanudable): URLs (crawl) + textos directos + PDFs en R2
 * (prefijo `kb/`) → chunk → embed (bge-m3) → upsert a Vectorize. Cada paso reintenta solo.
 */
export class RagIngestWorkflow extends WorkflowEntrypoint<Env, IngestParams> {
  async run(event: WorkflowEvent<IngestParams>, step: WorkflowStep): Promise<void> {
    const urls = event.payload.urls ?? KNOWLEDGE_SOURCES.urls;

    for (const url of urls) {
      const text = await step.do(`fetch:${url}`, async () => fetchText(url));
      await this.indexText(step, url, text);
    }

    for (const t of event.payload.texts ?? []) {
      await this.indexText(step, t.source, t.text);
    }

    // PDFs subidos a R2 bajo el prefijo kb/
    const pdfKeys = await step.do('list-r2-pdfs', async () => {
      const listed = await this.env.R2.list({ prefix: 'kb/' });
      return listed.objects.map((o) => o.key).filter((k) => k.toLowerCase().endsWith('.pdf'));
    });
    for (const key of pdfKeys) {
      const text = await step.do(`pdf:${key}`, async () => {
        const obj = await this.env.R2.get(key);
        return obj ? extractPdfText(await obj.arrayBuffer()) : '';
      });
      await this.indexText(step, key, text);
    }
  }

  private async indexText(step: WorkflowStep, source: string, text: string): Promise<void> {
    if (!text.trim()) return;
    await step.do(`index:${source}`, async () => {
      const chunks = chunkText(text, source);
      if (!chunks.length) return;
      const vectors = await embed(this.env, chunks.map((c) => c.text));
      await this.env.VECTORIZE.upsert(
        chunks.map((c, i) => ({
          id: c.id,
          values: vectors[i],
          metadata: { text: c.text, source_url: source, chunk_index: i },
        })),
      );
    });
  }
}
