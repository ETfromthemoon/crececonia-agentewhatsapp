import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../env';
import { anthropicGatewayBaseURL } from '../config';

/** Cliente Anthropic apuntando a Cloudflare AI Gateway (caché, métricas, fallback). */
export function makeAnthropic(env: Env): Anthropic {
  return new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    baseURL: anthropicGatewayBaseURL(env.CF_ACCOUNT_ID, env.AI_GATEWAY_ID),
    defaultHeaders: env.CF_AIG_TOKEN
      ? { 'cf-aig-authorization': `Bearer ${env.CF_AIG_TOKEN}` }
      : undefined,
  });
}
