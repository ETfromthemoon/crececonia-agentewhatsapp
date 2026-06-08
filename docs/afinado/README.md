# Bitácora de afinado del agente (rondas de Q&A)

Registro de las rondas largas de preguntas y respuestas con las que afinamos el cerebro del
agente (persona, system prompt, tools, reglas de calificación y base de conocimiento).
Objetivo: **mínimo 50 iteraciones** (ver `docs/PRD.md` §14.1). ✅ Alcanzado en la Ronda 10; el afinado
continúa de forma evolutiva con conversaciones reales.

## Cómo funciona cada ronda
1. **Preguntas** concretas (tono, casos límite, respuestas modelo, qué decir / qué no, precios,
   objeciones, límites).
2. **Respuestas** de Sergio.
3. **Cambios** derivados: ajustes en `src/brain/prompt.ts`, `src/brain/tools.ts`, ejemplos
   _few-shot_ o base de conocimiento — anotados en el changelog de la ronda.
4. **Pruebas** con conversaciones simuladas y revisión.

## Banco de pruebas
- [Banco de conversaciones de prueba (playbook)](./playbook.md) — 10 escenarios + checklist de
  validación. Fixtures estructuradas en `test/fixtures/conversations.json`.

## Índice de rondas
- [Ronda 01 — Descubrimiento](./ronda-01.md) · ✅ completada
- [Ronda 02 — Identidad, regalo, precio y saludo](./ronda-02.md) · ✅ completada
- [Ronda 03 — Llamada, presupuesto, no-clientes y voz](./ronda-03.md) · ✅ completada
- [Ronda 04 — Objeciones, seguimiento, cierre y cursos](./ronda-04.md) · ✅ completada
- [Ronda 05 — Idiomas, confirmación, postventa y robustez](./ronda-05.md) · ✅ completada
- [Ronda 06 — Privacidad, botones, nombre y escalado](./ronda-06.md) · ✅ completada
- [Ronda 07 — Reagendar/cancelar, precio, disponibilidad y despedida](./ronda-07.md) · ✅ completada
- [Ronda 08 — Garantías, borrado de datos, fusión de mensajes y apertura](./ronda-08.md) · ✅ completada
- [Ronda 09 — Spam, imágenes/archivos, urgencia y pago de cursos](./ronda-09.md) · ✅ completada
- [Ronda 10 — Contacto recurrente, registro, descuentos y modalidad](./ronda-10.md) · ✅ completada (≥50 iteraciones)
- [Ronda 11 — Conocimiento real de la marca (servicios, proceso, diferenciador)](./ronda-11.md) · ✅ completada
- [Ronda 12 — Embudo comercial: llamada exploratoria vs diagnóstico](./ronda-12.md) · ✅ completada
- [Ronda 13 — Servicios al detalle y FAQs](./ronda-13.md) · ✅ completada
- [Ronda 14 — Cierre de FAQs: plazos y aprobación](./ronda-14.md) · ✅ completada

## Changelog del prompt/persona
| Fecha | Ronda | Cambio | Archivo |
|---|---|---|---|
| — | 00 | Persona base v0 | `src/brain/prompt.ts` |
| 2026-06 | 01 | Persona Crececonia (es-CL): posicionamiento, tono, oferta, precios→llamada, calificación, escalado, alcance de marca | `src/brain/prompt.ts`, `src/config.ts`, `src/brain/tools.ts`, `src/db/leads.ts` |
| 2026-06 | 02 | Nombre **Nia**, ejemplos few-shot (saludo/precio/regalo), catálogo de recursos | `src/brain/prompt.ts`, `src/config.ts`, `src/resources.ts`, `src/brain/toolHandlers.ts` |
| 2026-06 | 03 | Llamada 30 min, calificación por señales, manejo de no-clientes, voz chilena suave | `src/brain/prompt.ts`, `src/config.ts` |
| 2026-06 | 04 | Objeciones (empatía+reencuadre), cierre proactivo, cursos, **seguimiento automático** (cron + `followup_sent`) | `src/brain/prompt.ts`, `src/resources.ts`, `src/followup/followup.ts`, `src/index.ts` |
| 2026-06 | 05 | Idioma del usuario, confirmación de reserva, postventa→escalado, robustez ante fallos | `src/brain/prompt.ts` |
| 2026-06 | 06 | Privacidad (permiso email), **botones interactivos** (feature), captura de nombre, "Sergio del equipo" | `src/brain/prompt.ts`, `src/whatsapp/client.ts`, `src/brain/tools.ts`, `src/whatsapp/types.ts` |
| 2026-06 | 07 | **Reprogramar/cancelar reservas** (tools Cal.com), precio orientativo configurable, disponibilidad 24/7, despedida con puerta abierta | `src/calcom/client.ts`, `src/db/bookings.ts`, `src/brain/tools.ts`, `src/brain/toolHandlers.ts`, `src/brain/prompt.ts`, `src/config.ts` |
| 2026-06 | 08 | Garantías (casos reales sin prometer), **borrado de datos** (tool `borrar_mis_datos`), **fusión de mensajes** (buffer+debounce en el DO, §20.8), apertura mínima | `src/do/ConversationDO.ts`, `src/brain/claude.ts`, `src/db/leads.ts`, `src/brain/tools.ts`, `src/brain/toolHandlers.ts`, `src/brain/prompt.ts`, `src/config.ts` |
| 2026-06 | 09 | Spam/tóxicos (cortar con cortesía), imágenes/archivos (usa caption o pide texto), urgencia→hueco más cercano, pago de cursos por enlace | `src/brain/claude.ts`, `src/brain/prompt.ts` |
| 2026-06 | 10 | Contacto recurrente (saluda por nombre y retoma), registro tú/usted (refleja al usuario), descuentos (no negocia), modalidad 100% online | `src/brain/prompt.ts` |
| 2026-06 | 11 | **Conocimiento real**: 3 servicios, proceso (mapeo→diagnóstico→planificación→implementación), diferenciador (acompañamiento punta a punta + ROI), público objetivo; semilla de RAG | `src/brain/prompt.ts`, `docs/kb/crececonia.md` |
| 2026-06 | 12 | **Embudo comercial**: llamada gratis renombrada a "**llamada exploratoria**"; mapeo = parte de calificación; diagnóstico = servicio pagado; guardia para no confundirlos | `src/brain/prompt.ts`, `src/config.ts`, `docs/kb/crececonia.md`, `docs/afinado/playbook.md` |
| 2026-06 | 13 | **Servicios** con descripción de 1 línea; **FAQ** en el KB (8 preguntas fundadas en lo confirmado; web 403 → no se inventó de terceros) | `src/brain/prompt.ts`, `docs/kb/crececonia.md` |
| 2026-06 | 14 | **Plazos** (~30 a ~90 días) en FAQ y prompt; FAQ aprobadas | `src/brain/prompt.ts`, `docs/kb/crececonia.md`, `docs/afinado/playbook.md` |
