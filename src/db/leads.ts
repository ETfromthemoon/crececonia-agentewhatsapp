import type { Env } from '../env';

/** Devuelve el contacto por wa_id; lo crea si no existe. */
export async function getOrCreateContact(
  env: Env,
  waId: string,
  profileName: string | null,
): Promise<{ id: string }> {
  const existing = await env.DB.prepare('SELECT id FROM contacts WHERE wa_id = ?')
    .bind(waId)
    .first<{ id: string }>();
  if (existing) return existing;

  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO contacts (id, wa_id, profile_name, lead_status, lead_score, consent, human_handoff, created_at, updated_at)
     VALUES (?, ?, ?, 'new', 0, 0, 0, ?, ?)`,
  )
    .bind(id, waId, profileName, now, now)
    .run();
  return { id };
}

/** Crea/actualiza los campos de lead (no sobrescribe con null). */
export async function upsertLead(
  env: Env,
  waId: string,
  input: Record<string, any>,
): Promise<string> {
  const contact = await getOrCreateContact(env, waId, null);
  const consent =
    input.consentimiento != null ? (input.consentimiento ? 1 : 0) : null;

  await env.DB.prepare(
    `UPDATE contacts SET
       full_name = COALESCE(?, full_name),
       email     = COALESCE(?, email),
       company   = COALESCE(?, company),
       need      = COALESCE(?, need),
       budget    = COALESCE(?, budget),
       timeline  = COALESCE(?, timeline),
       consent   = COALESCE(?, consent),
       updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      input.nombre ?? null,
      input.email ?? null,
      input.empresa ?? null,
      input.necesidad ?? null,
      input.presupuesto ?? null,
      input.plazo ?? null,
      consent,
      Date.now(),
      contact.id,
    )
    .run();

  return contact.id;
}

/** Fija score y estado del lead. */
export async function qualifyLead(
  env: Env,
  waId: string,
  score: number,
  estado: string,
): Promise<void> {
  await env.DB.prepare(
    'UPDATE contacts SET lead_score = ?, lead_status = ?, updated_at = ? WHERE wa_id = ?',
  )
    .bind(score, estado, Date.now(), waId)
    .run();
}

/** Activa/desactiva el modo "humano" (pausa el bot). */
export async function setHumanHandoff(env: Env, waId: string, on: 0 | 1): Promise<void> {
  await env.DB.prepare(
    'UPDATE contacts SET human_handoff = ?, updated_at = ? WHERE wa_id = ?',
  )
    .bind(on, Date.now(), waId)
    .run();
}

/** Lista de leads para el panel admin. */
export async function listLeads(env: Env, limit = 100): Promise<unknown[]> {
  const res = await env.DB.prepare(
    `SELECT id, wa_id, full_name, email, lead_status, lead_score, need, updated_at
     FROM contacts ORDER BY updated_at DESC LIMIT ?`,
  )
    .bind(limit)
    .all();
  return res.results ?? [];
}
