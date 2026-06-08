# Ronda 08 — Garantías, borrado de datos, fusión de mensajes y apertura

## Decisiones
- **Garantías de resultados:** no prometer cifras; mencionar casos reales (si están en la base de
  conocimiento) como referencia, sin prometer el mismo resultado, y llevar a la llamada.
- **Borrado de datos (Ley 19.628):** Nia lo hace sola con un tool, tras confirmar una vez. Irreversible.
- **Mensajes seguidos (PRD §20.8):** fusionar varios mensajes en UN turno (buffer + debounce en el DO).
- **Apertura mínima** ("hola"/"info"/emoji): saludo estándar + nombre + pregunta abierta.

## Cambios implementados
- **Fusión de mensajes (feature, decisión §20.8):**
  - `src/config.ts`: `DEBOUNCE_MS = 4000`.
  - `src/do/ConversationDO.ts`: buffer en `state.storage` (`buf:{msgId}`) + `setAlarm` que se
    reprograma con cada mensaje; el `alarm()` toma el bloque de forma atómica
    (`blockConcurrencyWhile`), lo ordena por timestamp y lo procesa de una vez. Acuse inmediato a
    la Queue; reintento con backoff (hasta 2) si el procesamiento falla.
  - `src/brain/claude.ts`: `processMessage` → **`processTurn(jobs[])`**; resuelve y concatena el
    texto de todos los mensajes del bloque (transcribe audios) en un único turno de Claude.
- **Borrado de datos (feature):**
  - `src/db/leads.ts`: `deleteContactData()` — anonimiza PII del contacto, vacía el cuerpo de sus
    mensajes y referencias a media, borra resúmenes, anonimiza reservas y elimina sus audios de R2.
  - `src/brain/tools.ts` + `toolHandlers.ts`: tool `borrar_mis_datos`.
  - `src/brain/claude.ts`: si se ejecuta `borrar_mis_datos`, NO se repersiste el turno ni se
    clasifica/resume (respeta el borrado).
- **Prompt (`src/brain/prompt.ts`):** garantías (casos reales sin prometer); borrado de datos
  (confirmar una vez → `borrar_mis_datos`); apertura mínima (saludo + nombre + pregunta abierta).
- **Playbook:** escenarios 15-18 + ítems de checklist.

## Notas técnicas
- El debounce añade hasta ~4 s a la primera respuesta cuando hay ráfaga; a cambio, fusiona los
  mensajes (más coherente y más barato). Ajustable en `DEBOUNCE_MS`.
- El acuse a la Queue es inmediato (el mensaje queda durable en el DO), por eso el reintento ante
  fallos de procesamiento se gestiona en el `alarm()` del propio DO, no en la Queue.
