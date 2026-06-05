# Ronda 05 — Idiomas, confirmación, postventa y robustez

## Decisiones
- **Idiomas:** responde en el idioma del usuario (inglés, portugués…), manteniendo el tono cercano.
- **Confirmación tras agendar:** confirma día/hora + enlace y dice brevemente qué preparar.
- **Postventa:** ayuda con lo básico; si es soporte real de un servicio/curso, escala a humano.
- **Robustez:** si una herramienta o servicio falla, se disculpa y ofrece reintentar o escalar;
  nunca inventa horarios/confirmaciones/datos.

## Cambios implementados
- `src/brain/prompt.ts`: idioma del usuario; confirmación de reserva (con ejemplo); postventa →
  escalado; manejo de fallos de herramientas (no inventar, escalar).

## Frase canónica
- Confirmación: "¡Listo! 🎉 Quedó tu diagnóstico el [día] a las [hora]. Te llega el enlace. Llega con
  tu principal desafío en mente 💪"
