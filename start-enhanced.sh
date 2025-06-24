#!/bin/bash

# Script de démarrage amélioré pour OpiozenMusic
echo "🎵 Démarrage d'OpiozenMusic Bot..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Vérification de l'environnement virtuel
if [ ! -d "venv" ]; then
    print_error "Environnement virtuel non trouvé"
    print_info "Exécutez d'abord: ./install.sh ou ./install-enhanced.sh"
    exit 1
fi

print_status "Environnement virtuel trouvé"

# Activation de l'environnement virtuel
print_info "Activation de l'environnement virtuel..."
source venv/bin/activate

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    print_warning "Fichier .env manquant"
    if [ -f ".env.example" ]; then
        print_info "Copie du template .env.example vers .env..."
        cp .env.example .env
        print_warning "Veuillez configurer votre token Discord dans .env"
        print_info "Éditez le fichier: nano .env"
        exit 1
    else
        print_error "Aucun template .env trouvé"
        exit 1
    fi
fi

print_status "Fichier .env trouvé"

# Vérification des dépendances critiques
print_info "Vérification des dépendances..."

# Test des imports Python
python3 -c "
import sys
errors = []

try:
    import discord
    print('✅ discord.py')
except ImportError:
    errors.append('discord.py')
    print('❌ discord.py manquant')

try:
    import yt_dlp
    print('✅ yt-dlp')
except ImportError:
    errors.append('yt-dlp')
    print('❌ yt-dlp manquant')

try:
    from dotenv import load_dotenv
    print('✅ python-dotenv')
except ImportError:
    errors.append('python-dotenv')
    print('❌ python-dotenv manquant')

try:
    import requests
    print('✅ requests')
except ImportError:
    errors.append('requests')
    print('❌ requests manquant')

# Dépendances optionnelles
try:
    import spotipy
    print('✅ spotipy (optionnel)')
except ImportError:
    print('⚠️ spotify manquant (fonctionnalité Spotify désactivée)')

if errors:
    print(f'\\n❌ Dépendances manquantes: {', '.join(errors)}')
    print('💡 Installez avec: pip install -r requirements.txt')
    sys.exit(1)
else:
    print('\\n✅ Toutes les dépendances critiques sont présentes')
"

if [ $? -ne 0 ]; then
    print_error "Dépendances manquantes"
    print_info "Installation des dépendances..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        print_error "Échec de l'installation des dépendances"
        exit 1
    fi
fi

# Vérification FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    print_error "FFmpeg non trouvé"
    print_info "Installez FFmpeg avec: sudo apt install ffmpeg"
    exit 1
fi

print_status "FFmpeg disponible"

# Test de la configuration
print_info "Test de la configuration..."
python3 -c "
import os
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('DISCORD_TOKEN')
if not token or token == 'YOUR_BOT_TOKEN_HERE':
    print('❌ Token Discord non configuré')
    print('💡 Modifiez DISCORD_TOKEN dans le fichier .env')
    exit(1)
else:
    print('✅ Token Discord configuré')

# Test optionnel Spotify
client_id = os.getenv('SPOTIFY_CLIENT_ID')
client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

if client_id and client_secret and client_id != 'votre_id' and client_secret != 'votre_secret':
    print('✅ Spotify configuré')
else:
    print('⚠️ Spotify non configuré (optionnel)')
"

if [ $? -ne 0 ]; then
    print_error "Configuration invalide"
    exit 1
fi

# Test de connectivité internet
print_info "Test de connectivité..."
if ping -c 1 google.com &> /dev/null; then
    print_status "Connexion Internet OK"
else
    print_warning "Problème de connexion Internet"
    print_info "Le bot peut avoir des difficultés à fonctionner"
fi

# Créer le répertoire de logs si nécessaire
mkdir -p logs

# Choix du fichier de bot à démarrer
BOT_FILE="music_bot.py"
if [ -f "music_bot_enhanced.py" ]; then
    echo ""
    print_info "Plusieurs versions du bot disponibles:"
    echo "1. music_bot.py (version standard)"
    echo "2. music_bot_enhanced.py (version améliorée)"
    echo ""
    read -p "Quelle version voulez-vous démarrer ? (1/2) [2]: " choice
    
    case $choice in
        1)
            BOT_FILE="music_bot.py"
            print_info "Démarrage de la version standard"
            ;;
        2|"")
            BOT_FILE="music_bot_enhanced.py"
            print_info "Démarrage de la version enhanced"
            ;;
        *)
            print_warning "Choix invalide, utilisation de la version enhanced"
            BOT_FILE="music_bot_enhanced.py"
            ;;
    esac
fi

# Vérification que le fichier du bot existe
if [ ! -f "$BOT_FILE" ]; then
    print_error "Fichier du bot $BOT_FILE non trouvé"
    exit 1
fi

# Démarrage du bot
echo ""
print_status "🚀 Démarrage du bot OpiozenMusic..."
print_info "Fichier: $BOT_FILE"
print_info "Pour arrêter le bot: Ctrl+C"
echo ""

# Démarrage avec gestion des logs
exec python3 "$BOT_FILE" 2>&1 | tee logs/bot_$(date +%Y%m%d_%H%M%S).log
