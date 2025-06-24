#!/bin/bash

# Script de démarrage du bot
echo "🎵 Démarrage d'OpiozenMusic Bot..."

# Vérification de l'environnement virtuel
if [ ! -d "venv" ]; then
    echo "❌ Environnement virtuel non trouvé. Exécutez d'abord install.sh"
    exit 1
fi

# Activation de l'environnement virtuel
echo "⚡ Activation de l'environnement virtuel..."
source venv/bin/activate

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant. Veuillez configurer votre token Discord."
    exit 1
fi

# Démarrage du bot
echo "🚀 Lancement du bot..."
python3 music_bot.py
