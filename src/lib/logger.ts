/** Logging estructurado mínimo (visible en `wrangler tail`). */

export function logInfo(msg: string, data?: unknown): void {
  console.log(JSON.stringify({ level: 'info', msg, data }));
}

export function logError(msg: string, err?: unknown): void {
  console.error(JSON.stringify({ level: 'error', msg, err: err instanceof Error ? err.message : String(err) }));
}
