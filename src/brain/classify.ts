import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env';
import { anthropicGatewayBaseURL } from '../config';

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
 * Útil para enrutar y para alimentar guardar_lead sin gastar el modelo de conversación.
 * (Fase 2: integrar su salida en el flujo del ConversationDO.)
 */
export async function classifyMessage(env: Env, text: string): Promise<Classification> {
  const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: anthropicGatewayBaseURL(env.CF_ACCOUNT_ID, env.AI_GATEWAY_ID),
    defaultHeaders: env.CF_AIG_TOKEN
      ? { 'cf-aig-authorization': `Bearer ${env.CF_AIG_TOKEN}` }
      : undefined,
  });

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
