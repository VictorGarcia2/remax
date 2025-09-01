#!/bin/bash
# Script para instalar SSL con Let's Encrypt en Ubuntu/Debian

echo "🔐 Instalando certificados SSL para remaxcin.com"

# 1. Instalar Certbot
echo "📦 Instalando Certbot..."
sudo apt update
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# 2. Crear enlace simbólico
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# 3. Obtener certificados SSL
echo "🔒 Obteniendo certificados SSL..."
sudo certbot --nginx -d remaxcin.com -d www.remaxcin.com

# 4. Verificar renovación automática
echo "♻️ Configurando renovación automática..."
sudo certbot renew --dry-run

echo "✅ ¡SSL configurado correctamente!"
echo "🌐 Tu sitio ahora está disponible en https://remaxcin.com"
