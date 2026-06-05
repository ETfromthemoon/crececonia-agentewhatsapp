import { describe, it, expect } from 'vitest';
import { verifySignature } from '../src/whatsapp/verify';

async function sign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `sha256=${hex}`;
}

function buf(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer;
}

describe('verifySignature', () => {
  const secret = 'test_app_secret';
  const body = JSON.stringify({ hello: 'world', n: 42 });

  it('acepta una firma válida', async () => {
    const sig = await sign(secret, body);
    expect(await verifySignature(buf(body), sig, secret)).toBe(true);
  });

  it('rechaza una firma inválida', async () => {
    expect(await verifySignature(buf(body), 'sha256=deadbeef', secret)).toBe(false);
  });

  it('rechaza si falta el header', async () => {
    expect(await verifySignature(buf(body), null, secret)).toBe(false);
  });

  it('rechaza con secret incorrecto', async () => {
    const sig = await sign('otro_secret', body);
    expect(await verifySignature(buf(body), sig, secret)).toBe(false);
  });
});
