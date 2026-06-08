# Ronda 10 — Contacto recurrente, registro, descuentos y modalidad

> Con esta ronda alcanzamos el **mínimo acordado de ~50 interacciones** de afinado (PRD §14.1).

## Decisiones
- **Contacto recurrente:** salúdalo por su nombre y retoma el tema anterior (usa memoria/resumen).
- **Registro tú/usted:** refleja el registro de la persona (de tú por defecto; de usted si te tratan así).
- **Descuentos/promos:** no negociar por chat; reencuadrar al valor y a la llamada. No inventar promos.
- **Modalidad:** 100% online (videollamada); se atiende a pymes de todo Chile.

## Cambios implementados (todo en `src/brain/prompt.ts`)
- Tono: de tú por defecto, pero refleja el "usted"/registro formal del usuario.
- "Qué es Crececonia": añadido "trabajamos 100% online (videollamada), atendemos pymes de todo Chile".
- Apertura: si ya conoce a la persona (nombre/resumen previo), saluda por su nombre y retoma el tema.
- Nueva línea: descuentos/promos → no negociar por chat; al valor y la llamada; no inventar promos.

## Playbook
- Escenarios 23-26 (recurrente, usted, descuento, modalidad) + ítems de checklist.

## Estado del afinado
Cubiertas las categorías mínimas del PRD §14.1: saludos/aperturas, FAQs, objeciones, agenda
(disponibilidad/reprogramación/cancelación), petición de humano, ambiguos/fuera de alcance, notas de
voz, despedidas, datos/consentimiento y borrado, tono ante distintos perfiles, urgencia, spam,
imágenes, pago, recurrentes. El afinado continúa de forma evolutiva con conversaciones reales.
