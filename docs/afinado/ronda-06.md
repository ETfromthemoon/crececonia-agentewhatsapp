# Ronda 06 — Privacidad, botones, nombre y escalado

## Decisiones
- **Privacidad (Ley 19.628):** al pedir el email, pide permiso y aclara en una línea para qué se usa.
- **Botones interactivos de WhatsApp:** sí, para CTAs (agendar, pedir el pack/curso).
- **Nombre:** Nia pregunta el nombre pronto y lo usa para personalizar.
- **Escalado:** ante el cliente, el humano es "Sergio del equipo".

## Cambios implementados
- `src/brain/prompt.ts`: captura de nombre + uso; permiso/uso del email; instrucción de usar
  `enviar_botones`; "Sergio del equipo" al escalar; ejemplo de permiso de email.
- **Botones interactivos (feature):**
  - `src/whatsapp/client.ts`: `sendInteractiveButtons()` (hasta 3 botones, título ≤20).
  - `src/brain/tools.ts` + `toolHandlers.ts`: tool `enviar_botones`.
  - `src/whatsapp/types.ts` + `src/brain/claude.ts`: las respuestas de botón/list (`interactive`)
    se interpretan usando el título como texto del usuario.

## Frase canónica
- Permiso de email: "¿Te parece si te escribo a tu correo? Lo usamos solo para esto y para enviarte
  contenido útil 🙂"
