#!/bin/bash

# Script de déploiement pour VPS Debian 12

echo "🚀 Déploiement d'OpiozenMusic Bot sur Debian 12..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification que nous sommes sur Debian/Ubuntu
if ! command -v apt &> /dev/null; then
    print_error "Ce script est conçu pour Debian/Ubuntu (apt requis)"
    exit 1
fi

# Variables
CURRENT_DIR=$(pwd)
SERVICE_NAME="opiozenmusic"
SERVICE_FILE="${SERVICE_NAME}.service"
DEBIAN_SERVICE_FILE="${SERVICE_NAME}-debian.service"
SYSTEMD_DIR="/etc/systemd/system"
CURRENT_USER=$(whoami)

# Vérification des fichiers requis
print_status "Vérification des fichiers requis..."
if [ ! -f "$DEBIAN_SERVICE_FILE" ]; then
    print_error "Fichier $DEBIAN_SERVICE_FILE non trouvé"
    exit 1
fi

if [ ! -f "music_bot.py" ]; then
    print_error "Fichier music_bot.py non trouvé"
    exit 1
fi

if [ ! -f ".env" ]; then
    print_warning "Fichier .env non trouvé. Assurez-vous de le créer avec votre token Discord."
fi

# Installation des dépendances système si nécessaire
print_status "Vérification et installation des dépendances système..."
sudo apt update
sudo apt install -y python3 python3-pip python3-venv ffmpeg

# Création de l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    print_status "Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activation de l'environnement virtuel et installation des dépendances
print_status "Installation des dépendances Python..."
source venv/bin/activate
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    print_warning "requirements.txt non trouvé. Installation manuelle des dépendances..."
    pip install discord.py yt-dlp python-dotenv
fi

# Arrêt du service s'il est déjà en cours d'exécution
print_status "Arrêt du service existant (si actif)..."
sudo systemctl stop $SERVICE_NAME 2>/dev/null || true

# Création du fichier service personnalisé
print_status "Configuration du service systemd..."
cp $DEBIAN_SERVICE_FILE temp_service.service

# Remplacement des variables dans le fichier service
sed -i "s|YOUR_USERNAME|$CURRENT_USER|g" temp_service.service
sed -i "s|/path/to/your/OpiozenMusic|$CURRENT_DIR|g" temp_service.service

# Copie du fichier service vers systemd
sudo cp temp_service.service $SYSTEMD_DIR/$SERVICE_FILE
rm temp_service.service

# Configuration des permissions
sudo chown root:root $SYSTEMD_DIR/$SERVICE_FILE
sudo chmod 644 $SYSTEMD_DIR/$SERVICE_FILE

# Rechargement de systemd
print_status "Rechargement de systemd..."
sudo systemctl daemon-reload

# Arrêt du service s'il existe déjà
sudo systemctl stop $SERVICE_NAME 2>/dev/null || true

# Activation du service
print_status "Activation du service..."
sudo systemctl enable $SERVICE_NAME

# Test du token avant de démarrer le service
print_status "Test du token Discord..."
source venv/bin/activate

# Créer un script de test temporaire
cat > test_token_temp.py << 'EOF'
import os
from dotenv import load_dotenv
import discord
import asyncio
import sys

load_dotenv()
token = os.getenv('DISCORD_TOKEN')

if not token or token in ['YOUR_BOT_TOKEN_HERE', 'votre_token_ici', 'votre_token_discord']:
    print("❌ Token non configuré correctement")
    sys.exit(1)

async def test_token():
    try:
        client = discord.Client(intents=discord.Intents.default())
        await client.login(token)
        print("✅ Token valide")
        await client.close()
    except discord.LoginFailure:
        print("❌ Token invalide")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)

asyncio.run(test_token())
EOF

if ! python test_token_temp.py; then
    print_error "Token Discord invalide ! Veuillez vérifier votre fichier .env"
    print_error "Contenu actuel du .env:"
    cat .env
    rm -f test_token_temp.py
    deactivate
    exit 1
fi

rm -f test_token_temp.py
deactivate

print_success "Token Discord validé avec succès"

# Démarrage du service
print_status "Démarrage du service..."
sudo systemctl start $SERVICE_NAME

# Vérification du statut
sleep 3
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    print_success "Service démarré avec succès !"
    print_success "Le bot restera actif même après fermeture de la session SSH."
else
    print_error "Échec du démarrage du service"
    print_status "Vérification des logs:"
    sudo journalctl -u $SERVICE_NAME --no-pager -l
    exit 1
fi

echo ""
print_success "🎉 Déploiement terminé !"
echo ""
echo "Commandes utiles :"
echo "  • Voir le statut : sudo systemctl status $SERVICE_NAME"
echo "  • Voir les logs : sudo journalctl -u $SERVICE_NAME -f"
echo "  • Arrêter : sudo systemctl stop $SERVICE_NAME"
echo "  • Redémarrer : sudo systemctl restart $SERVICE_NAME"
echo "  • Désactiver : sudo systemctl disable $SERVICE_NAME"
echo ""
print_status "Le bot est maintenant configuré pour démarrer automatiquement au boot du système."
