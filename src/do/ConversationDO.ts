import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { processMessage } from '../brain/claude';

/**
 * Durable Object por conversación (clave = wa_id).
 * Garantiza orden y exclusión: serializa el procesamiento de mensajes del
 * mismo contacto mediante una cadena de promesas (cola interna).
 *
 * TODO (Fase 2/3): buffer + debounce para fusionar varios mensajes seguidos
 * en un único turno de Claude; persistir resumen rolling en this.state.storage.
 */
export class ConversationDO {
  private tail: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const job = (await request.json()) as IncomingJob;

    const run = this.tail.then(() => processMessage(job, this.env, this.state));
    this.tail = run.catch(() => undefined); // no rompas la cadena ante un error

    try {
      await run;
      return new Response('ok');
    } catch (err) {
      console.error('ConversationDO process error', err);
      return new Response('error', { status: 500 });
    }
  }
}
