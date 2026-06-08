# Ronda 12 — Embudo comercial: llamada exploratoria vs diagnóstico

> Aclaración crítica de la Ronda 11: separar la **llamada gratis** del **diagnóstico pagado**.

## Decisiones (de Sergio)
- **La llamada gratis se llama "llamada exploratoria"** (antes el prompt la llamaba "de diagnóstico",
  lo que chocaba con el servicio pagado).
- **Mapeo** = parte de la **calificación**: evaluar el estado del prospecto (etapa de venta) y qué
  está haciendo hoy. Nia participa de esto al calificar.
- **Diagnóstico** = **servicio pagado** (ya como cliente): evaluar el negocio y definir dónde
  implementar IA en los procesos.
- **La llamada viene SIEMPRE después de calificar** y solo si hay intención real y el servicio sirve.
  (Confirma el comportamiento que Nia ya tenía.)

## Embudo resultante
Pre-venta: **mapeo** (en la calificación) → **llamada exploratoria** (gratis, ~30 min, si hay fit).
Cliente: **diagnóstico** (pagado) → **planificación** → **implementación**, con acompañamiento hasta
el uso real y el ROI.

## Cambios implementados
- `src/brain/prompt.ts`: renombrado "llamada de diagnóstico" → **"llamada exploratoria"** en todo el
  prompt (objetivo 2, precios, ejemplos); reescrito el bloque "Cómo trabajamos" con el embudo correcto
  + guardia explícita ("la exploratoria es gratis; el diagnóstico es pagado; no los confundas").
- `src/config.ts`: comentario de `CALL_DURATION_MIN` actualizado.
- `docs/kb/crececonia.md`: sección "Cómo trabajamos" reescrita (pre-venta vs cliente), definiciones de
  mapeo/diagnóstico, aviso de no confundir; checklist actualizado.
- `docs/afinado/playbook.md`: renombres en los escenarios.

## Próxima ronda (conocimiento)
- Descripción exacta de cada servicio (1 línea).
- FAQs reales + casos/resultados.
