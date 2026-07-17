#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Auto-hospedar a biblioteca de QR Code (remove a dependência de CDN).
# Rode uma única vez, a partir da pasta do projeto:
#     bash assets/js/self-host-qrcode.sh
# Depois disso, a página Apoie passa a usar /assets/js/qrcode.min.js
# (o fallback para a CDN só é usado enquanto este arquivo não existir).
# ---------------------------------------------------------------------------
set -e
cd "$(dirname "$0")"
URL="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"

if command -v curl >/dev/null 2>&1; then
  curl -fsSL -o qrcode.min.js "$URL"
elif command -v wget >/dev/null 2>&1; then
  wget -q -O qrcode.min.js "$URL"
else
  echo "Erro: instale curl ou wget para baixar o arquivo."; exit 1
fi

echo "OK: assets/js/qrcode.min.js baixado ($(wc -c < qrcode.min.js) bytes)."
echo "A pagina Apoie agora usa a copia local, sem depender da CDN."
