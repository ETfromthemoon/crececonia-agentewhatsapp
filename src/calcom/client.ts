import type { Env } from '../env';
import { DEFAULT_TIMEZONE } from '../config';

const CAL_BASE = 'https://api.cal.com/v2';

export interface CalSlot {
  startUTC: string;
}

/**
 * Consulta huecos libres (Cal.com v2 `GET /slots`, header cal-api-version 2024-09-04).
 * TODO: confirmar la forma exacta de la respuesta y el manejo de zonas horarias.
 */
export async function getSlots(
  env: Env,
  desde: string,
  hasta: string,
  timeZone = DEFAULT_TIMEZONE,
): Promise<CalSlot[]> {
  const url = new URL(`${CAL_BASE}/slots`);
  url.searchParams.set('eventTypeId', env.CALCOM_EVENT_TYPE_ID);
  url.searchParams.set('start', desde);
  url.searchParams.set('end', hasta);
  url.searchParams.set('timeZone', timeZone);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.CALCOM_API_KEY}`,
      'cal-api-version': env.CALCOM_API_VERSION_SLOTS,
    },
  });
  if (!res.ok) {
    console.error('cal.com getSlots failed', res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as { data?: Record<string, Array<{ start: string }>> };
  const slots: CalSlot[] = [];
  for (const day of Object.values(data.data ?? {})) {
    for (const s of day) slots.push({ startUTC: s.start });
  }
  return slots;
}

export interface CalBooking {
  booking_uid: string;
  meeting_url: string;
  start: string;
}

/**
 * Crea una reserva (Cal.com v2 `POST /bookings`, header cal-api-version 2026-02-25).
 * `start` debe ir en UTC ISO 8601.
 */
export async function createBooking(env: Env, input: Record<string, any>): Promise<CalBooking> {
  const res = await fetch(`${CAL_BASE}/bookings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CALCOM_API_KEY}`,
      'cal-api-version': env.CALCOM_API_VERSION_BOOKINGS,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      start: input.start,
      eventTypeId: Number(env.CALCOM_EVENT_TYPE_ID),
      attendee: {
        name: input.nombre,
        email: input.email,
        timeZone: input.timeZone ?? DEFAULT_TIMEZONE,
      },
      ...(input.notas ? { bookingFieldsResponses: { notes: input.notas } } : {}),
    }),
  });

  const data = (await res.json()) as {
    data?: { uid?: string; meetingUrl?: string; start?: string };
  };
  return {
    booking_uid: data.data?.uid ?? '',
    meeting_url: data.data?.meetingUrl ?? '',
    start: data.data?.start ?? String(input.start),
  };
}

/**
 * Reprograma una reserva (Cal.com v2 `POST /bookings/{uid}/reschedule`).
 * Cal.com genera un uid NUEVO; devolvemos ese. `start` debe ir en UTC ISO 8601.
 * Devuelve null si la API falla (Nia lo gestiona con un mensaje de cortesía).
 */
export async function rescheduleBooking(
  env: Env,
  bookingUid: string,
  start: string,
  motivo?: string,
): Promise<CalBooking | null> {
  const res = await fetch(`${CAL_BASE}/bookings/${bookingUid}/reschedule`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CALCOM_API_KEY}`,
      'cal-api-version': env.CALCOM_API_VERSION_BOOKINGS,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ start, ...(motivo ? { reschedulingReason: motivo } : {}) }),
  });
  if (!res.ok) {
    console.error('cal.com reschedule failed', res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { data?: { uid?: string; meetingUrl?: string; start?: string } };
  return {
    booking_uid: data.data?.uid ?? bookingUid,
    meeting_url: data.data?.meetingUrl ?? '',
    start: data.data?.start ?? start,
  };
}

/** Cancela una reserva (Cal.com v2 `POST /bookings/{uid}/cancel`). */
export async function cancelBooking(env: Env, bookingUid: string, motivo?: string): Promise<boolean> {
  const res = await fetch(`${CAL_BASE}/bookings/${bookingUid}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CALCOM_API_KEY}`,
      'cal-api-version': env.CALCOM_API_VERSION_BOOKINGS,
      'content-type': 'application/json',
    },
    body: JSON.stringify(motivo ? { cancellationReason: motivo } : {}),
  });
  if (!res.ok) {
    console.error('cal.com cancel failed', res.status, await res.text());
    return false;
  }
  return true;
}
