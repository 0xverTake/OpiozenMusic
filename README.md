# OpiozenMusic - Bot Discord de Musique 🎵

Un bot Discord de musique complet conçu pour fonctionner sur Raspberry Pi 4 et VPS Debian/Ubuntu sans nécessiter d'API externe.

## 🌟 Fonctionnalités

- 🎵 Lecture de musique depuis YouTube
- 📝 Système de queue avec répétition
- 🔊 Contrôle du volume
- ⏸️ Pause/Reprendre
- ⏭️ Passer des chansons
- 🔂 Répétition de chanson/queue
- 📊 Affichage des informations de lecture
- 🎨 Interface avec embeds Discord élégants
- 🔄 Service systemd pour fonctionnement en arrière-plan

## 🛠️ Installation

### 🍓 Sur Raspberry Pi 4

#### Prérequis
- Raspberry Pi 4 avec Raspberry Pi OS
- Connexion Internet
- Token de bot Discord

#### Installation automatique

1. **Clonez ou téléchargez le projet**
```bash
git clone <votre-repo> OpiozenMusic
cd OpiozenMusic
```

2. **Exécutez le script d'installation**
```bash
chmod +x install.sh
./install.sh
```

3. **Configurez votre token Discord**
Éditez le fichier `.env` et remplacez `YOUR_BOT_TOKEN_HERE` par votre token de bot Discord :
```env
DISCORD_TOKEN=votre_token_ici
```

4. **Démarrez le bot**
```bash
chmod +x start.sh
./start.sh
```

### 🐧 Sur VPS Debian/Ubuntu

#### Prérequis
- VPS avec Debian 12/Ubuntu
- Accès root ou sudo
- Token de bot Discord

#### Installation et déploiement automatique

1. **Clonez le projet**
```bash
git clone <votre-repo> OpiozenMusic
cd OpiozenMusic
```

2. **Configurez votre token Discord**
Créez le fichier `.env` :
```bash
echo "DISCORD_TOKEN=votre_token_ici" > .env
```

3. **Déployez le bot comme service systemd**
```bash
chmod +x deploy-debian.sh
./deploy-debian.sh
```

Le bot sera automatiquement configuré pour :
- ✅ Démarrer automatiquement au boot du système
- ✅ Redémarrer automatiquement en cas de crash
- ✅ Fonctionner en arrière-plan (même après fermeture SSH)
- ✅ Enregistrer les logs système

#### Gestion du service

Utilisez le script de gestion pour contrôler le bot :

```bash
chmod +x service-manager.sh

# Démarrer le service
./service-manager.sh start

# Arrêter le service
./service-manager.sh stop

# Redémarrer le service
./service-manager.sh restart

# Voir le statut
./service-manager.sh status

# Voir les logs en temps réel
./service-manager.sh logs

# Activer au démarrage
./service-manager.sh enable

# Désactiver au démarrage
./service-manager.sh disable
```

#### Commandes systemd directes

```bash
# Statut du service
sudo systemctl status opiozenmusic

# Logs du service
sudo journalctl -u opiozenmusic -f

# Redémarrer le service
sudo systemctl restart opiozenmusic

# Arrêter le service
sudo systemctl stop opiozenmusic
```

### Installation manuelle

1. **Mise à jour du système**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Installation des dépendances système**
```bash
sudo apt install python3 python3-pip python3-venv ffmpeg libffi-dev libnacl-dev python3-dev -y
```

3. **Création de l'environnement virtuel**
```bash
python3 -m venv venv
source venv/bin/activate
```

4. **Installation des dépendances Python**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

5. **Configuration et démarrage**
```bash
# Configurez le fichier .env avec votre token
python3 music_bot.py
```

## 🎮 Commandes

| Commande | Alias | Description |
|----------|-------|-------------|
| `!play <recherche>` | `!p` | Jouer une chanson depuis YouTube |
| `!pause` | - | Mettre en pause la lecture |
| `!resume` | - | Reprendre la lecture |
| `!stop` | - | Arrêter la lecture et vider la queue |
| `!skip` | `!s` | Passer à la chanson suivante |
| `!queue` | `!q` | Afficher la queue de lecture |
| `!volume <0-100>` | `!v` | Changer le volume |
| `!loop` | - | Répéter la chanson actuelle |
| `!loopqueue` | - | Répéter la queue |
| `!nowplaying` | `!np` | Informations sur la chanson actuelle |
| `!disconnect` | `!dc` | Déconnecter le bot |
| `!help` | `!h` | Afficher les commandes |

## ⚙️ Configuration

Le fichier `.env` contient toutes les configurations :

```env
# Token du bot Discord (OBLIGATOIRE)
DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE

# Configuration Audio
DEFAULT_VOLUME=0.5
MAX_VOLUME=1.0

# Préfixe des commandes
COMMAND_PREFIX=!

# Configuration du bot
BOT_NAME=OpiozenMusic
BOT_STATUS=Écoute de la musique 🎵
```

## 🔧 Dépendances

- **discord.py[voice]** : Intégration Discord avec support vocal
- **yt-dlp** : Téléchargement de vidéos YouTube (remplace youtube-dl)
- **PyNaCl** : Cryptographie pour l'audio Discord
- **python-dotenv** : Gestion des variables d'environnement
- **FFmpeg** : Traitement audio (installé via apt)

## 🚀 Optimisations pour Raspberry Pi

- Utilisation de streaming au lieu de téléchargement complet
- Gestion efficace de la mémoire
- Configuration optimisée pour les ressources limitées
- Pas de base de données externe requise

## 🐛 Dépannage

### Le bot ne se connecte pas
1. Vérifiez que votre token Discord est correct dans `.env`
2. Assurez-vous que le bot a les permissions nécessaires sur votre serveur Discord

### Problèmes audio
1. Vérifiez que FFmpeg est installé : `ffmpeg -version`
2. Redémarrez le bot si l'audio se coupe

### Erreurs de dépendances
1. Réactivez l'environnement virtuel : `source venv/bin/activate`
2. Réinstallez les dépendances : `pip install -r requirements.txt`

### Performance sur Raspberry Pi
1. Assurez-vous que votre Pi a suffisamment de refroidissement
2. Utilisez une carte SD rapide (Class 10 ou mieux)
3. Fermez les applications inutiles pour libérer de la RAM

## 📝 Logs

Le bot utilise le système de logging Python standard. Les erreurs et informations importantes sont affichées dans la console.

## 🔒 Sécurité

- Ne partagez jamais votre token Discord
- Le fichier `.env` ne doit pas être commité dans Git
- Utilisez des permissions Discord minimales pour votre bot

## 🎯 Utilisation

1. Invitez le bot sur votre serveur Discord avec les permissions appropriées
2. Rejoignez un canal vocal
3. Utilisez `!play <nom de la chanson>` pour commencer à écouter de la musique
4. Utilisez `!help` pour voir toutes les commandes disponibles

## 📞 Support

Le bot est conçu pour être simple et robuste. En cas de problème :

1. Vérifiez les logs dans la console
2. Redémarrez le bot avec `./start.sh`
3. Vérifiez votre connexion Internet
4. Assurez-vous que YouTube est accessible

## 🎉 Fonctionnalités avancées

- **Queue intelligente** : Gestion automatique de la file d'attente
- **Répétition flexible** : Répétition de chanson ou de queue complète
- **Contrôle du volume** : Ajustement en temps réel
- **Informations riches** : Embeds avec miniatures et métadonnées
- **Gestion d'erreurs** : Récupération automatique des erreurs courantes

---

🎵 **OpiozenMusic** - Votre compagnon musical Discord sur Raspberry Pi et VPS Debian/Ubuntu !
