import type { WhatsAppMessage } from './whatsapp/types';

/** Trabajo encolado por el webhook y procesado por el consumidor de la Queue. */
export interface IncomingJob {
  receivedAt: number;
  phoneNumberId: string;
  waId: string;
  contactName?: string;
  message: WhatsAppMessage;
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'booked'
  | 'won'
  | 'lost'
  | 'nurturing';

export type MessageDirection = 'inbound' | 'outbound';

/** Fila de la tabla `contacts` (subset usado en código). */
export interface ContactRow {
  id: string;
  wa_id: string;
  profile_name: string | null;
  full_name: string | null;
  email: string | null;
  lead_status: LeadStatus;
  lead_score: number;
  need: string | null;
  human_handoff: number;
}
