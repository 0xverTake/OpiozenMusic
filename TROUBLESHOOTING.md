# 🛠️ Guide de Résolution de Problèmes - OpiozenMusic

Ce guide vous aide à résoudre les problèmes courants avec OpiozenMusic.

## 🚨 Erreurs de Syntaxe Corrigées

Les erreurs de syntaxe principales ont été corrigées dans le code :

### ✅ **Corrections Appliquées**
- **Ligne 85** : Correction de `self.uploader = data.get('uploader')    @classmethod`
- **Bloc try/except** : Correction de l'indentation dans la commande `!play`
- **Imports** : Nettoyage des imports redondants
- **Requirements** : Suppression du module `asyncio` erroné

## 🐛 Problèmes Courants et Solutions

### 1. **Erreur "Sign in to confirm you're not a bot"**

**Cause** : YouTube détecte une activité automatisée

**Solutions** :
```bash
# Solution 1: Utiliser la version enhanced
python3 music_bot_enhanced.py

# Solution 2: Mettre à jour yt-dlp
pip install --upgrade yt-dlp

# Solution 3: Utiliser des sources alternatives
!alternative <votre recherche>
```

### 2. **Erreur d'imports - Module non trouvé**

**Symptômes** :
```
ImportError: No module named 'discord'
ImportError: No module named 'yt_dlp'
```

**Solutions** :
```bash
# Vérifier l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Vérifier l'installation
python3 test_bot.py
```

### 3. **Erreur FFmpeg**

**Symptômes** :
```
FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'
```

**Solutions** :
```bash
# Ubuntu/Debian/Raspberry Pi OS
sudo apt update
sudo apt install ffmpeg

# Vérifier l'installation
ffmpeg -version
```

### 4. **Token Discord invalide**

**Symptômes** :
```
discord.errors.LoginFailure: Improper token has been passed
```

**Solutions** :
```bash
# Vérifier le fichier .env
cat .env | grep DISCORD_TOKEN

# Vérifier que le token est correct
# - Doit commencer par une lettre (pas de guillemets)
# - Doit faire environ 59 caractères
# - Format: MTxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxx
```

### 5. **Erreur de connexion Discord**

**Symptômes** :
- Bot ne se connecte pas
- "Heartbeat blocked"

**Solutions** :
```bash
# Vérifier la connexion Internet
ping discord.com

# Redémarrer le bot
sudo systemctl restart opiozenmusic

# Vérifier les permissions du bot Discord :
# - Applications > Bot > Privileged Gateway Intents
# - Server Members Intent: OFF
# - Presence Intent: OFF  
# - Message Content Intent: ON
```

### 6. **Erreur "Cannot connect to voice channel"**

**Symptômes** :
- Bot rejoint pas le canal vocal
- "Missing permissions"

**Solutions** :
```bash
# Vérifier les permissions Discord du bot :
# - Connect (pour rejoindre)
# - Speak (pour jouer de l'audio)
# - Use Voice Activity (optionnel)

# Redémarrer la connexion vocale
!disconnect
!play <votre musique>
```

## 🔧 Outils de Diagnostic

### Script de Test Complet
```bash
# Tester toutes les fonctionnalités
python3 test_bot.py

# Démarrage avec diagnostic
./start-enhanced.sh
```

### Commandes de Debug
```bash
# Vérifier les logs du système
sudo journalctl -u opiozenmusic -f

# Vérifier les logs de l'application
tail -f logs/bot_*.log

# Tester yt-dlp manuellement
python3 -c "import yt_dlp; print('yt-dlp OK')"

# Tester Discord.py
python3 -c "import discord; print('discord.py OK')"
```

### Test de Connectivité
```bash
# Test YouTube
yt-dlp --list-formats "ytsearch:test music"

# Test SoundCloud
yt-dlp --list-formats "https://soundcloud.com/search?q=test"

# Test réseau
curl -I https://www.youtube.com
```

## ⚡ Solutions d'Urgence

### Bot ne Démarre Pas
```bash
# 1. Réinstallation complète
rm -rf venv
./install-enhanced.sh

# 2. Configuration manuelle
source venv/bin/activate
pip install discord.py[voice] yt-dlp PyNaCl python-dotenv

# 3. Démarrage minimal
python3 -c "
import discord
import os
from dotenv import load_dotenv
load_dotenv()
client = discord.Client(intents=discord.Intents.default())
@client.event
async def on_ready():
    print(f'{client.user} connecté!')
client.run(os.getenv('DISCORD_TOKEN'))
"
```

### YouTube ne Fonctionne Plus
```bash
# 1. Mettre à jour yt-dlp
pip install --upgrade yt-dlp

# 2. Utiliser la version enhanced
cp music_bot_enhanced.py music_bot.py

# 3. Sources alternatives
# Utilisez !alternative au lieu de !play

# 4. Configuration de cookies
./setup-cookies.sh
```

### Performance Lente
```bash
# 1. Vérifier la température (Raspberry Pi)
vcgencmd measure_temp

# 2. Vérifier la mémoire
free -h

# 3. Arrêter les services inutiles
sudo systemctl stop bluetooth
sudo systemctl stop cups

# 4. Optimiser la configuration
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

## 📊 Monitoring et Maintenance

### Surveillance Automatique
```bash
# Script de surveillance (optionnel)
#!/bin/bash
while true; do
    if ! pgrep -f "music_bot.py" > /dev/null; then
        echo "Bot arrêté, redémarrage..."
        sudo systemctl restart opiozenmusic
    fi
    sleep 300
done
```

### Rotation des Logs
```bash
# Configuration logrotate
sudo tee /etc/logrotate.d/opiozenmusic << EOF
/home/pi/OpiozenMusic/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

### Mise à Jour Automatique
```bash
# Script de mise à jour quotidienne
#!/bin/bash
cd /home/pi/OpiozenMusic
source venv/bin/activate
pip install --upgrade yt-dlp
sudo systemctl restart opiozenmusic
```

## 🆘 Aide Supplémentaire

### Informations Système
```bash
# Collecter les informations pour le support
echo "=== INFORMATIONS SYSTÈME ===" > debug_info.txt
uname -a >> debug_info.txt
python3 --version >> debug_info.txt
pip list >> debug_info.txt
systemctl status opiozenmusic >> debug_info.txt
tail -50 logs/bot_*.log >> debug_info.txt
```

### Réinitialisation Complète
```bash
# ⚠️ ATTENTION: Supprime toute la configuration
sudo systemctl stop opiozenmusic
rm -rf venv logs cookies.txt
rm .env
cp .env.example .env
./install-enhanced.sh
# Reconfigurer le token Discord dans .env
```

### Contact et Support
- **Logs** : Toujours inclure les logs récents
- **Configuration** : Version Python, OS, Raspberry Pi model
- **Erreur** : Message d'erreur complet
- **Étapes** : Ce qui était fait quand l'erreur s'est produite

---

🎵 **N'hésitez pas à consulter ce guide pour résoudre la plupart des problèmes courants !**
