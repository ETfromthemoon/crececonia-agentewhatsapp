import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

/**
 * Config de tests en el runtime de Workers (vitest-pool-workers).
 *
 * Usamos una config mínima de miniflare en lugar de cargar `wrangler.toml`,
 * para NO instanciar bindings externos (Workers AI, Vectorize, Workflows) que
 * no existen en el runtime local de pruebas.
 *
 * Para tests de integración con D1/KV, añade aquí los bindings simulados, p.ej.:
 *   miniflare: { d1Databases: { DB: ':memory:' }, kvNamespaces: ['KV'] }
 */
export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        miniflare: {
          compatibilityDate: '2025-02-04',
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },
  },
});
