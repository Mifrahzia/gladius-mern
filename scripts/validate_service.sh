#!/usr/bin/env bash
set -euo pipefail
PORT="$(grep -E '^PORT=' /opt/gladius/backend/.env | cut -d= -f2)"
PORT="${PORT:-5000}"

for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/health" | grep -q '"ok":true'; then
    echo "health OK after ${i}s"; exit 0
  fi
  sleep 1
done
echo "health check FAILED"; pm2 logs gladius-backend --lines 50 --nostream || true
exit 1