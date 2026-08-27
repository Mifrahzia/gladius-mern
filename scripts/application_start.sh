#!/usr/bin/env bash
set -euo pipefail
cd /opt/gladius/backend

# start or hot-reload under the gladius pm2 daemon, then persist for reboot
pm2 startOrReload /opt/gladius/backend/ecosystem.config.cjs --update-env
pm2 save