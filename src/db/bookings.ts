import type { Env } from '../env';

/** Persiste una reserva de Cal.com asociada al contacto. */
export async function insertBooking(
  env: Env,
  waId: string,
  b: { booking_uid: string; meeting_url: string; start: string },
): Promise<void> {
  const contact = await env.DB.prepare('SELECT id FROM contacts WHERE wa_id = ?')
    .bind(waId)
    .first<{ id: string }>();
  if (!contact) return;

  await env.DB.prepare(
    `INSERT INTO bookings (id, contact_id, calcom_booking_uid, event_type_id, start_time, meeting_url, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
  )
    .bind(
      crypto.randomUUID(),
      contact.id,
      b.booking_uid,
      env.CALCOM_EVENT_TYPE_ID,
      Date.parse(b.start) || Date.now(),
      b.meeting_url,
      Date.now(),
    )
    .run();

  // Marca el lead como 'booked'.
  await env.DB.prepare(
    "UPDATE contacts SET lead_status = 'booked', updated_at = ? WHERE id = ?",
  )
    .bind(Date.now(), contact.id)
    .run();
}

export interface ActiveBooking {
  id: string;
  calcom_booking_uid: string;
  start_time: number;
  meeting_url: string;
}

/** Devuelve la reserva confirmada más reciente del contacto, o null si no tiene. */
export async function getActiveBooking(env: Env, waId: string): Promise<ActiveBooking | null> {
  const row = await env.DB.prepare(
    `SELECT b.id, b.calcom_booking_uid, b.start_time, b.meeting_url
       FROM bookings b JOIN contacts c ON c.id = b.contact_id
      WHERE c.wa_id = ? AND b.status = 'confirmed'
      ORDER BY b.created_at DESC LIMIT 1`,
  )
    .bind(waId)
    .first<ActiveBooking>();
  return row ?? null;
}

/** Actualiza la reserva tras reprogramar (nuevo uid/start/enlace). */
export async function updateBookingAfterReschedule(
  env: Env,
  bookingId: string,
  b: { booking_uid: string; meeting_url: string; start: string },
): Promise<void> {
  await env.DB.prepare(
    "UPDATE bookings SET calcom_booking_uid = ?, start_time = ?, meeting_url = ?, status = 'confirmed' WHERE id = ?",
  )
    .bind(b.booking_uid, Date.parse(b.start) || Date.now(), b.meeting_url, bookingId)
    .run();
}

/** Marca la reserva como cancelada y devuelve el lead de 'booked' a 'qualified'. */
export async function cancelBookingRow(env: Env, waId: string, bookingId: string): Promise<void> {
  await env.DB.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").bind(bookingId).run();
  await env.DB.prepare(
    "UPDATE contacts SET lead_status = 'qualified', updated_at = ? WHERE wa_id = ? AND lead_status = 'booked'",
  )
    .bind(Date.now(), waId)
    .run();
}
