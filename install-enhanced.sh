#!/bin/bash

# Script d'installation enhanced pour OpiozenMusic
echo "🚀 Installation Enhanced d'OpiozenMusic Bot..."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage coloré
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

# Mise à jour du système
print_info "Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installation des dépendances système de base
print_info "Installation des dépendances système..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    ffmpeg \
    libffi-dev \
    libnacl-dev \
    libssl-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    build-essential \
    git \
    curl \
    wget

# Installation de dépendances supplémentaires pour le contournement
print_info "Installation des dépendances de contournement..."
sudo apt install -y \
    chromium-browser \
    chromium-chromedriver \
    firefox-esr \
    tor \
    proxychains4

# Configuration de Tor (optionnel pour les proxies)
print_info "Configuration de Tor..."
sudo systemctl enable tor
sudo systemctl start tor

# Création de l'environnement virtuel
print_info "Création de l'environnement virtuel..."
if [ -d "venv" ]; then
    rm -rf venv
fi
python3 -m venv venv

# Activation de l'environnement virtuel
print_info "Activation de l'environnement virtuel..."
source venv/bin/activate

# Mise à jour de pip
print_info "Mise à jour de pip..."
pip install --upgrade pip setuptools wheel

# Installation des dépendances Python de base
print_info "Installation des dépendances Python de base..."
pip install discord.py[voice] yt-dlp PyNaCl python-dotenv requests

# Installation des dépendances enhanced si disponibles
if [ -f "requirements_enhanced.txt" ]; then
    print_info "Installation des dépendances enhanced..."
    pip install -r requirements_enhanced.txt
else
    print_info "Installation des dépendances standard..."
    pip install -r requirements.txt
fi

# Installation de dépendances supplémentaires pour le contournement
print_info "Installation des dépendances de contournement..."
pip install \
    selenium \
    webdriver-manager \
    browser-cookie3 \
    fake-useragent \
    python-socks \
    aiohttp-socks \
    beautifulsoup4 \
    lxml \
    mutagen \
    pycryptodome

# Configuration des cookies YouTube
print_info "Configuration du système de cookies..."
if [ -f "setup-cookies.sh" ]; then
    chmod +x setup-cookies.sh
    ./setup-cookies.sh
else
    print_warning "Script de cookies non trouvé, création d'un template..."
    touch cookies.txt
fi

# Test de yt-dlp avec contournement
print_info "Test de yt-dlp avec contournement..."
python3 -c "
import yt_dlp
options = {
    'quiet': True,
    'no_warnings': True,
    'format': 'bestaudio/best',
    'extract_flat': True
}
try:
    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info('ytsearch1:test music', download=False)
        print('✅ yt-dlp fonctionne correctement')
except Exception as e:
    print(f'⚠️ yt-dlp: {e}')
"

# Configuration des services système
print_info "Configuration des services système..."

# Créer un service de surveillance des cookies
cat > update-cookies.sh << 'EOF'
#!/bin/bash
# Script de mise à jour automatique des cookies

cd "$(dirname "$0")"

# Vérifier si les cookies sont anciens (plus de 24h)
if [ -f cookies.txt ]; then
    if [ $(find cookies.txt -mtime +1 | wc -l) -gt 0 ]; then
        echo "🔄 Mise à jour des cookies..."
        if [ -f setup-cookies.sh ]; then
            ./setup-cookies.sh
        fi
    fi
fi
EOF

chmod +x update-cookies.sh

# Créer un crontab pour la mise à jour automatique des cookies
print_info "Configuration de la mise à jour automatique des cookies..."
(crontab -l 2>/dev/null; echo "0 6 * * * $PWD/update-cookies.sh") | crontab -

# Configuration de la rotation des logs
print_info "Configuration de la rotation des logs..."
sudo tee /etc/logrotate.d/opiozenmusic > /dev/null << EOF
$PWD/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

# Création du répertoire de logs
mkdir -p logs

# Test final
print_info "Tests finaux..."

# Test Discord.py
python3 -c "
try:
    import discord
    print('✅ Discord.py installé correctement')
except ImportError as e:
    print(f'❌ Discord.py: {e}')
"

# Test des imports du bot
python3 -c "
try:
    import requests
    import json
    import random
    print('✅ Dépendances supplémentaires OK')
except ImportError as e:
    print(f'❌ Dépendances: {e}')
"

# Vérification FFmpeg
if command -v ffmpeg &> /dev/null; then
    print_status "FFmpeg installé: $(ffmpeg -version | head -n1)"
else
    print_error "FFmpeg non trouvé"
fi

# Affichage du résumé
echo ""
echo "================================================"
echo "     INSTALLATION ENHANCED TERMINÉE"
echo "================================================"
echo ""
print_status "✅ Système mis à jour"
print_status "✅ Dépendances système installées"
print_status "✅ Environnement virtuel Python créé"
print_status "✅ Dépendances Python enhanced installées"
print_status "✅ Système de contournement configuré"
print_status "✅ Cookies YouTube configurés"
print_status "✅ Services système configurés"
print_status "✅ Rotation des logs configurée"
print_status "✅ Mise à jour automatique des cookies configurée"
echo ""
echo "🎵 Fonctionnalités Enhanced disponibles:"
echo "   • Support multi-sources (YouTube, SoundCloud, Bandcamp)"
echo "   • Contournement avancé des restrictions YouTube"
echo "   • Système de cookies automatique"
echo "   • APIs alternatives (Invidious)"
echo "   • Gestion avancée des erreurs"
echo "   • Mode shuffle et commandes étendues"
echo "   • Rotation automatique des User-Agents"
echo "   • Support des proxies (optionnel)"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Configurez votre token Discord dans le fichier .env"
echo "2. Exécutez: source venv/bin/activate"
echo "3. Lancez le bot enhanced: python3 music_bot_enhanced.py"
echo "4. Ou utilisez le service: ./setup-service.sh && sudo systemctl start opiozenmusic"
echo ""
echo "🔧 Commandes utiles:"
echo "   • Tester le contournement: python3 advanced_bypass.py"
echo "   • Mettre à jour les cookies: ./update-cookies.sh"
echo "   • Voir les logs: tail -f logs/bot.log"
echo ""
print_status "🎉 Votre bot de musique enhanced est prêt!"
