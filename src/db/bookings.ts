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
