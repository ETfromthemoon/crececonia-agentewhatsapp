import type { Env } from '../env';
import { listLeads } from '../db/leads';

/**
 * Panel admin mínimo (protegido por ADMIN_TOKEN).
 * MVP: lectura de leads en JSON. TODO: UI sencilla + conversaciones + export CSV.
 */
export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('authorization');
  if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  if (url.pathname === '/admin/leads' && request.method === 'GET') {
    const leads = await listLeads(env, 100);
    return Response.json(leads);
  }

  return new Response('Not found', { status: 404 });
}
