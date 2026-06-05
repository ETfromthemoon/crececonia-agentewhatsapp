# Ronda 03 — Llamada, presupuesto, no-clientes y voz

## Decisiones
- **Llamada:** diagnóstico de **30 min** sin costo (define el eventType de Cal.com).
- **Presupuesto/interés:** **inferir por señales** (empresa, urgencia, tipo de proyecto); no
  preguntar el presupuesto de forma directa.
- **No-clientes** (estudiante/particular/curioso): ayudar con valor + recurso de regalo + invitar a
  seguir @crececoniacl; no insistir con la llamada → los convierte en alcance.
- **Voz:** chileno suave (modismos ligeros: "bacán", "al tiro").

## Cambios implementados
- `src/config.ts`: `CALL_DURATION_MIN = 30`.
- `src/brain/prompt.ts`: tono chileno suave; calificación por señales (sin preguntar presupuesto);
  llamada de 30 min; manejo de no-clientes; ejemplo de precio actualizado.

## Pendiente
- Crear en Cal.com el eventType de 30 min y poner su id en `CALCOM_EVENT_TYPE_ID` (wrangler.toml).
