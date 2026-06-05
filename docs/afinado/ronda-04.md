# Ronda 04 — Objeciones, seguimiento, cierre y cursos

## Decisiones
- **Objeciones** ("no tengo tiempo", "¿sirve para mi rubro?", "suena caro"): empatía + reencuadre
  hacia el beneficio con una pregunta breve, sin presionar.
- **Seguimiento:** sí, **1 recordatorio suave** dentro de las 24h si el lead deja en visto.
- **Cierre:** proactiva pero respetuosa (propone; si dudan, insiste 1 vez con un beneficio).
- **Cursos (PDF):** informar breve + captar email + compartir cómo acceder/comprar; nutrir, sin
  forzar la llamada.

## Cambios implementados
- `src/brain/prompt.ts`: manejo de objeciones (con ejemplo), cierre proactivo-respetuoso, flujo de
  cursos (recurso `curso_ia_basico`).
- `src/resources.ts`: recurso `curso_ia_basico`.
- **Seguimiento (feature):** `src/followup/followup.ts` + `scheduled()` en `src/index.ts` +
  columna `followup_sent` en `conversations` (se reinicia al recibir un mensaje entrante).
  Envía un recordatorio único dentro de la ventana de 24h (coste 0).

## Pendiente
- URL real del curso (`src/resources.ts`).
- Ajustar la frecuencia del cron en `wrangler.toml` si se quiere un seguimiento más fino.
