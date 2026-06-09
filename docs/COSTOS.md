# Costos estimados — Agente de WhatsApp (Nia)

> Estimación para **lanzar y operar** el agente. Precios verificados (2026). Los números reales
> dependen del volumen, el largo de las conversaciones, cuánto se use RAG y las notas de voz.
> Tipo de cambio referencial: ~$950 CLP/USD (varía).

## 1. Para lanzar (encender el agente)

**Lo único que pagas para arrancar:**

| Qué | Costo | Nota |
|---|---|---|
| **Cloudflare Workers (plan pago)** | **US$5/mes** | Único pago fijo obligatorio (Durable Objects + Queues lo requieren). Incluye D1, KV, Vectorize, R2, colas. |
| **Número de WhatsApp dedicado** | **US$0** | Usas un número **tuyo** que no esté activo en la app de WhatsApp. Meta no cobra por el número ni por la Cloud API, y como vamos directo (sin BSP tipo Twilio) no hay comisiones. Opcional: un número virtual dedicado (~US$1–5/mes) si no quieres usar uno propio. |
| **API de Claude (Anthropic)** | **pago por uso** | Sin cuota fija. Solo cargas un **saldo inicial** (~US$10–20) y de ahí pagas por conversación (~US$0.10 c/u). |

**Gratis, pero necesario para completar el lanzamiento:**
- **Verificación de negocio en Meta:** gratis, pero **tarda días** → es el cuello de botella de *tiempo* (conviene iniciarla pronto).
- AI Gateway (Cloudflare), Cal.com (plan gratis), bot de Telegram (escalado), dominio (ya lo tienes).
- **Código:** ya está hecho y testeado. Sin costo de desarrollo.

**Desembolso para encender:** ~US$5/mes (Cloudflare) + ~US$10–20 de saldo inicial en Claude. El número, gratis. → **Primer mes ≈ US$15–25**, y de ahí el uso de Claude según volumen.

## 2. Costo del "cerebro" (Claude) — el principal variable
Precios por 1M de tokens (Anthropic, 2026):

| Modelo | Uso en el agente | Input | Output | Caché lectura | Caché escritura |
|---|---|---|---|---|---|
| **Sonnet 4.6** | conversación (principal) | $3.00 | $15.00 | $0.30 | $3.75 |
| **Haiku 4.5** | clasificar/extraer + resumen | $1.00 | $5.00 | $0.10 | $1.25 |
| Opus 4.8 | opcional (leads de alto valor; off) | $5.00 | $25.00 | $0.50 | $6.25 |

**Optimizaciones ya implementadas que bajan el costo:**
- **Prompt caching:** el system prompt + las tools (~2.500-3.000 tokens) se cachean → tras el primer
  turno se leen a 0.1× (90% más barato).
- **Modelo híbrido:** Haiku (barato) clasifica en paralelo; Sonnet solo conversa.
- **Resumen rolling:** se manda un resumen en vez de todo el historial.
- **Rate limit + dedupe:** frenan abuso y reintentos (evitan gastos sorpresa).

**Costo por conversación** (≈6 turnos, respuestas cortas, RAG en ~la mitad):
≈ **US$0.08 – US$0.15** (típico **~US$0.10**, ~$95 CLP). Conversaciones cortas cuestan menos;
con mucha búsqueda/varias tools, más.

## 3. Infraestructura (Cloudflare) y canales
| Servicio | Costo mensual | Nota |
|---|---|---|
| **Cloudflare Workers (plan pago)** | **US$5** | Requerido por Durable Objects + Queues; incluye cuotas generosas de D1, KV, Vectorize, R2, DO. |
| **Workers AI** (Whisper + embeddings) | **US$0 – $5** | 10.000 neuronas/día gratis; a bajo/medio volumen suele ser $0. |
| **AI Gateway** | **US$0** | Solo caché/métricas; sin costo extra. |
| **WhatsApp Cloud API** | **~US$0** | Los mensajes de servicio (free-form) dentro de la ventana de 24h son **gratis**. Diseñamos para responder siempre dentro de 24h. Solo las plantillas de re-enganche fuera de ventana cuestan (no se usan en el MVP). |
| **Cal.com** | **US$0 – $15** | El plan gratis suele bastar; ~$15/mes si quieres features de equipo. |
| **Telegram** (escalado) | **US$0** | Gratis. |

## 4. Total mensual estimado (según volumen)

| Volumen | Claude | + Infra/canales | **Total/mes** | ≈ CLP |
|---|---|---|---|---|
| Arranque (~100 conv) | ~$10 | ~$5–$20 | **~US$15–$30** | ~$14.000–$28.000 |
| Medio (~500 conv) | ~$50 | ~$5–$20 | **~US$55–$70** | ~$52.000–$66.000 |
| Alto (~1.000 conv) | ~$100 | ~$5–$20 | **~US$105–$120** | ~$100.000–$114.000 |

## 5. Palancas si quieres ajustar el costo
- **Modelo:** Sonnet es el equilibrio. Para leads de alto valor puedes activar Opus (más caro);
  para volumen masivo simple, Haiku (más barato, menos fino). Se cambia en `src/config.ts`.
- **Largo de respuestas / historial:** ya están acotados (`MAX_OUTPUT_TOKENS`, `HISTORY_WINDOW`).
- **RAG:** `RAG_TOP_K` controla cuántos fragmentos se recuperan (menos = más barato).
- **Rate limit:** `RATE_LIMIT_PER_MINUTE` topa el gasto por usuario.

## 6. Lectura de negocio
A **~US$0.10 por conversación**, atender 500 conversaciones al mes cuesta ~US$50–70 en total.
Si de esas sale **un** proyecto de consultoría, el retorno cubre meses de operación. El costo por
lead calificado es marginal frente al valor de la conversación con Sergio.
