# Agente de WhatsApp — marca personal de IA (Cloudflare + Claude)

Agente conversacional de WhatsApp cuyo **cerebro es Claude** (Anthropic), alojado en
**Cloudflare Workers**. Atiende los mensajes entrantes de la marca personal de IA de Sergio:
responde con conocimiento real de la marca (RAG), **califica leads**, **agenda llamadas**
(Cal.com), **comparte recursos**, entiende **notas de voz**, recuerda a cada contacto y
**escala a un humano** cuando conviene.

> 📄 PRD y diseño técnico completos: [`docs/PRD.md`](docs/PRD.md).
> 🧠 El cerebro se afina por rondas largas de Q&A (mín. 50 iteraciones): ver `docs/PRD.md` §14.1
> y la bitácora en [`docs/afinado/`](docs/afinado/).

## Arquitectura (resumen)

```
WhatsApp → Webhook (verifica firma, 200 rápido) → Queue → Durable Object (orden por chat)
        → Claude (tool-use: RAG, Cal.com, lead, escalado) → respuesta → D1
```

- **Workers** (compute) · **Queues** (async + reintentos) · **Durable Objects** (orden por conversación)
- **D1** (leads/mensajes/reservas) · **KV** (dedupe/caché/rate-limit) · **Vectorize** (RAG) · **R2** (audios/PDFs)
- **Workers AI** (Whisper transcripción + bge-m3 embeddings) · **AI Gateway** (front de Anthropic)

## Estado

🚧 **Esqueleto / scaffold.** Estructura, configuración y firmas creadas; lógica de negocio con
`TODO` por implementar fase a fase (ver roadmap en `docs/PRD.md` §18). **Aún no desplegable**:
faltan credenciales y rellenar IDs de recursos en `wrangler.toml`.

## Puesta en marcha (local)

```bash
npm install
cp .dev.vars.example .dev.vars   # rellena los secrets
npm run typecheck
npm test
npm run dev                       # wrangler dev
```

### Crear recursos en Cloudflare (Fase 0)

```bash
wrangler d1 create crececonia-leads
wrangler kv namespace create KV
wrangler vectorize create crececonia-kb --dimensions=1024 --metric=cosine
wrangler r2 bucket create crececonia-media
wrangler queues create whatsapp-incoming
wrangler queues create whatsapp-dlq
# Copia los IDs devueltos a wrangler.toml
wrangler d1 migrations apply crececonia-leads --remote
```

### Secrets (remoto)

```bash
wrangler secret put WHATSAPP_TOKEN
wrangler secret put WHATSAPP_VERIFY_TOKEN
wrangler secret put APP_SECRET
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put CF_AIG_TOKEN
wrangler secret put CALCOM_API_KEY
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
wrangler secret put ADMIN_TOKEN
```

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Worker local (`wrangler dev`) |
| `npm run deploy` | Despliegue (`wrangler deploy`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tests (vitest) |
| `npm run db:migrate:local` | Migraciones D1 en local |
| `npm run db:migrate:remote` | Migraciones D1 en remoto |

## Lo que falta para arrancar

- Credenciales de Meta/WhatsApp, `ANTHROPIC_API_KEY`, API key + `eventTypeId` de Cal.com,
  bot/chat de Telegram.
- Lista de URLs + PDFs para la base de conocimiento (RAG).
- Iniciar pronto el alta y verificación del número en Meta (cuello de botella externo).
