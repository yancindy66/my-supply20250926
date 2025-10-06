#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash setup-ubuntu.sh example.com /var/www/supply
# If you only have an IP and no domain yet, pass "_" as the domain.

DOMAIN="${1:-_}"
WEB_ROOT="${2:-/var/www/supply}"

echo "[1/6] Update apt and install dependencies"
sudo apt-get update -y
sudo apt-get install -y nginx curl unzip ca-certificates

echo "[2/6] Install Node.js (LTS) via NodeSource"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v
npm -v

echo "[3/6] Prepare directories"
sudo mkdir -p "$WEB_ROOT"
sudo chown -R "$USER":"$USER" "$WEB_ROOT"

echo "[4/6] Create Nginx site config"
SITE_NAME=${DOMAIN/_/supply}
CONF_PATH="/etc/nginx/sites-available/$SITE_NAME.conf"
sudo tee "$CONF_PATH" >/dev/null <<'NGX'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root WEB_ROOT_PLACEHOLDER;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static cache (adjust as needed)
    location ~* \.(?:css|js|mjs|jpg|jpeg|png|gif|svg|ico|woff2?|ttf)$ {
        expires 7d;
        access_log off;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }
}
NGX
sudo sed -i "s|WEB_ROOT_PLACEHOLDER|$WEB_ROOT|g" "$CONF_PATH"

echo "[5/6] Enable site and reload Nginx"
sudo ln -sf "$CONF_PATH" "/etc/nginx/sites-enabled/$SITE_NAME.conf"
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "[6/6] Firewall (UFW) allow HTTP"
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 80/tcp || true
fi

cat <<EOT
Done.

Next steps:
- Upload your built dist/ to: $WEB_ROOT
- Or run: bash deploy-dist.sh <local-dist-zip-or-dir> $WEB_ROOT

Optional HTTPS:
- After DNS resolves to this server, run: bash enable-https.sh $SITE_NAME $DOMAIN
EOT



