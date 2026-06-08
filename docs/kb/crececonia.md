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
1. **Automatización de atención al cliente** — asistentes/bots que responden a tus clientes 24/7 en
   WhatsApp y/o web.
2. **Automatización de procesos internos** — automatizar tareas repetitivas y administrativas del
   equipo (cotizaciones, correos, reportes, etc.).
3. **Capacitación de equipos** — formar a tu equipo para que use IA en su día a día.

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

## Preguntas frecuentes (FAQ)
> Borrador a partir de lo confirmado en el afinado (no se pudo leer la web: bloquea lectura
> automática, HTTP 403). Revisar/ajustar y reemplazar por el texto real del sitio cuando se pueda.
> Las marcadas con ⚠️ necesitan un dato real de Sergio.

- **¿Esto sirve para mi rubro?** Trabajamos con pymes en marcha de distintos rubros; en la llamada
  exploratoria (sin costo) vemos tu caso puntual.
- **¿Necesito saber de tecnología?** No. Nos encargamos de la parte técnica y, además, capacitamos a
  tu equipo para que la use sin complicarse.
- **¿Cómo parto / cómo es trabajar con ustedes?** Primero una llamada exploratoria sin costo para
  conocernos; si avanzamos, hacemos un diagnóstico, planificamos e implementamos, acompañándote hasta
  que tu equipo lo use de verdad.
- **¿Atienden presencial o solo en Santiago?** 100% online por videollamada; atendemos pymes de todo
  Chile.
- **¿Cuánto cuesta?** Depende de tu caso; por eso la llamada exploratoria es sin costo, para ver qué
  necesitas. _(Si se define un rango orientativo → `PRICE_RANGE_HINT`.)_
- **¿Garantizan resultados?** No prometemos cifras; trabajamos enfocados en el ROI y te acompañamos
  hasta el uso real.
- **¿Mis datos están seguros?** Tratamos tus datos con responsabilidad; si quieres, puedes pedir que
  los borremos cuando gustes.
- **¿Cuánto demora implementarlo?** Depende del alcance: el servicio más básico toma alrededor de 30
  días; una implementación más amplia, hasta unos 90 días.
- **¿Por qué no lo hago yo con ChatGPT?** ChatGPT ayuda, pero el valor está en implementarlo bien,
  integrarlo a tus procesos y que tu equipo lo adopte hasta ver resultados — eso es justo lo que
  hacemos nosotros (no solo entregar una herramienta).

## Pendiente de completar (próximas rondas)
- [ ] **Casos/resultados** reales (aunque sean anonimizados).
- [ ] Revisar/ajustar las FAQ con el texto real de la web (opcional; las actuales están aprobadas).
- [ ] Precios/rangos orientativos (si se decide compartir alguno → `PRICE_RANGE_HINT`).

## Resuelto
- ✅ **Servicios** con descripción de una línea (atención al cliente, procesos internos, capacitación).
- ✅ **Plazos**: ~30 días (servicio básico) a ~90 días (implementación amplia).
- ✅ **FAQ** aprobadas por Sergio.
- ✅ **Mapeo** = parte de la calificación (evaluar estado del prospecto y qué hace hoy).
- ✅ **Diagnóstico** = servicio pagado (ya cliente), evalúa el negocio y dónde aplicar IA.
- ✅ La llamada gratis se llama **"llamada exploratoria"** (no "de diagnóstico").
