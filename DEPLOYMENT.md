# 🚀 Guide de Déploiement sur Raspberry Pi

Ce guide vous explique comment déployer OpiozenMusic sur votre Raspberry Pi depuis Windows.

## 📋 Prérequis

### Sur votre PC Windows :
- OpenSSH Client installé (inclus dans Windows 10/11)
- Ou PuTTY + PSCP comme alternative

### Sur votre Raspberry Pi :
- Raspberry Pi OS installé et configuré
- SSH activé
- Connexion Internet
- Adresse IP connue

## 🔧 Activation du SSH sur Raspberry Pi

Si le SSH n'est pas encore activé :

```bash
# Sur le Raspberry Pi directement
sudo systemctl enable ssh
sudo systemctl start ssh

# Vérifier le statut
sudo systemctl status ssh

# Connaître l'adresse IP
hostname -I
```

Ou via l'interface graphique : **Menu > Préférences > Configuration du Raspberry Pi > Interfaces > SSH > Activé**

## 🚀 Options de Déploiement

### Option 1 : Configuration Interactive (Recommandée)
```bat
setup-deployment.bat
```
- Configuration interactive guidée
- Test de connexion automatique
- Génère un script personnalisé
- Idéal pour la première utilisation

### Option 2 : Déploiement Standard
```bat
deploy-to-pi.bat
```
- Script de base avec configuration manuelle
- Envoi et configuration étape par étape
- Affichage détaillé des opérations

### Option 3 : Déploiement Automatique
```bat
deploy-auto.bat
```
- Déploiement et installation automatiques
- Configuration du service système
- Prêt à l'emploi (après configuration du token)

### Option 4 : Déploiement Rapide
```bat
deploy-quick.bat
```
- Envoi rapide des fichiers uniquement
- Pour les mises à jour fréquentes
- Configuration manuelle requise

## ⚙️ Configuration des Scripts

Avant d'utiliser les scripts, modifiez ces valeurs selon votre configuration :

```bat
set RASPBERRY_IP=192.168.1.100    # Remplacez par l'IP de votre Pi
set RASPBERRY_USER=pi              # Nom d'utilisateur (généralement 'pi')
set RASPBERRY_PATH=/home/pi/OpiozenMusic  # Répertoire d'installation
```

## 🔑 Configuration SSH

### Authentification par mot de passe (par défaut)
Les scripts utilisent l'authentification par mot de passe standard. Vous devrez saisir le mot de passe de votre utilisateur Pi à chaque connexion.

### Authentification par clé SSH (recommandée)
Pour éviter de saisir le mot de passe :

1. **Générer une clé SSH sur Windows :**
```cmd
ssh-keygen -t rsa -b 4096 -C "votre-email@example.com"
```

2. **Copier la clé sur le Raspberry Pi :**
```cmd
ssh-copy-id pi@192.168.1.100
```

3. **Tester la connexion :**
```cmd
ssh pi@192.168.1.100
```

## 📝 Utilisation Étape par Étape

### 1. Première Installation

1. **Exécuter la configuration :**
```cmd
setup-deployment.bat
```

2. **Suivre les instructions interactives**

3. **Utiliser le script généré :**
```cmd
deploy-custom.bat
```

### 2. Configuration du Token Discord

Après le déploiement, configurez votre token Discord :

```bash
# Se connecter au Raspberry Pi
ssh pi@192.168.1.100

# Aller dans le répertoire
cd /home/pi/OpiozenMusic

# Éditer la configuration
nano .env

# Remplacer YOUR_BOT_TOKEN_HERE par votre token
# Sauvegarder avec Ctrl+X, Y, Enter
```

### 3. Démarrage du Bot

```bash
# Installation des dépendances (première fois)
./install.sh

# Démarrage manuel
./start.sh

# OU démarrage en service système
./setup-service.sh
sudo systemctl start opiozenmusic
```

## 🔄 Mises à Jour

Pour mettre à jour le bot :

```cmd
# Envoi rapide des nouveaux fichiers
deploy-quick.bat

# Puis sur le Raspberry Pi
ssh pi@192.168.1.100
cd /home/pi/OpiozenMusic
sudo systemctl restart opiozenmusic  # Si configuré en service
# OU
./start.sh  # Si démarrage manuel
```

## 🐛 Dépannage

### Erreur de connexion SSH
```cmd
# Vérifier la connectivité
ping 192.168.1.100

# Tester SSH manuellement
ssh pi@192.168.1.100
```

### Permission denied (publickey)
```cmd
# Utiliser l'authentification par mot de passe
ssh -o PreferredAuthentications=password pi@192.168.1.100
```

### Fichiers non trouvés
```cmd
# Vérifier que vous êtes dans le bon répertoire
dir
# Vous devez voir music_bot.py, requirements.txt, etc.
```

### Le bot ne démarre pas
```bash
# Sur le Raspberry Pi, vérifier les logs
sudo journalctl -u opiozenmusic -f

# Ou démarrer manuellement pour voir les erreurs
cd /home/pi/OpiozenMusic
source venv/bin/activate
python3 music_bot.py
```

## 📊 Surveillance

### Vérifier le statut du service
```bash
sudo systemctl status opiozenmusic
```

### Voir les logs en temps réel
```bash
sudo journalctl -u opiozenmusic -f
```

### Redémarrer le service
```bash
sudo systemctl restart opiozenmusic
```

## 💡 Conseils d'Optimisation

1. **Utilisez une carte SD rapide** (Class 10 minimum)
2. **Assurez-vous d'avoir un bon refroidissement** pour éviter la throttling
3. **Fermez les applications inutiles** pour libérer de la RAM
4. **Configurez un IP fixe** pour votre Raspberry Pi
5. **Sauvegardez régulièrement** votre configuration

## 🔒 Sécurité

- Ne partagez jamais votre token Discord
- Utilisez des clés SSH plutôt que des mots de passe
- Configurez un pare-feu si nécessaire
- Mettez à jour régulièrement votre Raspberry Pi OS

---

🎵 **Votre bot OpiozenMusic est maintenant prêt à fonctionner sur votre Raspberry Pi !**
