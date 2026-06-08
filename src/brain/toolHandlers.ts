import type { Env } from '../env';
import type { IncomingJob } from '../types';
import { retrieve } from '../rag/retrieve';
import { upsertLead, qualifyLead, setHumanHandoff, deleteContactData } from '../db/leads';
import { getSlots, createBooking, rescheduleBooking, cancelBooking } from '../calcom/client';
import {
  insertBooking,
  getActiveBooking,
  updateBookingAfterReschedule,
  cancelBookingRow,
} from '../db/bookings';
import { notifyEscalation } from '../notify/escalate';
import { sendInteractiveButtons } from '../whatsapp/client';
import { getResource } from '../resources';
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

    case 'reprogramar_reserva_calcom': {
      const active = await getActiveBooking(env, job.waId);
      if (!active) return { ok: false, error: 'sin_reserva_activa' };
      const nuevo = await rescheduleBooking(
        env,
        active.calcom_booking_uid,
        String(input.start),
        input.motivo ? String(input.motivo) : undefined,
      );
      if (!nuevo) return { ok: false, error: 'reschedule_failed' };
      await updateBookingAfterReschedule(env, active.id, nuevo).catch(() => undefined);
      return { ok: true, ...nuevo };
    }

    case 'cancelar_reserva_calcom': {
      const active = await getActiveBooking(env, job.waId);
      if (!active) return { ok: false, error: 'sin_reserva_activa' };
      const ok = await cancelBooking(env, active.calcom_booking_uid, input.motivo ? String(input.motivo) : undefined);
      if (ok) await cancelBookingRow(env, job.waId, active.id).catch(() => undefined);
      return { ok };
    }

    case 'enviar_recurso': {
      const r = getResource(String(input.recurso_id));
      if (!r) return { ok: false, error: 'recurso no encontrado' };
      return { ok: true, recurso_id: r.id, titulo: r.titulo, url: r.url, descripcion: r.descripcion };
    }

    case 'enviar_botones': {
      const botones = Array.isArray(input.botones) ? input.botones : [];
      await sendInteractiveButtons(env, job.waId, String(input.texto ?? ''), botones);
      return { ok: true, enviado: true };
    }

    case 'borrar_mis_datos': {
      return deleteContactData(env, job.waId);
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
