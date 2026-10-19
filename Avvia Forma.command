#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Installa prima Node.js LTS da https://nodejs.org e riapri questo file."
  printf 'Premi Invio per chiudere... '
  read -r risposta
  exit 1
fi
node server.mjs --open
