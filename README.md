# OpiozenMusic - Bot Discord de Musique 🎵

Un bot Discord de musique complet conçu pour fonctionner sur Raspberry Pi 4 et VPS Debian/Ubuntu sans nécessiter d'API externe.

## 🌟 Fonctionnalités

- 🎵 **Multi-plateformes** : YouTube, SoundCloud, Spotify
- 📝 Système de queue avec répétition
- 🔊 Contrôle du volume
- ⏸️ Pause/Reprendre
- ⏭️ Passer des chansons
- 🔂 Répétition de chanson/queue
- 📊 Affichage des informations de lecture
- 🎨 Interface avec embeds Discord élégants
- 🔄 Service systemd pour fonctionnement en arrière-plan
- 🔍 Recherche intelligente et détection automatique des plateformes
- 🎶 Support Spotify avec conversion automatique vers YouTube

## 🎵 Plateformes Supportées

### 🎥 YouTube
- ✅ Liens directs YouTube
- ✅ Recherche textuelle
- ✅ Playlistes (premier élément)
- ✅ Gestion des restrictions anti-bot

### 🎵 SoundCloud  
- ✅ Liens directs SoundCloud
- ✅ Pistes publiques
- ✅ Support natif via yt-dlp

### 🎶 Spotify
- ✅ Liens de pistes Spotify
- ✅ Conversion automatique vers YouTube
- ✅ Extraction des métadonnées (artiste, titre)
- ⚙️ Configuration optionnelle requise

### 🔍 Recherche Intelligente
- ✅ Recherche textuelle automatique
- ✅ Détection automatique des plateformes
- ✅ Formats flexibles (`artiste - titre`, `titre seul`)

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

#### Configuration Spotify (Optionnelle)

Pour activer le support Spotify :

1. **Créez une application Spotify** :
   - Allez sur https://developer.spotify.com/dashboard/
   - Créez une nouvelle app
   - Notez votre `Client ID` et `Client Secret`

2. **Ajoutez les credentials à votre .env** :
```bash
echo "SPOTIFY_CLIENT_ID=votre_client_id" >> .env
echo "SPOTIFY_CLIENT_SECRET=votre_client_secret" >> .env
```

## 🚀 **Déploiement Ultra-Simple**

### 🐍 **Nouveau : Gestionnaire Python Unifié**

Un seul script Python gère maintenant **tout** !

#### **Installation et déploiement en 1 clic :**

```bash
# Cloner le projet
git clone <votre-repo> OpiozenMusic
cd OpiozenMusic

# Lancer le gestionnaire (Windows)
python start.py

# Ou avec le script batch (Windows)
start.bat

# Ou directement (Linux/Mac)
python3 opiomanager.py
```

#### **Fonctionnalités du gestionnaire :**

- 🚀 **Déploiement complet** - Installation complète sur VPS
- ⚡ **Déploiement rapide** - Mise à jour rapide des fichiers essentiels  
- 📊 **Monitoring** - Statut, logs en temps réel
- 🔄 **Gestion** - Redémarrage, arrêt, diagnostics
- 🔧 **Maintenance** - Mise à jour yt-dlp, édition .env
- 🖥️ **SSH direct** - Connexion directe au VPS

#### ✨ **Avantages du Gestionnaire Python :**

- 🎯 **Tout-en-un** - Un seul script pour tout gérer
- 🌈 **Interface colorée** - Messages clairs et visuels
- 🔧 **Multi-plateforme** - Fonctionne sur Windows, Linux, Mac
- ⚡ **Ultra-rapide** - Déploiement en quelques clics
- 🛡️ **Sécurisé** - Utilise SSH standard (pas de mots de passe stockés)
- 📊 **Monitoring intégré** - Statut et logs en temps réel
- 🔄 **Auto-détection** - Détecte automatiquement les problèmes

---

## 🛠️ Installation Manuelle (Méthode Classique)

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
