import type { Env } from '../env';
import { handleWebhookGet, handleWebhookPost } from './webhook';
import { handleAdmin } from './admin';

/** Enrutado HTTP del Worker. */
export async function handleFetch(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === '/webhook') {
    if (request.method === 'GET') return handleWebhookGet(request, env);
    if (request.method === 'POST') return handleWebhookPost(request, env, ctx);
    return new Response('Method not allowed', { status: 405 });
  }

  if (url.pathname.startsWith('/admin')) {
    return handleAdmin(request, env);
  }

  if (url.pathname === '/health') {
    return new Response('ok', { status: 200 });
  }

  return new Response('Not found', { status: 404 });
}
