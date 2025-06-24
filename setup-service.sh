#!/bin/bash

# Script pour configurer le service systemd sur Raspberry Pi

echo "🔧 Configuration du service systemd pour OpiozenMusic..."

# Vérification que nous sommes sur un système Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Ce script est conçu pour Linux/Raspberry Pi"
    exit 1
fi

# Chemin actuel
CURRENT_DIR=$(pwd)
SERVICE_FILE="opiozenmusic.service"
SYSTEMD_DIR="/etc/systemd/system"

# Mise à jour du fichier service avec le bon chemin
echo "📝 Mise à jour du fichier service..."
sed -i "s|/home/pi/OpiozenMusic|$CURRENT_DIR|g" $SERVICE_FILE

# Copie du fichier service
echo "📋 Copie du fichier service vers systemd..."
sudo cp $SERVICE_FILE $SYSTEMD_DIR/

# Rechargement de systemd
echo "🔄 Rechargement de systemd..."
sudo systemctl daemon-reload

# Activation du service
echo "✅ Activation du service..."
sudo systemctl enable opiozenmusic.service

echo ""
echo "🎉 Service configuré avec succès!"
echo ""
echo "📋 Commandes utiles:"
echo "  Démarrer le service: sudo systemctl start opiozenmusic"
echo "  Arrêter le service:  sudo systemctl stop opiozenmusic"
echo "  Redémarrer:          sudo systemctl restart opiozenmusic"
echo "  Voir les logs:       sudo journalctl -u opiozenmusic -f"
echo "  Statut du service:   sudo systemctl status opiozenmusic"
echo ""
echo "⚠️  N'oubliez pas de configurer votre token Discord dans .env avant de démarrer!"
