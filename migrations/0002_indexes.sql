-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_contact      ON messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status       ON contacts(lead_status);
CREATE INDEX IF NOT EXISTS idx_contacts_wa           ON contacts(wa_id);
CREATE INDEX IF NOT EXISTS idx_bookings_contact      ON bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
