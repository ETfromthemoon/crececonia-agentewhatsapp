# Bitácora de afinado del agente (rondas de Q&A)

Registro de las rondas largas de preguntas y respuestas con las que afinamos el cerebro del
agente (persona, system prompt, tools, reglas de calificación y base de conocimiento).
Objetivo: **mínimo 50 iteraciones** (ver `docs/PRD.md` §14.1).

## Cómo funciona cada ronda
1. **Preguntas** concretas (tono, casos límite, respuestas modelo, qué decir / qué no, precios,
   objeciones, límites).
2. **Respuestas** de Sergio.
3. **Cambios** derivados: ajustes en `src/brain/prompt.ts`, `src/brain/tools.ts`, ejemplos
   _few-shot_ o base de conocimiento — anotados en el changelog de la ronda.
4. **Pruebas** con conversaciones simuladas y revisión.

## Índice de rondas
- [Ronda 01 — Descubrimiento](./ronda-01.md) · ✅ completada
- [Ronda 02 — Identidad, regalo, precio y saludo](./ronda-02.md) · ✅ completada
- [Ronda 03 — Llamada, presupuesto, no-clientes y voz](./ronda-03.md) · ✅ completada
- [Ronda 04 — Objeciones, seguimiento, cierre y cursos](./ronda-04.md) · ✅ completada

## Changelog del prompt/persona
| Fecha | Ronda | Cambio | Archivo |
|---|---|---|---|
| — | 00 | Persona base v0 | `src/brain/prompt.ts` |
| 2026-06 | 01 | Persona Crececonia (es-CL): posicionamiento, tono, oferta, precios→llamada, calificación, escalado, alcance de marca | `src/brain/prompt.ts`, `src/config.ts`, `src/brain/tools.ts`, `src/db/leads.ts` |
| 2026-06 | 02 | Nombre **Nia**, ejemplos few-shot (saludo/precio/regalo), catálogo de recursos | `src/brain/prompt.ts`, `src/config.ts`, `src/resources.ts`, `src/brain/toolHandlers.ts` |
| 2026-06 | 03 | Llamada 30 min, calificación por señales, manejo de no-clientes, voz chilena suave | `src/brain/prompt.ts`, `src/config.ts` |
| 2026-06 | 04 | Objeciones (empatía+reencuadre), cierre proactivo, cursos, **seguimiento automático** (cron + `followup_sent`) | `src/brain/prompt.ts`, `src/resources.ts`, `src/followup/followup.ts`, `src/index.ts` |
