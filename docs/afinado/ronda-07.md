# Ronda 07 — Reagendar/cancelar, precio, disponibilidad y despedida

## Decisiones
- **Reprogramar/cancelar:** Nia lo hace sola desde el chat (sin pedir códigos de reserva).
- **Insistencia en precio:** rango ORIENTATIVO si insisten tras reencuadrar, luego llamada. Si no
  hay rango configurado, no da cifras y lleva a la llamada (sin costo) con amabilidad.
- **Disponibilidad:** 24/7, responde al instante; NO menciona horarios de atención.
- **Despedida sin cierre:** cálida, deja la puerta abierta e invita a seguir el Instagram.

## Cambios implementados
- **Tools Cal.com nuevas (feature):**
  - `src/calcom/client.ts`: `rescheduleBooking()` (`POST /bookings/{uid}/reschedule`) y
    `cancelBooking()` (`POST /bookings/{uid}/cancel`), versión `CALCOM_API_VERSION_BOOKINGS`.
  - `src/db/bookings.ts`: `getActiveBooking()` (resuelve la reserva confirmada del contacto),
    `updateBookingAfterReschedule()` (nuevo uid/start/enlace) y `cancelBookingRow()`
    (booking→`cancelled`, lead `booked`→`qualified`).
  - `src/brain/tools.ts` + `toolHandlers.ts`: tools `reprogramar_reserva_calcom` y
    `cancelar_reserva_calcom` (resuelven el uid solos; devuelven `sin_reserva_activa` si no hay).
- **Precio configurable:**
  - `src/config.ts`: `PRICE_RANGE_HINT` (vacío por defecto; Sergio pone el rango real).
  - `src/brain/prompt.ts`: `priceGuidance` condicional según `PRICE_RANGE_HINT`.
- **Prompt:** línea de disponibilidad 24/7 (sin horarios); párrafo de reprogramar/cancelar;
  párrafo de despedidas; ejemplos de "reprogramar" y "despedida sin cierre".
- **Playbook:** escenarios 11-14 (reprogramar, cancelar, insistencia de precio, despedida) +
  4 ítems de checklist.

## Pendiente de Sergio (dato real)
- **Rango de precio orientativo** para `PRICE_RANGE_HINT` (p. ej. "los proyectos parten desde $X CLP").
  Mientras esté vacío, Nia no da cifras y deriva a la llamada.

## Frases canónicas
- Reprogramar: "¡Sin problema! 🙌 ¿Qué día te acomoda mejor? Busco horas y lo movemos al tiro."
- Cancelar: "¡Hecho! Cancelada 🙂 Cuando quieras la retomamos, me escribes y agendamos al tiro 🙌"
- Despedida sin cierre: "¡Genial! Cualquier cosa me escribes cuando quieras 🙌 Y si te tinca, en
  @crececoniacl subo tips de IA para pymes."
