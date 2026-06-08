# Ronda 09 — Spam, imágenes/archivos, urgencia y pago de cursos

## Decisiones
- **Spam / tóxicos:** responder breve y neutral, sin engancharse; si insisten, dejar de responder.
- **Imágenes/archivos** (no soportados): si la foto trae texto (caption), usarlo; si no, pedir que lo
  cuenten en texto y seguir ayudando. (No se añade visión todavía.)
- **"Llámame ahora" / urgencia:** no prometer llamada inmediata; ofrecer el hueco disponible más
  cercano (incluso hoy/mañana) y agendar.
- **Pago de cursos:** compartir el enlace de compra con `enviar_recurso`; nunca procesar pagos por chat.

## Cambios implementados
- `src/brain/claude.ts` (`resolveUserText`): manejo del tipo `image` — usa el caption si existe; si
  no, mensaje amable pidiendo que lo describan. Mensaje genérico para otros tipos mejorado.
- `src/brain/prompt.ts`:
  - Objetivo 2 (agenda): urgencia → hueco más cercano y agendar (no llamada inmediata).
  - Cursos: "si preguntan cómo pagar, comparte el enlace de compra con `enviar_recurso`; nunca
    proceses pagos por el chat".
  - Nueva línea: fotos/archivos no visibles → pedir texto; spam/insultos → breve y neutral, dejar
    de responder si insisten.
- **Playbook:** escenarios 19-22 + ítems de checklist.

## Pendiente de Sergio (dato real)
- **URL de compra** del curso en `src/resources.ts` (`curso_ia_basico`) para que el "¿cómo te pago?"
  comparta un enlace real.
