#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash enable-https.sh <site_name> <domain>
# Requires: snapd certbot or apt certbot, DNS resolved to server IP.

SITE_NAME="${1:-supply}"
DOMAIN="${2:-}"

if [[ -z "$DOMAIN" || "$DOMAIN" == "_" ]]; then
  echo "Please provide a real domain for HTTPS."
  exit 1
fi

echo "Install certbot"
if ! command -v certbot >/dev/null 2>&1; then
  sudo snap install core; sudo snap refresh core
  sudo snap install --classic certbot
  sudo ln -s /snap/bin/certbot /usr/bin/certbot || true
fi

echo "Request certificate for $DOMAIN"
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN" || {
  echo "Certbot with nginx plugin failed. Trying webroot mode...";
  sudo certbot certonly --webroot -w /var/www/supply -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN";
}

echo "Enable auto-renew"
sudo systemctl enable snap.certbot.renew.service || true
sudo systemctl start snap.certbot.renew.service || true

echo "Reload nginx"
sudo nginx -t
sudo systemctl reload nginx
echo "HTTPS enabled for $DOMAIN"



