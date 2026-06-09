#!/usr/bin/env node
/**
 * Simula un webhook de WhatsApp Cloud API FIRMADO (X-Hub-Signature-256) contra tu Worker.
 * Sirve para probar el flujo completo en local (`wrangler dev`) o en el Worker desplegado,
 * sin necesidad de mandar un WhatsApp real.
 *
 * APP_SECRET / WHATSAPP_VERIFY_TOKEN se leen de la variable de entorno o de `.dev.vars`.
 *
 * Ejemplos:
 *   node scripts/simulate-webhook.mjs "Hola, tengo una pyme y quiero IA"
 *   node scripts/simulate-webhook.mjs --type button "Agendar"
 *   node scripts/simulate-webhook.mjs --type audio
 *   node scripts/simulate-webhook.mjs --verify          # prueba el handshake GET de Meta
 *   node scripts/simulate-webhook.mjs --url https://<tu-worker>.workers.dev "hola"
 *
 * Flags: --type text|audio|button (def. text) · --wa <wa_id> · --name <nombre>
 *        --url <base> (def. http://localhost:8787) · --phone <phone_number_id> · --verify
 */
import { createHmac, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (key === 'verify') out.verify = true;
      else out[key] = argv[++i];
    } else out._.push(a);
  }
  return out;
}

function fromDevVars(name) {
  if (process.env[name]) return process.env[name];
  try {
    const dv = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
    const m = dv.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    /* no .dev.vars */
  }
  return '';
}

function buildMessage(type, text, waId) {
  const base = { from: waId, id: `wamid.TEST-${randomUUID()}`, timestamp: String(Math.floor(Date.now() / 1000)) };
  if (type === 'audio') {
    return { ...base, type: 'audio', audio: { id: `MEDIA-TEST-${randomUUID()}`, mime_type: 'audio/ogg; codecs=opus', voice: true } };
  }
  if (type === 'button') {
    return { ...base, type: 'interactive', interactive: { type: 'button_reply', button_reply: { id: 'btn_test', title: text || 'Agendar' } } };
  }
  return { ...base, type: 'text', text: { body: text || 'Hola' } };
}

const args = parseArgs(process.argv.slice(2));
const base = (args.url || 'http://localhost:8787').replace(/\/$/, '');

// --- Modo verificación (GET handshake de Meta) ---
if (args.verify) {
  const token = fromDevVars('WHATSAPP_VERIFY_TOKEN');
  const challenge = `chal-${randomUUID()}`;
  const u = new URL(`${base}/webhook`);
  u.searchParams.set('hub.mode', 'subscribe');
  u.searchParams.set('hub.verify_token', token);
  u.searchParams.set('hub.challenge', challenge);
  const res = await fetch(u);
  const text = await res.text();
  const ok = res.status === 200 && text === challenge;
  console.log(`GET /webhook (verify) → ${res.status} · ${ok ? '✅ challenge OK' : '❌ no coincide'}`);
  if (!token) console.log('  (tip: define WHATSAPP_VERIFY_TOKEN en .dev.vars o como env)');
  process.exit(ok ? 0 : 1);
}

// --- Modo envío (POST firmado) ---
const waId = args.wa || '56912345678';
const message = buildMessage(args.type || 'text', args._[0], waId);
const body = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'WABA-TEST',
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '15550000000', phone_number_id: args.phone || 'TEST_PHONE_ID' },
            contacts: [{ profile: { name: args.name || 'Tester' }, wa_id: waId }],
            messages: [message],
          },
        },
      ],
    },
  ],
};

const raw = JSON.stringify(body);
const appSecret = fromDevVars('APP_SECRET');
if (!appSecret) {
  console.error('⚠️  Falta APP_SECRET (env o .dev.vars). El Worker responderá 401 (firma inválida).');
}
const signature = `sha256=${createHmac('sha256', appSecret).update(raw).digest('hex')}`;

const res = await fetch(`${base}/webhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-hub-signature-256': signature },
  body: raw,
});
console.log(`POST /webhook (${message.type}) → ${res.status} ${res.statusText}`);
console.log(await res.text());
console.log(`\n→ Mira la respuesta de Nia en otra terminal con: npx wrangler tail (o el dev server).`);
