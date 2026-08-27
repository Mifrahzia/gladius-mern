#!/usr/bin/env bash
set -euo pipefail

REGION="ap-southeast-1"
PREFIX="/gladius/prod"
ENV_FILE="/opt/gladius/backend/.env"

aws ssm get-parameters-by-path \
  --path "$PREFIX" --recursive --with-decryption \
  --region "$REGION" \
  --query "Parameters[].{k:Name,v:Value}" --output json \
| jq -r '.[] | "\(.k | sub(".*/";""))=\(.v)"' > "$ENV_FILE"

chown gladius:gladius "$ENV_FILE"
chmod 600 "$ENV_FILE"
chown -R gladius:gladius /opt/gladius/backend
echo "Wrote $(wc -l < "$ENV_FILE") env vars to $ENV_FILE"