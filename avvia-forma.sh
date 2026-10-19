#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Installa prima Node.js LTS (versione 20 o successiva)."
  exit 1
fi
node server.mjs --open
