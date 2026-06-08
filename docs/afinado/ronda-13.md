# Ronda 13 — Servicios al detalle y FAQs

## Decisiones (de Sergio)
- **Servicios (descripción de 1 línea, confirmadas):**
  - Atención al cliente → asistentes/bots que responden a clientes 24/7 (WhatsApp/web).
  - Procesos internos → automatizar tareas repetitivas y administrativas del equipo.
  - Capacitación → formar al equipo para usar IA en su día a día.
- **FAQs:** "agrégalas en base a la página web".
- **Casos/resultados:** pendiente (lo deja para más adelante).

## Nota: no se pudo leer la web
`crececonia.cl` bloquea la lectura automática (**HTTP 403**, ya detectado en el plan, error de crawl).
La búsqueda web solo devolvió artículos genéricos de terceros. Para **no inventar**, las FAQs se
redactaron a partir de lo ya confirmado en el afinado (no de fuentes ajenas), marcando con ⚠️ lo que
necesita un dato real. Cuando Sergio pegue el texto del sitio, se reemplaza.

## Cambios implementados
- `src/brain/prompt.ts`: enriquecida la línea de **servicios** con la descripción de cada uno.
- `docs/kb/crececonia.md`:
  - Servicios con descripción confirmada.
  - Nueva sección **FAQ** (8 preguntas) fundada en lo confirmado; "¿cuánto demora?" marcada ⚠️ pendiente.
  - Checklist actualizado; sección "Resuelto" ampliada.

## Pendiente de Sergio
- ⚠️ **Tiempos típicos de implementación** (para "¿cuánto demora?").
- **Casos/resultados** reales (anonimizados).
- Texto real de las FAQ de la web (opcional; las actuales están fundadas en lo confirmado).
