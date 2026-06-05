import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { retrieve } from '../rag/retrieve';
import { upsertLead, qualifyLead, setHumanHandoff } from '../db/leads';
import { getSlots, createBooking } from '../calcom/client';
import { insertBooking } from '../db/bookings';
import { notifyEscalation } from '../notify/escalate';
import { DEFAULT_TIMEZONE } from '../config';

export interface ToolContext {
  env: Env;
  job: IncomingJob;
  contactId?: string;
}

/** Despacha y ejecuta una tool solicitada por Claude. Devuelve JSON-serializable. */
export async function runTool(
  name: string,
  input: Record<string, any>,
  ctx: ToolContext,
): Promise<unknown> {
  const { env, job } = ctx;

  switch (name) {
    case 'buscar_conocimiento': {
      const fragmentos = await retrieve(env, String(input.consulta ?? ''), Number(input.top_k ?? 5));
      return { fragmentos, encontrado: fragmentos.length > 0 };
    }

    case 'guardar_lead': {
      const contactId = await upsertLead(env, job.waId, input);
      return { ok: true, contact_id: contactId };
    }

    case 'calificar_lead': {
      await qualifyLead(env, job.waId, Number(input.score ?? 0), String(input.estado ?? 'new'));
      return { ok: true };
    }

    case 'consultar_disponibilidad_calcom': {
      const slots = await getSlots(
        env,
        String(input.desde),
        String(input.hasta),
        String(input.timeZone ?? DEFAULT_TIMEZONE),
      );
      return { slots: slots.slice(0, 6) };
    }

    case 'crear_reserva_calcom': {
      const booking = await createBooking(env, input);
      await insertBooking(env, job.waId, booking).catch(() => undefined);
      return { ok: true, ...booking };
    }

    case 'enviar_recurso': {
      // TODO: catálogo real de recursos (tabla en D1 o config). Stub de momento.
      return { ok: true, recurso_id: input.recurso_id, titulo: '', url: '' };
    }

    case 'escalar_a_humano': {
      await notifyEscalation(env, job, String(input.motivo ?? ''), String(input.resumen ?? ''));
      await setHumanHandoff(env, job.waId, 1).catch(() => undefined);
      return { ok: true };
    }

    default:
      return { ok: false, error: `tool desconocida: ${name}` };
  }
}
