#!/bin/bash

# Script de diagnostic pour OpiozenMusic

echo "🔍 Diagnostic OpiozenMusic Bot..."
echo "================================"

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
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
CURRENT_DIR=$(pwd)
SERVICE_NAME="opiozenmusic"

echo "📁 Répertoire actuel: $CURRENT_DIR"
echo ""

# Vérification des fichiers
print_status "Vérification des fichiers requis..."

if [ -f "music_bot.py" ]; then
    print_success "music_bot.py trouvé"
else
    print_error "music_bot.py manquant"
fi

if [ -f ".env" ]; then
    print_success "Fichier .env trouvé"
    
    # Vérification du contenu du .env
    if grep -q "DISCORD_TOKEN=" ".env"; then
        TOKEN_LINE=$(grep "DISCORD_TOKEN=" .env)
        TOKEN_VALUE=$(echo "$TOKEN_LINE" | cut -d'=' -f2)
        
        if [ -z "$TOKEN_VALUE" ] || [ "$TOKEN_VALUE" = "YOUR_BOT_TOKEN_HERE" ] || [ "$TOKEN_VALUE" = "votre_token_ici" ]; then
            print_error "Token Discord non configuré dans .env"
            print_warning "Contenu actuel: $TOKEN_LINE"
        else
            # Masquer le token pour la sécurité
            MASKED_TOKEN="${TOKEN_VALUE:0:20}...${TOKEN_VALUE: -4}"
            print_success "Token Discord configuré: $MASKED_TOKEN"
            
            # Vérification basique du format du token
            if [[ ${#TOKEN_VALUE} -lt 50 ]]; then
                print_warning "Le token semble trop court (< 50 caractères)"
            elif [[ ${#TOKEN_VALUE} -gt 80 ]]; then
                print_warning "Le token semble trop long (> 80 caractères)"
            else
                print_success "Longueur du token correcte"
            fi
        fi
    else
        print_error "Variable DISCORD_TOKEN non trouvée dans .env"
    fi
else
    print_error "Fichier .env manquant"
fi

if [ -d "venv" ]; then
    print_success "Environnement virtuel trouvé"
    
    # Vérification de Python dans venv
    if [ -f "venv/bin/python" ]; then
        print_success "Python trouvé dans venv"
        PYTHON_VERSION=$(venv/bin/python --version 2>&1)
        print_status "Version Python: $PYTHON_VERSION"
    else
        print_error "Python manquant dans venv"
    fi
    
    # Vérification des dépendances
    if [ -f "venv/bin/pip" ]; then
        print_status "Vérification des dépendances installées..."
        source venv/bin/activate
        
        if pip show discord.py > /dev/null 2>&1; then
            DISCORD_VERSION=$(pip show discord.py | grep Version | cut -d' ' -f2)
            print_success "discord.py installé (version $DISCORD_VERSION)"
        else
            print_error "discord.py non installé"
        fi
        
        if pip show yt-dlp > /dev/null 2>&1; then
            YTDLP_VERSION=$(pip show yt-dlp | grep Version | cut -d' ' -f2)
            print_success "yt-dlp installé (version $YTDLP_VERSION)"
        else
            print_error "yt-dlp non installé"
        fi
        
        if pip show python-dotenv > /dev/null 2>&1; then
            DOTENV_VERSION=$(pip show python-dotenv | grep Version | cut -d' ' -f2)
            print_success "python-dotenv installé (version $DOTENV_VERSION)"
        else
            print_error "python-dotenv non installé"
        fi
        
        deactivate
    fi
else
    print_error "Environnement virtuel manquant"
fi

echo ""
print_status "Vérification du service systemd..."

if systemctl list-unit-files | grep -q "$SERVICE_NAME.service"; then
    print_success "Service systemd installé"
    
    if systemctl is-enabled --quiet $SERVICE_NAME; then
        print_success "Service activé au démarrage"
    else
        print_warning "Service non activé au démarrage"
    fi
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        print_success "Service actuellement actif"
    else
        print_warning "Service actuellement inactif"
    fi
else
    print_error "Service systemd non installé"
fi

echo ""
print_status "Test de connexion du bot..."

if [ -f ".env" ] && [ -f "music_bot.py" ] && [ -d "venv" ]; then
    print_status "Tentative de test du token Discord..."
    
    # Créer un script de test temporaire
    cat > test_token.py << 'EOF'
import os
from dotenv import load_dotenv
import discord
import asyncio

load_dotenv()
token = os.getenv('DISCORD_TOKEN')

if not token or token in ['YOUR_BOT_TOKEN_HERE', 'votre_token_ici']:
    print("❌ Token non configuré")
    exit(1)

async def test_token():
    try:
        client = discord.Client(intents=discord.Intents.default())
        await client.login(token)
        print("✅ Token valide")
        await client.close()
    except discord.LoginFailure:
        print("❌ Token invalide")
        exit(1)
    except Exception as e:
        print(f"❌ Erreur: {e}")
        exit(1)

asyncio.run(test_token())
EOF
    
    source venv/bin/activate
    if python test_token.py 2>/dev/null; then
        print_success "Token Discord valide"
    else
        print_error "Token Discord invalide ou problème de connexion"
    fi
    deactivate
    
    rm -f test_token.py
fi

echo ""
print_status "Résumé des actions recommandées:"

if [ ! -f ".env" ] || ! grep -q "DISCORD_TOKEN=" ".env" || grep -q "YOUR_BOT_TOKEN_HERE\|votre_token_ici" ".env"; then
    echo "1. 🔑 Configurer le token Discord dans .env"
    echo "   echo 'DISCORD_TOKEN=votre_vrai_token' > .env"
fi

if [ ! -d "venv" ]; then
    echo "2. 🐍 Créer l'environnement virtuel"
    echo "   python3 -m venv venv"
fi

if ! systemctl list-unit-files | grep -q "$SERVICE_NAME.service"; then
    echo "3. ⚙️  Installer le service"
    echo "   ./deploy-debian.sh"
else
    echo "3. 🔄 Redéployer le service"
    echo "   ./deploy-debian.sh"
fi

echo ""
echo "🔍 Pour voir les logs détaillés:"
echo "   sudo journalctl -u $SERVICE_NAME -f"
