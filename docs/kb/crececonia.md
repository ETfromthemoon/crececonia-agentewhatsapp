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
> Última actualización: 2026-06-08 (Ronda 12).

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

## Cómo trabajamos — del primer contacto a la implementación
**Antes de ser cliente (pre-venta):**
1. **Mapeo** — parte de la **calificación**: evaluamos el estado del prospecto (su etapa de venta) y
   qué está haciendo hoy, para ver si el servicio le sirve.
2. **Llamada exploratoria** (gratis, ~30 min) — solo si hay fit e intención reales: una primera
   conversación para conocernos y ver cómo podemos ayudar. _No es el diagnóstico._

**Ya como cliente (servicio contratado):**
3. **Diagnóstico** (servicio pagado) — evaluamos el negocio a fondo y definimos **dónde implementar IA
   en los procesos**.
4. **Planificación de la implementación** — definimos el plan y las herramientas.
5. **Implementación** — ponemos en marcha las herramientas y acompañamos su adopción.

Acompañamos **desde el inicio hasta el uso real**, cuidando que el equipo adopte de verdad las
herramientas hasta ver el **retorno de la inversión (ROI)**.

> ⚠️ No confundir: la **llamada exploratoria** es gratis (para conocerse, tras calificar); el
> **diagnóstico** es un servicio pagado, ya como cliente.

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
- [ ] **FAQs reales** y sus respuestas.
- [ ] **Casos/resultados** reales (aunque sean anonimizados).
- [ ] Precios/rangos orientativos (si se decide compartir alguno → `PRICE_RANGE_HINT`).

## Resuelto
- ✅ **Mapeo** = parte de la calificación (evaluar estado del prospecto y qué hace hoy).
- ✅ **Diagnóstico** = servicio pagado (ya cliente), evalúa el negocio y dónde aplicar IA.
- ✅ La llamada gratis se llama **"llamada exploratoria"** (no "de diagnóstico").
