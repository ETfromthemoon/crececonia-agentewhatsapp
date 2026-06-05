#!/usr/bin/env bash
# Crea los recursos de Cloudflare para el agente. Copia los IDs que imprime a wrangler.toml.
set -uo pipefail

echo "==> D1 (crececonia-leads)"
npx wrangler d1 create crececonia-leads || true

echo "==> KV (KV)"
npx wrangler kv namespace create KV || true

echo "==> Vectorize (crececonia-kb, 1024 dim, cosine)"
npx wrangler vectorize create crececonia-kb --dimensions=1024 --metric=cosine || true

echo "==> R2 (crececonia-media)"
npx wrangler r2 bucket create crececonia-media || true

echo "==> Queues (whatsapp-incoming, whatsapp-dlq)"
npx wrangler queues create whatsapp-incoming || true
npx wrangler queues create whatsapp-dlq || true

echo
echo "LISTO. Pega en wrangler.toml: database_id (D1) e id (KV)."
echo "Luego: npx wrangler d1 migrations apply crececonia-leads --remote"
