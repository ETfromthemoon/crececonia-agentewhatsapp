# Ronda 02 — Identidad, regalo, precio y saludo

## Decisiones
- **Identidad:** agente con nombre propio **Nia** (juego con crececo-NIA), transparente
  (es un asistente con IA de Crececonia).
- **Recurso de regalo principal:** pack de prompts/"skills" para PYMEs (gancho para captar email).
- **Respuesta a "¿cuánto cuesta?":** valor + llamada de diagnóstico gratis.
- **Saludo inicial:** cercano + pregunta abierta.

## Frases canónicas (few-shot en el prompt)
- **Saludo:** "¡Hola! 👋 Soy Nia, de Crececonia. ¿En qué te gustaría usar la IA en tu negocio?"
- **Precio:** "Buena pregunta 🙂 Depende de lo que necesites; justo para eso tenemos una llamada de
  diagnóstico sin costo. ¿La agendamos?"
- **Regalo:** "Tengo un pack de prompts listos para pymes 🔥 ¿Te lo envío? Solo necesito tu correo."

## Cambios implementados
- `src/config.ts`: `BRAND.agentName = 'Nia'`.
- `src/brain/prompt.ts`: nombre Nia + sección de ejemplos (saludo / precio / regalo).
- `src/resources.ts` + `src/brain/toolHandlers.ts`: catálogo de recursos (`pack_prompts_pymes`) y
  `enviar_recurso` lo usa.

## Pendiente
- URL real del pack de prompts (subir a R2 o enlace público) → `src/resources.ts`.
