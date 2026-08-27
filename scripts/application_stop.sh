#!/usr/bin/env bash
set -euo pipefail
# runs from the PREVIOUS revision; tolerate first-ever deploy
pm2 delete gladius-backend 2>/dev/null || true