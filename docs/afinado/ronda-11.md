# Ronda 11 — Conocimiento real de la marca (cimientos)

> Cambio de fase: de **decisiones de comportamiento** (rondas 1-10) a **conocimiento real** que Nia
> debe saber. Alimenta el prompt + la base de conocimiento (RAG).

## Capturado (de Sergio)
- **Servicios:** automatización de atención al cliente, automatización de procesos internos y
  capacitación de equipos.
- **Cómo trabaja (proceso):** mapeo → diagnóstico → planificación de la implementación → implementación.
- **Diferenciador:** acompañamiento de punta a punta (del inicio al uso real), asegurando la inversión
  del equipo y el ROI; trato cercano y responsable con las herramientas y decisiones, por el bienestar
  del cliente.
- **Para quién SÍ:** negocios en marcha que quieren escalar, automatizar o liberar tiempo.
- **Para quién NO:** los que recién parten y aún no tienen cuellos de botella.

## Cambios implementados
- `src/brain/prompt.ts`: enriquecido "Qué es Crececonia" con los 3 servicios; nuevo bloque "Cómo
  trabajamos" (proceso + diferenciador + público objetivo); ampliado el "no público" para incluir
  "negocio que recién parte sin cuellos de botella".
- `docs/kb/crececonia.md`: **documento semilla del RAG** con qué es, servicios, proceso, diferenciador
  y público; con checklist de lo que falta por completar.

## Pendiente de aclarar (preguntado a Sergio)
- Qué ocurre en **mapeo** vs **diagnóstico** (una línea de cada uno).
- Cómo encaja la **llamada de diagnóstico gratis (30 min)** con el "diagnóstico" del proceso (que no
  se confundan).
- Descripción exacta de cada servicio.

## Próximas rondas (conocimiento)
- FAQs reales + respuestas modelo.
- Casos/resultados reales (anonimizados).
