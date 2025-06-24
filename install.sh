#!/bin/bash

# Script de démarrage pour Raspberry Pi 4
# Installation des dépendances système nécessaires

echo "🚀 Installation des dépendances pour OpiozenMusic Bot..."

# Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installation de Python et pip
echo "🐍 Installation de Python et pip..."
sudo apt install python3 python3-pip python3-venv -y

# Installation de FFmpeg (nécessaire pour l'audio)
echo "🎵 Installation de FFmpeg..."
sudo apt install ffmpeg -y

# Installation des dépendances système pour audio
echo "🔊 Installation des dépendances audio..."
sudo apt install libffi-dev libnacl-dev python3-dev -y

# Création de l'environnement virtuel
echo "🏗️ Création de l'environnement virtuel..."
python3 -m venv venv

# Activation de l'environnement virtuel
echo "⚡ Activation de l'environnement virtuel..."
source venv/bin/activate

# Installation des dépendances Python
echo "📚 Installation des dépendances Python..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Installation terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Configurez votre token Discord dans le fichier .env"
echo "2. Exécutez: source venv/bin/activate"
echo "3. Exécutez: python3 music_bot.py"
echo ""
echo "🎵 Votre bot de musique est prêt à être utilisé!"
