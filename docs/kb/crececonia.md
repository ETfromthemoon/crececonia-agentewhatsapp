# Crececonia — Base de conocimiento (semilla para RAG)

> Documento vivo: fuente de verdad para las respuestas de Nia. Se afina por rondas (ver
> `docs/afinado/`). Para cargarlo a la base de conocimiento (Vectorize) cuando haya credenciales:
>
> ```bash
> curl -X POST "https://<worker>/admin/ingest-text" -H "authorization: Bearer $ADMIN_TOKEN" \
>   -H 'content-type: application/json' \
>   --data-binary @<(jq -Rs '{source:"crececonia-kb", text:.}' docs/kb/crececonia.md)
> ```
>
> Última actualización: 2026-06-08 (Ronda 11).

## Qué es Crececonia
Marca de IA aplicada para PYMEs. Ayudamos a negocios **en marcha** a ahorrar horas y vender más con
IA. Trabajamos **100% online** (videollamada), así atendemos pymes de **todo Chile**.

## Servicios
1. **Automatización de atención al cliente** — _(descripción exacta a confirmar; p. ej. asistentes/
   bots que responden a clientes en WhatsApp/web)._
2. **Automatización de procesos internos** — _(a confirmar; p. ej. tareas repetitivas y flujos
   administrativos)._
3. **Capacitación de equipos** — formación para que el equipo use la IA en su día a día.

Además: **cursos básicos** (hoy en PDF, pronto en video) y **recursos de regalo** (p. ej. un pack de
prompts para pymes).

## Cómo trabajamos — proceso de acompañamiento punta a punta
1. **Mapeo** — _(a confirmar: entender cómo trabaja hoy el negocio / sus procesos)._
2. **Diagnóstico** — _(a confirmar: detectar dónde la IA aporta más valor / cuellos de botella)._
3. **Planificación de la implementación** — definir el plan y las herramientas.
4. **Implementación** — poner en marcha las herramientas y acompañar su adopción.

Acompañamos **desde el inicio hasta el uso real**, cuidando que el equipo adopte de verdad las
herramientas hasta ver el **retorno de la inversión (ROI)**.

## Qué nos diferencia
- **Acompañamiento de punta a punta:** no solo entregamos una herramienta; acompañamos desde el inicio
  hasta la implementación y el uso real.
- **Inversión asegurada / ROI:** cuidamos que la inversión del equipo rinda hasta ver el retorno.
- **Trato cercano y responsable** con las herramientas y decisiones, pensando en el bienestar del
  cliente.

## Para quién es (y para quién no)
- **Sí:** negocios **en marcha** que quieren **escalar, automatizar o liberar tiempo**.
- **No (todavía):** quienes **recién parten** y aún **no tienen cuellos de botella**. Se les ayuda con
  valor y recursos de regalo, sin forzar la llamada.

## Pendiente de completar (próximas rondas)
- [ ] Descripción exacta de cada servicio (1 línea por servicio).
- [ ] Qué pasa en **mapeo** vs **diagnóstico**.
- [ ] Cómo encaja la **llamada de diagnóstico gratis (30 min)** con el "diagnóstico" del proceso.
- [ ] **FAQs reales** y sus respuestas.
- [ ] **Casos/resultados** reales (aunque sean anonimizados).
- [ ] Precios/rangos orientativos (si se decide compartir alguno → `PRICE_RANGE_HINT`).
