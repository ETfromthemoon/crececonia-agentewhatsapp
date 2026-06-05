import type Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env';
import { makeAnthropic } from './anthropic';

export interface Classification {
  intent: 'faq' | 'interes_servicio' | 'agendar' | 'saludo' | 'otro';
  language: string;
  lead?: {
    nombre?: string;
    email?: string;
    necesidad?: string;
    presupuesto?: string;
    plazo?: string;
  };
}

/**
 * Clasificación + extracción de campos de lead con el modelo barato (Haiku).
 * Se ejecuta en paralelo al flujo principal para captar datos sin sumar latencia.
 */
export async function classifyMessage(env: Env, text: string): Promise<Classification> {
  const anthropic = makeAnthropic(env);
  const resp = await anthropic.messages.create({
    model: env.MODEL_CLASSIFY,
    max_tokens: 300,
    system:
      'Clasifica el mensaje y extrae datos de lead si aparecen. Responde SOLO con un objeto ' +
      'JSON: {"intent":"faq|interes_servicio|agendar|saludo|otro","language":"es",' +
      '"lead":{"nombre":?,"email":?,"necesidad":?,"presupuesto":?,"plazo":?}}.',
    messages: [{ role: 'user', content: text }],
  });

  const block = resp.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  try {
    return JSON.parse(block?.text ?? '{}') as Classification;
  } catch {
    return { intent: 'otro', language: 'es' };
  }
}
