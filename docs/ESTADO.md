# Estado del proyecto — Agente WhatsApp Crececonia (checkpoint de sesión)

> Snapshot para guardar/retomar. Última actualización: 2026-06-08.
> Rama de trabajo: `claude/brave-turing-xp1rn`. Código y docs commiteados y pusheados.

> 💰 Costos estimados de lanzar y operar: ver [`docs/COSTOS.md`](COSTOS.md).

## En una línea
Agente de WhatsApp con cerebro Claude sobre Cloudflare Workers. **Código funcional y testeado**
(typecheck + 7/7 tests verdes), **persona y conocimiento afinados en 15 rondas**. Falta credenciales
y verificación de Meta para desplegar.

## Hecho ✅
- **Arquitectura:** webhook (firma HMAC + 200 rápido) → Queue → Durable Object (con **fusión de
  mensajes** buffer+debounce) → Claude (tool-use) → respuesta → D1.
- **Cerebro (Nia):** persona es-CL afinada; tool-use con 11 tools (RAG, lead, calificar, Cal.com
  crear/reprogramar/cancelar, enviar_recurso, enviar_botones, escalar, borrar_mis_datos); memoria con
  resumen rolling; clasificador Haiku en paralelo.
- **RAG:** embeddings bge-m3 + Vectorize; ingesta web/PDF/texto (Workflow) + `/admin/ingest-text`.
- **Audio:** transcripción Whisper. **Agenda:** Cal.com v2. **Escalado:** Telegram. **Seguimiento:**
  cron. **Botones** interactivos. **Panel admin.** **Borrado de datos** (Ley 19.628).
- **Conocimiento (`docs/kb/crececonia.md`):** qué es, 3 servicios, embudo (exploratoria→diagnóstico→
  planificación→implementación), plazos 30-90 días, diferenciador, público, 8 FAQ + objeción ChatGPT.
- **Afinado:** 15 rondas documentadas en `docs/afinado/` + playbook con 28 escenarios.

## Pendiente de Sergio (datos reales, NO bloquean el código)
- [ ] **Caso/resultado real** (anonimizado) para prueba social → sumar al KB y al prompt.
- [ ] **Deep-links exactos** del pack de prompts y el curso (hoy apuntan a `https://www.crececonia.cl`).
- [ ] (Opcional) **Rango de precio** orientativo → `PRICE_RANGE_HINT` en `src/config.ts`.

## Pendiente para DESPLEGAR (camino B — ver `docs/DEPLOY.md`)
- [ ] Crear recursos Cloudflare (D1, KV, Vectorize, R2, Queues) y pegar IDs en `wrangler.toml`.
- [ ] Cargar **secrets** (WhatsApp, Anthropic, AI Gateway, Cal.com, Telegram, Admin).
- [ ] Rellenar `vars` (`WHATSAPP_PHONE_NUMBER_ID`, `CF_ACCOUNT_ID`, `CALCOM_EVENT_TYPE_ID`…).
- [ ] **Iniciar verificación del número en Meta** (lo más lento; arrancar pronto).
- [ ] Crear event type de 30 min en Cal.com; bot/chat de Telegram.
- [ ] **Ingestar el conocimiento**: `crececonia.cl` es la base (devuelve 403 al crawler → usar
      User-Agent realista o `/admin/ingest-text` con `docs/kb/crececonia.md`).

## Cómo retomar
1. Persona/conocimiento: seguir el afinado en `docs/afinado/` (caso real + deep-links pendientes).
2. Despliegue: seguir `docs/DEPLOY.md` paso a paso cuando haya credenciales.
