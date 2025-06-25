# Guide de mise à jour du bot ZenBeat sur un VPS

Ce guide explique comment mettre à jour votre bot ZenBeat sur un VPS sans avoir à cloner le dépôt à chaque fois. Plusieurs méthodes sont proposées, de la plus simple à la plus avancée.

## Table des matières

1. [Méthode 1: Mise à jour via Git Pull](#méthode-1-mise-à-jour-via-git-pull)
2. [Méthode 2: Mise à jour manuelle de fichiers spécifiques](#méthode-2-mise-à-jour-manuelle-de-fichiers-spécifiques)
3. [Méthode 3: Utilisation de SFTP](#méthode-3-utilisation-de-sftp)
4. [Méthode 4: Script de mise à jour automatique](#méthode-4-script-de-mise-à-jour-automatique)
5. [Sauvegardes et précautions](#sauvegardes-et-précautions)
6. [Résolution des problèmes courants](#résolution-des-problèmes-courants)

## Méthode 1: Mise à jour via Git Pull

Si vous avez initialement cloné le dépôt Git, cette méthode est la plus simple.

### Étapes:

1. Connectez-vous à votre VPS via SSH:
   ```bash
   ssh utilisateur@adresse_ip_du_vps
   ```

2. Naviguez vers le répertoire du bot:
   ```bash
   cd /chemin/vers/votre/bot
   ```

3. Arrêtez le bot s'il est en cours d'exécution:
   ```bash
   # Si vous utilisez PM2
   pm2 stop ZenBeat
   
   # Si vous utilisez un processus en arrière-plan
   pkill -f "node index.js"
   ```

4. Sauvegardez votre configuration actuelle:
   ```bash
   cp config.json config.json.backup
   cp .env .env.backup
   ```

5. Récupérez les dernières modifications:
   ```bash
   git pull origin main
   ```

6. Installez les nouvelles dépendances si nécessaire:
   ```bash
   npm install
   ```

7. Redémarrez le bot:
   ```bash
   # Si vous utilisez PM2
   pm2 restart ZenBeat
   
   # Si vous démarrez manuellement
   node index.js &
   ```

## Méthode 2: Mise à jour manuelle de fichiers spécifiques

Si vous n'avez pas cloné le dépôt Git ou si vous souhaitez mettre à jour uniquement certains fichiers, cette méthode est appropriée.

### Étapes:

1. Identifiez les fichiers à mettre à jour (par exemple, `utils/musicPlayerLavalink.js`).

2. Connectez-vous à votre VPS via SSH.

3. Arrêtez le bot comme dans la méthode 1.

4. Sauvegardez les fichiers que vous allez modifier:
   ```bash
   cp utils/musicPlayerLavalink.js utils/musicPlayerLavalink.js.backup
   ```

5. Téléchargez le nouveau fichier directement sur le serveur:
   ```bash
   # Depuis GitHub (nécessite curl)
   curl -o utils/musicPlayerLavalink.js https://raw.githubusercontent.com/votre-nom/ZenBeat/main/utils/musicPlayerLavalink.js
   
   # Ou créez/modifiez le fichier avec un éditeur de texte
   nano utils/musicPlayerLavalink.js
   ```

6. Redémarrez le bot comme dans la méthode 1.

## Méthode 3: Utilisation de SFTP

Pour les utilisateurs qui préfèrent une interface graphique, SFTP est une bonne option.

### Étapes:

1. Installez un client SFTP comme FileZilla, WinSCP ou Cyberduck sur votre ordinateur local.

2. Connectez-vous à votre VPS avec les informations suivantes:
   - Hôte: Adresse IP de votre VPS
   - Nom d'utilisateur: Votre nom d'utilisateur SSH
   - Mot de passe: Votre mot de passe SSH
   - Port: 22 (port SSH par défaut)

3. Arrêtez le bot sur le VPS via SSH comme dans la méthode 1.

4. Naviguez vers le répertoire du bot dans votre client SFTP.

5. Téléchargez les fichiers que vous souhaitez mettre à jour depuis votre ordinateur local vers le VPS.

6. Redémarrez le bot via SSH comme dans la méthode 1.

## Méthode 4: Script de mise à jour automatique

Pour les utilisateurs avancés, un script de mise à jour automatique peut simplifier le processus.

### Création du script:

1. Connectez-vous à votre VPS via SSH.

2. Créez un fichier `update-bot.sh`:
   ```bash
   nano update-bot.sh
   ```

3. Ajoutez le contenu suivant:
   ```bash
   #!/bin/bash
   
   # Configuration
   BOT_DIR="/chemin/vers/votre/bot"
   BACKUP_DIR="$BOT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
   REPO_URL="https://github.com/votre-nom/ZenBeat.git"
   
   # Créer le répertoire de sauvegarde
   mkdir -p "$BACKUP_DIR"
   
   # Aller dans le répertoire du bot
   cd "$BOT_DIR" || exit 1
   
   # Arrêter le bot
   if command -v pm2 &> /dev/null; then
     echo "Arrêt du bot via PM2..."
     pm2 stop ZenBeat
   else
     echo "Arrêt du bot via pkill..."
     pkill -f "node index.js"
   fi
   
   # Sauvegarder les fichiers de configuration
   echo "Sauvegarde des fichiers de configuration..."
   cp config.json "$BACKUP_DIR/"
   cp .env "$BACKUP_DIR/"
   
   # Mettre à jour le code
   if [ -d .git ]; then
     echo "Mise à jour via Git..."
     git pull origin main
   else
     echo "Mise à jour via téléchargement direct..."
     TMP_DIR=$(mktemp -d)
     git clone "$REPO_URL" "$TMP_DIR"
     
     # Exclure les fichiers de configuration
     rm -f "$TMP_DIR/config.json" "$TMP_DIR/.env"
     
     # Copier les nouveaux fichiers
     cp -r "$TMP_DIR"/* "$BOT_DIR/"
     
     # Nettoyer
     rm -rf "$TMP_DIR"
   fi
   
   # Installer les dépendances
   echo "Installation des dépendances..."
   npm install
   
   # Redémarrer le bot
   if command -v pm2 &> /dev/null; then
     echo "Démarrage du bot via PM2..."
     pm2 restart ZenBeat
   else
     echo "Démarrage du bot en arrière-plan..."
     node index.js &
   fi
   
   echo "Mise à jour terminée!"
   ```

4. Rendez le script exécutable:
   ```bash
   chmod +x update-bot.sh
   ```

5. Exécutez le script pour mettre à jour le bot:
   ```bash
   ./update-bot.sh
   ```

## Sauvegardes et précautions

Avant toute mise à jour, il est fortement recommandé de:

1. **Sauvegarder l'ensemble du répertoire du bot**:
   ```bash
   cp -r /chemin/vers/votre/bot /chemin/vers/votre/bot_backup_$(date +%Y%m%d)
   ```

2. **Vérifier les journaux après la mise à jour**:
   ```bash
   # Si vous utilisez PM2
   pm2 logs ZenBeat
   
   # Si vous utilisez un fichier de journal
   tail -f logs/bot.log
   ```

3. **Conserver les anciennes versions des fichiers modifiés** pendant quelques jours, au cas où vous auriez besoin de revenir en arrière.

## Résolution des problèmes courants

### Le bot ne démarre pas après la mise à jour

1. Vérifiez les journaux pour identifier l'erreur:
   ```bash
   pm2 logs ZenBeat
   ```

2. Assurez-vous que toutes les dépendances sont installées:
   ```bash
   npm install
   ```

3. Vérifiez que les fichiers de configuration sont corrects:
   ```bash
   # Comparez avec la sauvegarde
   diff config.json config.json.backup
   diff .env .env.backup
   ```

4. Restaurez à partir de la sauvegarde si nécessaire:
   ```bash
   cp config.json.backup config.json
   cp .env.backup .env
   ```

### Erreurs liées à Lavalink

1. Assurez-vous que Lavalink est à jour et en cours d'exécution:
   ```bash
   # Vérifier si Lavalink est en cours d'exécution
   ps aux | grep lavalink
   
   # Redémarrer Lavalink si nécessaire
   cd /chemin/vers/lavalink
   java -jar Lavalink.jar &
   ```

2. Vérifiez les journaux de Lavalink pour les erreurs:
   ```bash
   tail -f /chemin/vers/lavalink/logs/spring.log
   ```

3. Consultez les guides spécifiques à Lavalink:
   - [LAVALINK_GUIDE.md](LAVALINK_GUIDE.md)
   - [LAVALINK_V4_UPDATE.md](LAVALINK_V4_UPDATE.md)
   - [SHOUKAKU_V4_API_FIX.md](SHOUKAKU_V4_API_FIX.md)
   - [LAVALINK_SEARCH_FIX.md](LAVALINK_SEARCH_FIX.md)

### Problèmes de permissions

Si vous rencontrez des erreurs de permission:

```bash
# Vérifiez les permissions des fichiers
ls -la /chemin/vers/votre/bot

# Corrigez les permissions si nécessaire
chmod -R 755 /chemin/vers/votre/bot
chmod 644 /chemin/vers/votre/bot/config.json
chmod 644 /chemin/vers/votre/bot/.env
```

---

En suivant ce guide, vous devriez être en mesure de maintenir votre bot ZenBeat à jour sur votre VPS avec un minimum d'effort et de temps d'arrêt. Si vous rencontrez des problèmes non couverts ici, n'hésitez pas à consulter la documentation ou à demander de l'aide sur le serveur Discord de support.
