# PRD + Plan técnico — Agente de WhatsApp con cerebro Claude sobre Cloudflare

> **Documento vivo.** PRD y diseño técnico del agente para la marca personal de IA de Sergio.
> Proyecto greenfield. Detalles de Cloudflare, WhatsApp Cloud API, Anthropic y Cal.com
> verificados contra fuentes de 2026 (ver §22). El afinado del agente se hará por rondas
> largas de Q&A, mínimo 50 iteraciones (ver §14.1).

---

## 1. Contexto (por qué hacemos esto)

Sergio tiene una **marca personal de IA** que recibe mensajes por WhatsApp de personas
interesadas (curiosos, posibles clientes de formación/servicios, colaboraciones, etc.).
Atender todo manualmente no escala: hay fricción para responder rápido, calificar quién
es un lead real, agendar llamadas y compartir recursos de forma consistente y con su voz
de marca.

La oportunidad es construir un **agente conversacional** cuyo "cerebro" es **Claude** (vía
la API de Anthropic), alojado en **Cloudflare Workers**, que atienda esos mensajes 24/7,
hable como la marca, **califique leads**, **agende llamadas** y **comparta contenido**,
y que **escale a Sergio** cuando convenga la intervención humana. Resultado esperado:
más leads bien calificados, respuesta inmediata, menos trabajo manual y una experiencia
coherente.

## 2. Problema / oportunidad

- **Latencia de respuesta:** los mensajes entrantes esperan a que Sergio esté disponible.
- **Calificación inconsistente:** no hay un proceso uniforme para detectar leads valiosos.
- **Pérdida de oportunidades de agenda:** agendar llamadas requiere ida y vuelta manual.
- **Conocimiento disperso:** las respuestas dependen de lo que Sergio recuerde en el momento,
  en vez de apoyarse en su contenido ya publicado (web/blog) y materiales (PDFs).
- **Sin memoria:** cada conversación arranca de cero; no se recuerda al contacto.

## 3. Objetivos del producto y métricas de éxito

**Objetivos**
1. **O1 — Responder al instante** a los mensajes entrantes con la voz de la marca.
2. **O2 — Captar y calificar leads** automáticamente (datos + nivel de interés).
3. **O3 — Agendar llamadas** con Sergio vía Cal.com desde el propio chat.
4. **O4 — Compartir contenido/recursos** relevantes según la conversación.
5. **O5 — Escalar a humano** cuando el caso lo requiera, avisando a Sergio.
6. **O6 — Responder con conocimiento real** de la marca (RAG sobre web + PDFs).

**Métricas de éxito (propuestas, a confirmar)**
- % de conversaciones atendidas sin intervención humana (objetivo MVP: >70%).
- Tiempo medio hasta primera respuesta (objetivo: < 10 s).
- Nº de leads calificados / semana y % que aceptan agendar llamada.
- Tasa de reservas completadas en Cal.com originadas por el agente.
- % de escalados correctamente detectados (precisión del escalado).
- Coste por conversación (Claude + WhatsApp + Cloudflare) dentro de presupuesto.

## 4. No-objetivos (fuera de alcance, al menos en MVP)

- **No** es un bot de soporte/postventa ni un sistema de tickets.
- **No** hace campañas salientes masivas ni marketing proactivo (respeta ventana 24h de Meta).
- **No** procesa pagos ni cierra ventas dentro del chat (de momento).
- **No** entiende imágenes/documentos enviados por el usuario (descartado en la elección de
  capacidades; se podría añadir en una fase futura).
- **No** soporta multi-idioma explícito en MVP (asume español; ampliable).

## 5. Usuarios / personas

- **Visitante curioso:** llega por contenido de Sergio, pregunta dudas sobre IA o sus
  servicios. → Se le responde con RAG y se intenta capturar interés.
- **Lead potencial:** tiene una necesidad concreta (formación, consultoría, charla).
  → Se califica y se le ofrece agendar una llamada.
- **Contacto recurrente:** ya habló antes. → Se le reconoce gracias a la memoria por contacto.
- **Sergio (administrador):** recibe avisos de leads calientes / escalados por Telegram o
  Slack y consulta los leads en la base de datos del agente.

## 6. Decisiones tomadas (definidas con el usuario)

| Tema | Decisión |
|---|---|
| Canal | **WhatsApp Business Cloud API oficial de Meta** (webhook + Graph API) |
| Hosting | **Cloudflare Workers** + servicios nativos (D1, Queues, Vectorize, R2, Workers AI, KV) |
| Cerebro | **Claude** (Anthropic Messages API con _tool use_); enfoque híbrido de modelos por coste |
| Objetivos del agente | Captar/calificar leads · Agendar llamadas · Compartir contenido |
| Base de conocimiento | **RAG** sobre **web/blog (crawl) + PDFs/archivos** |
| Capacidades | **Notas de voz** (transcripción) · **Memoria por contacto** · **Escalado a humano** |
| Agenda | **Cal.com** (API: disponibilidad + crear reserva, como _tool_ de Claude) |
| Avisos/escalado | **Telegram o Slack** (resumen + enlace para retomar) |
| Almacenamiento de leads | **Cloudflare D1** (BD propia) + panel sencillo |

## 7. Requisitos funcionales (qué debe hacer)

- **RF1 — Recepción de mensajes:** recibir mensajes de texto y de **audio** vía webhook de
  WhatsApp Cloud API; verificar la firma; confirmar recepción de forma inmediata.
- **RF2 — Transcripción de voz:** descargar el audio y transcribirlo para que el agente lo
  entienda y responda en consecuencia.
- **RF3 — Conversación con Claude:** generar respuestas con la voz de marca, apoyándose en
  el contexto de la conversación y en el conocimiento recuperado (RAG).
- **RF4 — RAG de marca:** indexar el contenido (web + PDFs) y recuperar fragmentos
  relevantes para fundamentar las respuestas.
- **RF5 — Captura y calificación de leads:** extraer datos del contacto (nombre, interés,
  necesidad, urgencia) y asignar un nivel/score; persistirlo.
- **RF6 — Agenda con Cal.com:** consultar disponibilidad y crear una reserva desde el chat.
- **RF7 — Compartir recursos:** enviar enlaces/recursos pertinentes (lead magnets, guías,
  contenido) según la conversación.
- **RF8 — Memoria por contacto:** recordar al contacto y resumen de interacciones previas.
- **RF9 — Escalado a humano:** detectar cuándo derivar y notificar a Sergio (Telegram/Slack)
  con resumen y enlace; pausar/transferir si procede.
- **RF10 — Persistencia y panel:** guardar contactos, conversaciones, mensajes, leads y
  reservas en D1; ofrecer un panel sencillo para consultarlos.

## 8. Requisitos no funcionales

- **Latencia:** webhook responde 200 de inmediato (procesamiento asíncrono); primera
  respuesta al usuario en pocos segundos.
- **Fiabilidad/orden:** procesar mensajes en orden por conversación y sin perderlos.
- **Coste:** modelo híbrido (Claude barato para clasificar/extraer, más potente para
  conversar) y _prompt caching_; control de coste por conversación.
- **Seguridad/privacidad:** verificación de firma del webhook, secretos en Wrangler,
  manejo responsable de datos personales (RGPD), retención y borrado.
- **Cumplimiento WhatsApp:** respetar la ventana de servicio de 24h y el uso de plantillas
  cuando aplique.
- **Mantenibilidad:** TypeScript, estructura modular, tests, despliegue reproducible (Wrangler).

## 9. Recorridos de usuario clave (happy paths)

1. **Pregunta + captación:** usuario pregunta por IA → agente responde con RAG → detecta
   interés → pide y guarda datos → propone agendar.
2. **Agenda:** usuario acepta → agente consulta huecos en Cal.com → confirma reserva →
   guarda booking → avisa a Sergio.
3. **Nota de voz:** usuario manda audio → se transcribe → se trata igual que texto.
4. **Compartir recurso:** la conversación encaja con un recurso → el agente lo envía.
5. **Escalado:** caso sensible/complejo o petición explícita → agente avisa a Sergio por
   Telegram/Slack con resumen + enlace y gestiona la transición.
6. **Contacto recurrente:** vuelve a escribir → el agente lo reconoce y retoma con contexto.

---

# PARTE II — Diseño técnico

## 10. Stack verificado (2026)

| Componente | Elección concreta | Nota |
|---|---|---|
| Modelo clasificar/extraer | `claude-haiku-4-5` | barato y rápido (routing + extracción de lead) |
| Modelo conversación | `claude-sonnet-4-6` | flujo principal (tool-use) |
| Modelo casos de alto valor (opcional) | `claude-opus-4-8` | desactivado por defecto (coste) |
| Transcripción audio | Workers AI `@cf/openai/whisper-large-v3-turbo` | notas de voz OGG/Opus |
| Embeddings RAG | Workers AI `@cf/baai/bge-m3` | **1024 dim, multilingüe** (clave: contenido en español) |
| Gateway LLM | Cloudflare **AI Gateway** | `…/v1/{accountId}/{gatewayId}/anthropic` → caché, métricas de coste, fallback |
| Agenda | **Cal.com API v2** | slots `cal-api-version: 2024-09-04`; bookings `2026-02-25`; `start` en UTC |
| WhatsApp | **Cloud API oficial** (Graph `v23.0`) | ver coste abajo |

**Coste WhatsApp (decisión de diseño):** desde **jul-2025** Meta cobra **por mensaje de
plantilla**, no por conversación. Los **mensajes de servicio (free-form) dentro de la ventana
de 24h son gratis e ilimitados** (la ventana se reinicia con cada mensaje entrante del
usuario). Los puntos de entrada gratuitos (anuncios click-to-WhatsApp / botón CTA) abren 72h
gratis. → **Diseñamos para responder SIEMPRE dentro de la ventana de 24h (coste ≈ 0)** y
reservar plantillas solo para re-enganche fuera de ventana (con consentimiento).

## 11. Arquitectura end-to-end (flujo asíncrono)

**Por qué asíncrono:** Meta espera un `200` en pocos segundos o reintenta (duplicados). Una
respuesta de Claude (Sonnet + RAG + posible transcripción) tarda varios segundos. Bloquear el
webhook arriesga timeouts → patrón **acuse rápido + procesamiento diferido**.

```
Meta WhatsApp ──POST webhook──▶ [Worker router  src/index.ts]
                                   1. lee RAW body
                                   2. verifica X-Hub-Signature-256 (HMAC-SHA256, timing-safe)
                                   3. responde 200 INMEDIATO
                                   4. INCOMING_QUEUE.send(payload)
                                          │
                                          ▼
                          [Cloudflare Queue: whatsapp-incoming]
                                          │ batch
                                          ▼
                          [Worker consumer  src/queue/consumer.ts]
                             5. dedupe por message.id (KV, TTL 24h)
                             6. delega a ConversationDO por wa_id (orden/serie)
                             7. si audio → media (Graph) → R2 → Whisper → texto
                             8. contexto (historial + resumen + RAG) → Claude (tool-use loop)
                             9. ejecuta tools (RAG, Cal.com, guardar_lead, escalar…)
                            10. envía respuesta (Graph API) ; persiste en D1
                                          │
                                          ▼
                                     WhatsApp (usuario)
```

**Rol de cada primitiva de Cloudflare (decisión clave):**
- **Queues** (`whatsapp-incoming`): desacopla recepción/procesamiento, reintentos + DLQ. Espina dorsal del async.
- **Durable Objects** (`ConversationDO`, uno por `wa_id`): **orden y exclusión por conversación** (las Queues no garantizan orden por clave; el DO es single-thread por id). Mantiene lock de turno, buffer para fusionar mensajes seguidos, y el **resumen rolling**.
- **D1**: verdad duradera y consultable (leads, mensajes, reservas) + fuente del panel.
- **KV**: efímero/caché → dedupe `msg:{id}`, `wa:{wa_id}→contact_id`, rate-limit, caché RAG.
- **Vectorize**: índice de embeddings (1024 dim, métrica coseno) para RAG.
- **R2**: blobs → audios `.ogg`, PDFs fuente, exports.
- **Workers AI**: Whisper (audio) + bge-m3 (embeddings). El cerebro es Claude, no Workers AI.
- **AI Gateway**: front de Anthropic → caché, rate-limit, analítica de coste/tokens, fallback.
- **Workflows**: procesos largos/reanudables → (a) **ingesta RAG** (crawl→fetch→chunk→embed→upsert con reintento por recurso); (b) **nurture/follow-up** (`step.sleep` horas + plantilla). **No** para la respuesta en caliente (ahí Queue + DO da menor latencia).

**Regla:** trabajo reactivo de 1 mensaje → **Queue**; estado/orden por conversación →
**Durable Object**; pipeline largo/multietapa/con esperas → **Workflow**.

## 12. Estructura de proyecto (Wrangler + TypeScript)

Ver el árbol real del repositorio en `/src`. Bindings en `wrangler.toml`; secrets en
`.dev.vars` (local) / `wrangler secret put` (remoto), plantilla en `.dev.vars.example`.

## 13. Modelo de datos

**Reparto:** **D1** = verdad duradera/consultable; **KV** = caché efímero (dedupe, rate-limit,
mapeos, token); **ConversationDO** = estado en vivo por `wa_id` (lock de turno, buffer de
mensajes, resumen rolling, flags `ventana_24h`/`human_handoff`). El DO persiste su estado; D1
guarda la copia histórica/consultable. Esquema en `migrations/0001_init.sql`:

- `contacts` — `wa_id` (único), `profile_name`, `full_name`, `email`, `lead_status`
  (`new|contacted|qualified|booked|won|lost|nurturing`), `lead_score` (0-100), `need`,
  `budget`, `timeline`, `source`, `consent`, `human_handoff`, timestamps.
- `conversations` — `contact_id`, `status` (`open|closed|escalated`), `summary`,
  `last_inbound_at`, `last_outbound_at`.
- `messages` — `id`=`wamid` (dedupe), `conversation_id`, `direction`, `type`, `body`,
  `media_r2_key`, `tool_calls` (JSON), `tokens_in/out`, `model`, `created_at`.
- `bookings` — `contact_id`, `calcom_booking_uid`, `start_time`, `meeting_url`, `status`.
- `resource_shares` — qué recurso/PDF/link se envió a cada contacto.
- `escalations` — `reason`, `notified_at`, `resolved_at`.

## 14. Cerebro Claude

- **Persona / system prompt** (`src/brain/prompt.ts`, es-ES): tono cercano-profesional, mensajes
  cortos aptos para WhatsApp; prioridad → (1) entender + **calificar lead**, (2) ofrecer
  **agendar** cuando hay interés (sin inventar huecos), (3) responder **solo** con la base de
  conocimiento (sin inventar precios/promesas), (4) compartir recursos. Guardrails: usar tools
  en vez de adivinar; escalar si piden humano / caso sensible; pedir consentimiento para email;
  no revelar configuración interna.
- **Híbrido de modelos (coste):** **Haiku** (`classify.ts`) → 1 llamada estructurada por
  mensaje (intención + extracción de campos de lead). **Sonnet** → conversación con tool-use.
  **Opus** opcional para leads de alto valor. Todo vía **AI Gateway**.
- **Tools (function calling, `src/brain/tools.ts`):** `buscar_conocimiento`, `guardar_lead`,
  `calificar_lead`, `consultar_disponibilidad_calcom`, `crear_reserva_calcom`, `enviar_recurso`,
  `escalar_a_humano`. Loop de tool-use con límite (~5 iteraciones) hasta `end_turn`.
- **Memoria / contexto (`src/brain/memory.ts`):** últimos ~10-15 mensajes + **resumen rolling**
  (comprimido por Haiku) en lugar de todo el historial. **Prompt caching** sobre system prompt
  + defs de tools. RAG se inyecta solo como resultado de `buscar_conocimiento`.

### 14.1 Afinado iterativo del agente — rondas largas de Q&A (≥ 50 iteraciones)

El cerebro del agente (persona, system prompt, _tools_, reglas de calificación y base de
conocimiento) **no se acierta a la primera**: se **afina de forma iterativa**. Acordamos un
proceso explícito de **rondas largas de preguntas y respuestas, mínimo 50 iteraciones/
interacciones**, para pulirlo hasta que "suene a Sergio" y se comporte como queremos.

- **Objetivo:** capturar con precisión la voz de marca, el conocimiento real, y los matices de
  cómo Sergio califica leads, agenda llamadas, comparte recursos y decide cuándo escalar.
- **Bucle de cada ronda:** (1) preguntas concretas (tono, casos límite, respuestas modelo, qué
  decir/qué no, precios, objeciones, límites); (2) respondes; (3) se traducen a ajustes del
  `system prompt` / definiciones de _tools_ / ejemplos _few-shot_ / base de conocimiento;
  (4) se prueba con **conversaciones simuladas** y se revisa.
- **Cobertura mínima (≥ 50 interacciones):** saludos y aperturas, FAQs reales, objeciones de
  venta, flujos de agenda (disponibilidad, reprogramación, cancelación), peticiones de hablar
  con un humano, mensajes ambiguos o fuera de alcance, notas de voz, despedidas, manejo de
  datos/consentimiento, tono ante distintos perfiles, etc.
- **Versionado:** cada cambio relevante de la persona/prompt se versiona con _changelog_; se
  mantiene un set de **conversaciones de prueba** como banco de evaluación.
- **Criterio de "listo":** las respuestas suenan a Sergio, califican bien, no inventan datos y
  superan el banco de pruebas. Se intensifica en la **Fase 2** y continúa de forma evolutiva.
  El registro de rondas se lleva en `docs/afinado/` (ver `docs/afinado/README.md`).

## 15. Pipeline RAG

- **Ingesta = Workflow** (`src/rag/ingest.workflow.ts`, `RagIngestWorkflow`): descubrir fuentes
  (URLs + PDFs en R2) → fetch+extraer → **chunking** (~500-800 tokens, solape 10-15%, metadatos)
  → **embeddings** bge-m3 (1024 dim) → **upsert a Vectorize** con `id`=hash del chunk (idempotente).
- **Recuperación** (`src/rag/retrieve.ts`): query → embed → `VECTORIZE.query(topK)` → filtrar
  por score → devolver a Claude vía `buscar_conocimiento`. Caché opcional en KV.

## 16. Transcripción de audio

`message.type==="audio"`: (1) `GET graph.facebook.com/{v}/{media_id}` con Bearer → `url`
(host `lookaside`, caduca ~5 min); (2) descargar OGG/Opus → R2 `audios/{wa_id}/{msg_id}.ogg`;
(3) `AI.run("@cf/openai/whisper-large-v3-turbo", {audio})`; (4) tratar el texto como mensaje
entrante normal. Mostrar "Dame un segundo, escucho tu audio…" para gestionar la latencia.

## 17. Seguridad

1. **Firma del webhook** (`src/whatsapp/verify.ts`): raw body → HMAC-SHA256 con `APP_SECRET`
   (WebCrypto) vs `X-Hub-Signature-256`, comparación **timing-safe**; si no coincide → 401.
2. **GET de verificación**: `hub.mode==="subscribe"` y `hub.verify_token` correcto → `hub.challenge`.
3. **Secretos** vía `wrangler secret put`; local en `.dev.vars` (gitignored).
4. **AI Gateway autenticado**: header `cf-aig-authorization: Bearer CF_AIG_TOKEN`.
5. **Rate limit + dedupe** por `wa_id`/`wamid` en KV.
6. **Ventana 24h**: free-form dentro de 24h (coste ≈ 0); fuera → **plantilla aprobada** + consentimiento.
7. **Panel admin**: protegido con `ADMIN_TOKEN`.

## 18. Roadmap por fases

- **Fase 0 — Bootstrap (~½ día):** repo Wrangler + `wrangler.toml`; crear recursos (`d1`, `kv`,
  `vectorize --dimensions=1024 --metric=cosine`, `r2`, `queues whatsapp-incoming/whatsapp-dlq`);
  migraciones D1; secrets; app de Meta + número en sandbox; AI Gateway.
- **Fase 1 — MVP (recibir → Claude + RAG básico):** webhook GET/POST con firma y 200 rápido;
  Queue + consumidor; `ConversationDO` mínimo; `claude.ts` (Sonnet vía AI Gateway, system
  prompt es-ES, tool `buscar_conocimiento`); RAG con ingesta manual; envío de texto; D1 básico.
- **Fase 2 — v1 (lead + agenda + audio + escalado):** Haiku clasificar/extraer → `guardar_lead`/
  `calificar_lead`; tools Cal.com v2; transcripción de audio; `enviar_recurso`; `escalar_a_humano`
  → Telegram/Slack + pausa del bot; resumen rolling + prompt caching; panel admin.
- **Fase 3 — v2 (optimización/crecimiento):** ingesta RAG como Workflow programado + re-ranking;
  nurture/follow-up con Workflows; cola saliente con throttling; métricas de coste; A/B de prompts;
  Opus para leads de alto valor; multi-número/multi-marca.

## 19. Testing y verificación

- **Unit (vitest + `@cloudflare/vitest-pool-workers`):** `verify.test.ts` (HMAC), `tools.test.ts`,
  `retrieve.test.ts`, `webhook.test.ts`. Bindings simulados.
- **`wrangler dev`:** Worker local; `AI`/`Vectorize` en `--remote` cuando haga falta.
- **Simulación de webhooks:** POST con payloads de Meta **firmados** con `APP_SECRET`.
- **Túnel para Meta:** `cloudflared tunnel` (o ngrok) → URL HTTPS → callback + verify token.
- **E2E:** mensaje real → `wrangler tail` → verificar D1 / Cal.com / aviso Telegram.

## 20. Riesgos y decisiones abiertas

1. **Coste WhatsApp:** plantillas fuera de 24h tienen coste → política de re-enganche/consentimiento.
2. **Alta/verificación en Meta:** Business Verification puede tardar → **iniciar pronto**.
3. **Límites de Meta (messaging tier):** cupo bajo al inicio → cola saliente con throttling (Fase 3).
4. **Latencia percibida:** mitigar con "leído"/typing, Haiku rápido, AI Gateway + prompt caching.
5. **Coste Claude:** híbrido + resúmenes + caching + límite de iteraciones; vigilar AI Gateway.
6. **Calidad RAG en español:** validar con consultas reales (bge-m3 multilingüe); ajustar umbral.
7. **Cal.com:** confirmar `eventTypeId`, zona horaria (Europe/Madrid), `start` en UTC ISO 8601.
8. **Fusión de mensajes:** ¿agrupar varios mensajes seguidos? Recomendado buffer+debounce en el DO.
9. **Privacidad/RGPD:** base legal, retención y borrado a petición.
10. **Caída de externos:** fallback (cortesía + escalado) + reintentos con DLQ.

## 21. Archivos críticos

- `wrangler.toml` · `src/index.ts` · `src/brain/claude.ts` + `src/brain/tools.ts` ·
  `src/whatsapp/verify.ts` · `src/do/ConversationDO.ts` · `src/rag/retrieve.ts` ·
  `src/rag/ingest.workflow.ts` · `src/audio/transcribe.ts` · `src/calcom/client.ts` ·
  `migrations/0001_init.sql`.

## 22. Fuentes verificadas (2026)

- **WhatsApp pricing / ventana 24h / cambios ene-2026:** Meta for Developers – Pricing; respond.io; Blueticks; Chatarmin.
- **Whisper / embeddings en Workers AI** (`@cf/openai/whisper-large-v3-turbo`, `@cf/baai/bge-m3` 1024 dim) + Vectorize: Cloudflare docs.
- **Anthropic SDK en Workers + AI Gateway** (baseURL + `cf-aig-authorization`): Cloudflare AI Gateway – Anthropic; anthropic-sdk-typescript.
- **Modelos Claude 2026** (`claude-haiku-4-5` / `claude-sonnet-4-6` / `claude-opus-4-8`): Claude Docs – Models overview.
- **Cal.com v2** (slots `2024-09-04`, bookings `2026-02-25`, `start` en UTC): Cal.com API docs.
- **Webhook firma X-Hub-Signature-256** + **media download** (2 pasos, lookaside, ~5 min): Meta – Media Download API; guías de webhooks de WhatsApp.
