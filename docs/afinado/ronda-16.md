# Ronda 16 — Recursos en crececonia.cl + checkpoint de sesión

## Decisiones (de Sergio)
- **Los recursos de regalo (pack de prompts, curso) se alojan en crececonia.cl.** Las URLs apuntan al
  sitio; si hay deep-link específico de cada uno, se reemplaza.
- **crececonia.cl es la base de conocimiento** del RAG (ya configurado en `src/rag/sources.ts`; el
  sitio devuelve 403 al crawler → se usa User-Agent realista o `/admin/ingest-text`).

## Cambios implementados
- `src/resources.ts`: `pack_prompts_pymes` y `curso_ia_basico` con `url: https://www.crececonia.cl`
  (antes vacías); comentario actualizado.
- `docs/ESTADO.md`: **checkpoint de sesión** (qué está hecho, pendientes de Sergio y de despliegue,
  cómo retomar).

## Pendiente de Sergio
- Caso/resultado real (anonimizado).
- Deep-links exactos de los recursos (si los hay).
