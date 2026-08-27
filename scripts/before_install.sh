#!/usr/bin/env bash
set -euo pipefail

# dedicated service user (idempotent)
id -u gladius &>/dev/null || useradd --system --create-home --home-dir /home/gladius --shell /bin/bash gladius

mkdir -p /opt/gladius/backend /var/log/gladius
chown -R gladius:gladius /opt/gladius /var/log/gladius

# wipe the previous release's app dir so OVERWRITE never trips on stale files
rm -rf /opt/gladius/backend/*