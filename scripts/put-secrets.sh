#!/usr/bin/env bash
# Carga los secrets en Cloudflare (pedirá el valor de cada uno). No guarda nada en disco.
set -uo pipefail

SECRETS="WHATSAPP_TOKEN WHATSAPP_VERIFY_TOKEN APP_SECRET ANTHROPIC_API_KEY CF_AIG_TOKEN CALCOM_API_KEY TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID ADMIN_TOKEN"

for s in $SECRETS; do
  echo "==> $s"
  npx wrangler secret put "$s"
done

echo "LISTO. Secrets cargados."
