# Guía de despliegue — Agente de WhatsApp (Nia · Crececonia)

Paso a paso para pasar del esqueleto a un agente vivo en Cloudflare. Lo no-técnico (crear cuentas
y verificar el número) hazlo tú; los comandos están listos para copiar/pegar.

> ⏳ **Empieza ya por el paso 4 (WhatsApp/Meta):** la verificación del negocio/número puede tardar
> días y es el cuello de botella.

## Resumen: orden y tiempos
| Fase | Qué | Cuándo | Tiempo |
|---|---|---|---|
| **A · Ahora** | Conseguir el **número** (eSIM prepago) e **iniciar la verificación en Meta**. Contratar Workers Paid y cargar saldo en Anthropic. | Hoy | minutos |
| **B · Verificación Meta** | Business Verification + alta del número (externo, no depende de nosotros). | Empezar YA | días ⏳ |
| **C · Día de lanzamiento** | Crear recursos CF → pegar IDs → secrets → `deploy` → conectar webhook → ingestar RAG → probar E2E. | Con credenciales | ~30–60 min |

> 💰 Costos de cada cosa: ver [`docs/COSTOS.md`](COSTOS.md).

---

## 0) Requisitos (cuentas)
- **Cloudflare** con **Workers Paid (~US$5/mes)** — necesario para **Queues** (y holgura en Durable
  Objects/Vectorize/Workers AI).
- **Meta Business** + **WhatsApp Business Account (WABA)** + un **número** dedicado.
- **Anthropic** (API key) — el cerebro de Nia.
- **Cal.com** (API key + un event type de 30 min).
- **Telegram** (un bot + tu chat id) para los avisos/escalados.

## 1) Instalar y autenticar
```bash
npm install
npx wrangler login        # abre el navegador y autoriza
```

## 2) Crear los recursos de Cloudflare
```bash
bash scripts/setup-cloudflare.sh
```
Copia a `wrangler.toml` el `database_id` (D1) y el `id` (KV) que imprime. Luego aplica migraciones:
```bash
npx wrangler d1 migrations apply crececonia-leads --remote
```

## 3) AI Gateway (para Anthropic)
1. En el dashboard de Cloudflare → **AI** → **AI Gateway** → crea un gateway llamado `crececonia`.
2. En `wrangler.toml` pon `CF_ACCOUNT_ID` (tu Account ID) y deja `AI_GATEWAY_ID = "crececonia"`.
3. Si activas autenticación del gateway, crea un token y guárdalo como secret `CF_AIG_TOKEN`
   (si no, déjalo vacío).

## 4) WhatsApp Cloud API (Meta) — ¡empieza por aquí!

> **El número dedicado:** usa una **línea nueva** (lo más simple: una **eSIM prepago** en tu teléfono,
> ~CLP 1.000–5.000) que **NO esté activa en la app de WhatsApp** (ni Messenger ni Business). El Cloud
> API aloja el número en la nube de Meta; el teléfono solo recibe el **código de verificación** una
> vez — después no necesitas ninguna app abierta. No se paga por el número ni por la Cloud API, y
> como vamos directo (sin BSP) no hay comisiones.

1. [developers.facebook.com](https://developers.facebook.com) → **Crear app** → tipo **Business**.
2. Añade el producto **WhatsApp**. Obtendrás un **número de prueba** (sandbox) para empezar.
3. Apunta: **Phone number ID** y el **WhatsApp Business Account ID**.
4. **App Secret:** App → Configuración → Básica → copia el *App Secret* → secret `APP_SECRET`.
5. **Token permanente:** crea un **System User** (Business Settings) con permisos de WhatsApp y genera
   un token permanente → secret `WHATSAPP_TOKEN`. (El token temporal de 24h solo sirve para probar).
6. En `wrangler.toml` pon `WHATSAPP_PHONE_NUMBER_ID`.
7. Inventa un texto cualquiera para `WHATSAPP_VERIFY_TOKEN` (lo usarás en el paso 9) → secret.
8. **Para producción** (salir del sandbox): completa la **verificación del negocio** y registra el
   número con su *display name*. Esto es lo que puede tardar.

## 5) Cal.com
1. Crea un **event type** de **30 min** (p. ej. "Diagnóstico"). Copia su **eventTypeId** →
   `CALCOM_EVENT_TYPE_ID` en `wrangler.toml`.
2. **Developer → API Keys** → crea una → secret `CALCOM_API_KEY`.
3. Verifica tu zona horaria (el código usa `America/Santiago`).

## 6) Telegram (avisos/escalado)
1. Habla con **@BotFather** → `/newbot` → copia el token → secret `TELEGRAM_BOT_TOKEN`.
2. Escríbele algo a tu bot y luego abre
   `https://api.telegram.org/bot<TOKEN>/getUpdates` para ver tu **chat id** → secret `TELEGRAM_CHAT_ID`.

## 7) Cargar variables y secrets
- Variables (no secretas) → edítalas en `wrangler.toml` (`[vars]`): `WHATSAPP_PHONE_NUMBER_ID`,
  `CF_ACCOUNT_ID`, `CALCOM_EVENT_TYPE_ID`.
- Secrets → cárgalos (te pedirá cada valor):
```bash
bash scripts/put-secrets.sh
```
(Para probar en local, copia `.dev.vars.example` a `.dev.vars` y rellena ahí).

## 8) Desplegar
```bash
npm run deploy        # wrangler deploy
```
Anota la URL del Worker, p. ej. `https://crececonia-agentewhatsapp.<subdominio>.workers.dev`.

## 9) Conectar el webhook de Meta
En la app de Meta → **WhatsApp → Configuración → Webhooks**:
- **Callback URL:** `https://<tu-worker>/webhook`
- **Verify token:** el mismo valor de `WHATSAPP_VERIFY_TOKEN`
- Pulsa **Verificar y guardar** (debe responder el challenge → ✅).
- **Suscríbete al campo `messages`.**

## 10) Ingesta de la base de conocimiento (RAG)
- Fuentes en `src/rag/sources.ts` (crececonia.cl + sitemap + Instagram).
- ⚠️ **crececonia.cl devuelve 403** a fetchers automáticos. Opciones:
  1. Permitir un **User-Agent** propio / usar **Cloudflare Browser Rendering** en el crawler.
  2. Subir el contenido clave (servicios, FAQs, cursos) **manualmente a R2** y adaptarlo en el
     Workflow de ingesta.
- Pon las **URLs reales de los regalos** (pack de prompts, curso) en `src/resources.ts`.
- Dispara la ingesta (cuando esté implementada): vía endpoint admin o `RAG_INGEST.create({ params })`.

## 11) Prueba end-to-end
```bash
npx wrangler tail        # logs en vivo
```
Escribe por WhatsApp al número y verifica: recepción → Queue → DO → Claude → respuesta de Nia.
Comprueba filas en D1 (`wrangler d1 execute crececonia-leads --remote --command "SELECT * FROM contacts"`),
la reserva en Cal.com y el aviso en Telegram. Usa la **checklist** de `docs/afinado/playbook.md`.

## 12) Checklist final
- [ ] Workers Paid activo · `npm install` · `wrangler login`
- [ ] Recursos creados e **IDs pegados** en `wrangler.toml` · migraciones aplicadas
- [ ] AI Gateway `crececonia` creado · `CF_ACCOUNT_ID` puesto
- [ ] Secrets cargados (WhatsApp, Anthropic, Cal.com, Telegram, admin)
- [ ] `npm run deploy` OK · webhook verificado en Meta · campo `messages` suscrito
- [ ] URLs de recursos puestas · RAG ingestado
- [ ] Prueba end-to-end ✅ (playbook)
- [ ] (Producción) Verificación del negocio/número en Meta

## 13) Costos aproximados
- **Cloudflare Workers Paid:** ~US$5/mes (incluye cuotas amplias; Queues/DO/Vectorize/Workers AI
  con uso adicional según volumen).
- **Anthropic:** por uso; el diseño usa modelos mixtos + *prompt caching* para abaratar.
- **WhatsApp:** los mensajes de servicio dentro de la **ventana de 24h son gratis**; las plantillas
  fuera de 24h tienen costo.
- **Cal.com:** plan gratuito suele bastar para empezar.

## 14) Troubleshooting
- **Webhook no verifica:** revisa que `WHATSAPP_VERIFY_TOKEN` coincida y que la URL sea `/webhook`.
- **401 Invalid signature:** `APP_SECRET` incorrecto o body alterado por un proxy.
- **`compatibility date too new` en local:** ya está fijada a `2025-02-04`; súbela solo si tu
  runtime lo soporta.
- **Tests:** usan una config mínima de miniflare (sin binding de Workers AI). No cargan `wrangler.toml`.
- **RAG 403:** ver paso 10.
