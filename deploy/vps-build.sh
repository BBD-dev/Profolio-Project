#!/bin/bash
set -euo pipefail

cd /opt/profolio

echo "==> Swap (if missing)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
free -h

echo "==> Ensure api.env exists"
if [ ! -f api.env ]; then
  echo "ERROR: /opt/profolio/api.env is missing"
  exit 1
fi
if [ -f .env ]; then
  rm -f .env
fi

echo "==> Clean old builds"
docker compose down || true
docker builder prune -f

echo "==> Build api"
docker compose build api --progress=plain

echo "==> Build web"
docker compose build web --progress=plain

echo "==> Start stack"
docker compose up -d

echo "==> Status"
docker compose ps
echo "Dashboard: http://207.154.248.90/"
echo "API:       http://207.154.248.90/api/"
