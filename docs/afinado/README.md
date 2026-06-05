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

## Changelog del prompt/persona
| Fecha | Ronda | Cambio | Archivo |
|---|---|---|---|
| — | 00 | Persona base v0 | `src/brain/prompt.ts` |
| 2026-06 | 01 | Persona Crececonia (es-CL): posicionamiento, tono, oferta, precios→llamada, calificación, escalado, alcance de marca | `src/brain/prompt.ts`, `src/config.ts`, `src/brain/tools.ts`, `src/db/leads.ts` |
