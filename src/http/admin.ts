import type { Env } from '../env';
import { listLeads } from '../db/leads';
import { ingestText } from '../rag/ingest';

/**
 * Panel admin mínimo (protegido por ADMIN_TOKEN).
 * - GET  /admin            → panel HTML de leads (auth por ?token=)
 * - GET  /admin/leads      → JSON de leads (auth por header Bearer)
 * - POST /admin/ingest     → dispara el Workflow de ingesta RAG ({ urls? })
 * - POST /admin/ingest-text→ ingesta directa de texto ({ source, text })
 */
export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // Panel HTML (auth por query token, cómodo desde el navegador).
  if (url.pathname === '/admin' && request.method === 'GET') {
    if (!env.ADMIN_TOKEN || url.searchParams.get('token') !== env.ADMIN_TOKEN) return unauthorized();
    const leads = (await listLeads(env, 200)) as Record<string, unknown>[];
    return new Response(renderPanel(leads), {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  // Resto de endpoints: auth por header Bearer.
  if (!env.ADMIN_TOKEN || request.headers.get('authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
    return unauthorized();
  }

  if (url.pathname === '/admin/leads' && request.method === 'GET') {
    return Response.json(await listLeads(env, 200));
  }

  if (url.pathname === '/admin/ingest' && request.method === 'POST') {
    const body = (await request.json().catch(() => ({}))) as { urls?: string[] };
    const wf = await env.RAG_INGEST.create({ params: { urls: body.urls } });
    return Response.json({ ok: true, workflow_id: wf.id });
  }

  if (url.pathname === '/admin/ingest-text' && request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as { source?: string; text?: string } | null;
    if (!body?.text) return Response.json({ ok: false, error: 'falta "text"' }, { status: 400 });
    const chunks = await ingestText(env, body.source ?? 'manual', body.text);
    return Response.json({ ok: true, chunks });
  }

  return new Response('Not found', { status: 404 });
}

function unauthorized(): Response {
  return new Response('Unauthorized', { status: 401 });
}

function esc(v: unknown): string {
  return String(v ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] as string);
}

function renderPanel(leads: Record<string, unknown>[]): string {
  const rows = leads
    .map(
      (l) =>
        `<tr><td>${esc(l.full_name)}</td><td>${esc(l.wa_id)}</td><td>${esc(l.email)}</td>` +
        `<td>${esc(l.lead_status)}</td><td>${esc(l.lead_score)}</td><td>${esc(l.need)}</td></tr>`,
    )
    .join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Leads · Crececonia</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;color:#222}
h1{font-size:20px}table{border-collapse:collapse;width:100%}
td,th{border:1px solid #ddd;padding:6px 8px;font-size:14px}
th{background:#f5f5f5;text-align:left}tr:nth-child(even){background:#fafafa}</style></head>
<body><h1>Leads — Nia · Crececonia (${leads.length})</h1>
<table><thead><tr><th>Nombre</th><th>WhatsApp</th><th>Email</th><th>Estado</th><th>Score</th><th>Necesidad</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`;
}
