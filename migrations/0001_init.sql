-- Esquema inicial del agente de WhatsApp (Cloudflare D1 / SQLite)
-- Aplicar con: wrangler d1 migrations apply crececonia-leads --local|--remote

-- Contactos / leads -------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id              TEXT PRIMARY KEY,          -- uuid
  wa_id           TEXT UNIQUE NOT NULL,      -- número WhatsApp (E.164 sin '+')
  profile_name    TEXT,
  full_name       TEXT,
  email           TEXT,
  company         TEXT,
  lead_status     TEXT NOT NULL DEFAULT 'new',  -- new|contacted|qualified|booked|won|lost|nurturing
  lead_score      INTEGER NOT NULL DEFAULT 0,   -- 0-100
  budget          TEXT,
  need            TEXT,
  timeline        TEXT,
  source          TEXT,
  web_socials     TEXT,                          -- web o redes sociales del contacto
  consent         INTEGER NOT NULL DEFAULT 0,   -- opt-in marketing (plantillas fuera de 24h)
  human_handoff   INTEGER NOT NULL DEFAULT 0,   -- 1 = bot en pausa (escalado)
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

-- Conversaciones ----------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id               TEXT PRIMARY KEY,
  contact_id       TEXT NOT NULL REFERENCES contacts(id),
  status           TEXT NOT NULL DEFAULT 'open',  -- open|closed|escalated
  summary          TEXT,                          -- resumen rolling (espejo del DO)
  last_inbound_at  INTEGER,                        -- para ventana 24h
  last_outbound_at INTEGER,
  followup_sent    INTEGER NOT NULL DEFAULT 0,     -- recordatorio suave enviado (1 vez)
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

-- Mensajes (auditoría + reconstrucción de contexto) -----------------
CREATE TABLE IF NOT EXISTS messages (
  id               TEXT PRIMARY KEY,          -- usa el wamid si existe (dedupe)
  conversation_id  TEXT NOT NULL REFERENCES conversations(id),
  contact_id       TEXT NOT NULL,
  direction        TEXT NOT NULL,             -- inbound|outbound
  type             TEXT NOT NULL,             -- text|audio|image|template|interactive
  body             TEXT,                      -- texto o transcripción
  media_r2_key     TEXT,                      -- ruta en R2 si aplica
  wa_message_id    TEXT,
  tool_calls       TEXT,                      -- JSON de tools usadas en este turno
  tokens_in        INTEGER,
  tokens_out       INTEGER,
  model            TEXT,
  created_at       INTEGER NOT NULL
);

-- Reservas Cal.com --------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                  TEXT PRIMARY KEY,
  contact_id          TEXT NOT NULL REFERENCES contacts(id),
  calcom_booking_uid  TEXT,
  event_type_id       TEXT,
  start_time          INTEGER NOT NULL,
  end_time            INTEGER,
  attendee_email      TEXT,
  status              TEXT NOT NULL DEFAULT 'confirmed',  -- confirmed|cancelled|rescheduled
  meeting_url         TEXT,
  created_at          INTEGER NOT NULL
);

-- Recursos compartidos (tracking) -----------------------------------
CREATE TABLE IF NOT EXISTS resource_shares (
  id            TEXT PRIMARY KEY,
  contact_id    TEXT NOT NULL,
  resource_key  TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

-- Escalados a humano ------------------------------------------------
CREATE TABLE IF NOT EXISTS escalations (
  id           TEXT PRIMARY KEY,
  contact_id   TEXT NOT NULL,
  reason       TEXT,
  notified_at  INTEGER,
  resolved_at  INTEGER
);
