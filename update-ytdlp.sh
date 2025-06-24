#!/bin/bash

# Script de mise à jour de yt-dlp pour contourner les restrictions YouTube

echo "🔄 Mise à jour de yt-dlp et des dépendances..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification de l'environnement virtuel
if [ ! -d "venv" ]; then
    print_error "Environnement virtuel non trouvé. Exécutez d'abord install.sh"
    exit 1
fi

# Activation de l'environnement virtuel
print_status "Activation de l'environnement virtuel..."
source venv/bin/activate

# Mise à jour de pip
print_status "Mise à jour de pip..."
pip install --upgrade pip

# Mise à jour de yt-dlp vers la dernière version
print_status "Mise à jour de yt-dlp..."
pip install --upgrade yt-dlp

# Mise à jour des autres dépendances
print_status "Mise à jour des dépendances Discord..."
pip install --upgrade discord.py

print_status "Mise à jour de python-dotenv..."
pip install --upgrade python-dotenv

# Installation de dépendances supplémentaires pour contourner les restrictions
print_status "Installation de dépendances supplémentaires..."
pip install --upgrade requests urllib3 certifi

# Installation de Spotipy pour le support Spotify
print_status "Installation du support Spotify..."
pip install --upgrade spotipy

# Affichage des versions installées
echo ""
print_success "Versions installées:"
echo "yt-dlp: $(pip show yt-dlp | grep Version | cut -d' ' -f2)"
echo "discord.py: $(pip show discord.py | grep Version | cut -d' ' -f2)"
echo "python-dotenv: $(pip show python-dotenv | grep Version | cut -d' ' -f2)"
echo "spotipy: $(pip show spotipy | grep Version | cut -d' ' -f2)"

# Test rapide de yt-dlp
print_status "Test de yt-dlp..."
if python -c "import yt_dlp; print('✅ yt-dlp fonctionne')"; then
    print_success "yt-dlp testé avec succès"
else
    print_error "Problème avec yt-dlp"
fi

deactivate

print_success "Mise à jour terminée !"
print_status "Redémarrez le bot pour appliquer les changements:"
print_status "  ./service-manager.sh restart"
