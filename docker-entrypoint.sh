#!/bin/sh
set -eu

DATA_DIR="${DATA_DIR:-/app/data}"

mkdir -p "$DATA_DIR" 2>/dev/null || true

# Railway volumes often mount as root-owned; fix before dropping privileges.
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs "$DATA_DIR" 2>/dev/null || true
  chmod -R u+rwX "$DATA_DIR" 2>/dev/null || true
fi

echo "[noorzaa] DATA_DIR=${DATA_DIR}"

if [ "$(id -u)" = "0" ]; then
  exec su-exec nextjs node server.js
fi

exec node server.js
