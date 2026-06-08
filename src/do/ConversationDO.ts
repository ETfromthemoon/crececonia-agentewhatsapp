import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { processTurn } from '../brain/claude';
import { DEBOUNCE_MS } from '../config';

/**
 * Durable Object por conversación (clave = wa_id).
 *
 * Fusiona los mensajes que llegan seguidos en UN solo turno de Claude (buffer + debounce):
 * cada mensaje se acumula en `state.storage` y se (re)programa un alarm a DEBOUNCE_MS; cuando
 * deja de llegar texto durante esa ventana, el alarm procesa todo el bloque de una vez. Esto
 * da respuestas más coherentes, más baratas y más humanas, y el acuse al consumidor de la
 * Queue es inmediato (el mensaje queda guardado de forma durable).
 */
export class ConversationDO {
  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const job = (await request.json()) as IncomingJob;

    // Acumula el mensaje y (re)programa el alarm: si llegan más, se fusionan.
    await this.state.storage.put(`buf:${job.message.id}`, job);
    await this.state.storage.setAlarm(Date.now() + DEBOUNCE_MS);

    return new Response('buffered');
  }

  async alarm(): Promise<void> {
    // Toma y vacía el buffer de forma atómica (sin entregas concurrentes en medio).
    let jobs: IncomingJob[] = [];
    await this.state.blockConcurrencyWhile(async () => {
      const map = await this.state.storage.list<IncomingJob>({ prefix: 'buf:' });
      jobs = [...map.values()];
      if (map.size > 0) await this.state.storage.delete([...map.keys()]);
    });
    if (jobs.length === 0) return;

    // Orden estable por hora de recepción del mensaje (timestamp de WhatsApp).
    jobs.sort((a, b) => Number(a.message.timestamp ?? 0) - Number(b.message.timestamp ?? 0));

    try {
      await processTurn(jobs, this.env, this.state);
      await this.state.storage.delete('retries');
    } catch (err) {
      console.error('ConversationDO alarm process error', err);
      // Reintenta el bloque con backoff (hasta 2 veces); la Queue ya hizo ack.
      const retries = ((await this.state.storage.get<number>('retries')) ?? 0) + 1;
      if (retries <= 2) {
        await this.state.blockConcurrencyWhile(async () => {
          for (const job of jobs) await this.state.storage.put(`buf:${job.message.id}`, job);
          await this.state.storage.put('retries', retries);
        });
        await this.state.storage.setAlarm(Date.now() + 10_000 * retries);
      }
    }
  }
}
