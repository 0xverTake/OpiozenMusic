#!/bin/bash

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "PM2 n'est pas installé. Installation en cours..."
    npm install -g pm2
fi

# Vérifier si le dossier logs existe
if [ ! -d "logs" ]; then
    echo "Création du dossier logs..."
    mkdir -p logs
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
fi

# Vérifier si le fichier config.json existe
if [ ! -f "config.json" ] && [ -f "config.json.example" ]; then
    echo "ATTENTION: config.json n'existe pas. Veuillez copier config.json.example vers config.json et le configurer."
    echo "Exemple: cp config.json.example config.json"
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "ATTENTION: .env n'existe pas. Veuillez copier .env.example vers .env et le configurer."
    echo "Exemple: cp .env.example .env"
fi

# Démarrer le bot avec PM2
echo "Démarrage du bot ZenBeat avec PM2..."
pm2 start ecosystem.config.js

# Afficher le statut
echo "Statut du bot:"
pm2 status zenbeat

echo ""
echo "Le bot ZenBeat est maintenant géré par PM2!"
echo "Pour voir les logs en temps réel: pm2 logs zenbeat"
echo "Pour plus d'informations, consultez le fichier PM2_GUIDE.md"
