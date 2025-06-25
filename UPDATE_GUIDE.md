# Guide de mise à jour de ZenBeat sur un VPS

Ce guide explique comment mettre à jour votre bot ZenBeat sur un VPS sans avoir à cloner le dépôt à chaque fois.

## Méthode 1 : Mise à jour via Git Pull

Si vous avez initialement installé ZenBeat en clonant le dépôt Git, vous pouvez facilement le mettre à jour en utilisant `git pull`.

### Étapes :

1. **Connectez-vous à votre VPS** via SSH
   ```bash
   ssh utilisateur@adresse_ip_du_vps
   ```

2. **Accédez au répertoire du bot**
   ```bash
   cd /chemin/vers/ZenBeat
   ```

3. **Arrêtez le bot** (si vous utilisez PM2)
   ```bash
   pm2 stop zenbeat
   ```

4. **Récupérez les dernières modifications**
   ```bash
   git pull origin main
   ```

5. **Installez les nouvelles dépendances** (si nécessaire)
   ```bash
   npm install
   ```

6. **Redémarrez le bot**
   ```bash
   pm2 restart zenbeat
   ```

7. **Vérifiez les logs** pour vous assurer que tout fonctionne correctement
   ```bash
   pm2 logs zenbeat
   ```

## Méthode 2 : Mise à jour manuelle de fichiers spécifiques

Si vous avez besoin de mettre à jour uniquement certains fichiers (comme pour corriger un bug spécifique), vous pouvez le faire manuellement.

### Étapes :

1. **Connectez-vous à votre VPS** via SSH
   ```bash
   ssh utilisateur@adresse_ip_du_vps
   ```

2. **Arrêtez le bot** (si vous utilisez PM2)
   ```bash
   pm2 stop zenbeat
   ```

3. **Modifiez le fichier concerné** avec un éditeur de texte comme nano ou vim
   ```bash
   nano /chemin/vers/ZenBeat/utils/musicPlayerLavalink.js
   ```

4. **Effectuez les modifications nécessaires**
   
   Par exemple, pour corriger l'erreur "node.joinChannel is not a function", remplacez :
   ```javascript
   const player = await node.joinChannel({
   ```
   par :
   ```javascript
   const player = await node.joinVoiceChannel({
   ```

5. **Sauvegardez le fichier**
   - Dans nano : Ctrl+O pour sauvegarder, puis Ctrl+X pour quitter
   - Dans vim : Appuyez sur Échap, puis tapez `:wq` et appuyez sur Entrée

6. **Redémarrez le bot**
   ```bash
   pm2 restart zenbeat
   ```

## Méthode 3 : Utilisation de SFTP pour transférer des fichiers

Vous pouvez également utiliser un client SFTP comme FileZilla pour transférer des fichiers entre votre ordinateur local et le VPS.

### Étapes :

1. **Téléchargez et installez FileZilla** (ou un autre client SFTP) sur votre ordinateur local

2. **Connectez-vous à votre VPS** via SFTP
   - Hôte : sftp://adresse_ip_du_vps
   - Nom d'utilisateur : votre_nom_utilisateur
   - Mot de passe : votre_mot_de_passe
   - Port : 22 (par défaut)

3. **Arrêtez le bot** sur le VPS (via SSH)
   ```bash
   pm2 stop zenbeat
   ```

4. **Naviguez jusqu'au répertoire du bot** dans FileZilla

5. **Téléchargez les fichiers** que vous souhaitez modifier sur votre ordinateur local

6. **Modifiez les fichiers** localement avec votre éditeur préféré

7. **Téléversez les fichiers modifiés** vers le VPS

8. **Redémarrez le bot** sur le VPS (via SSH)
   ```bash
   pm2 restart zenbeat
   ```

## Méthode 4 : Script de mise à jour automatique

Vous pouvez créer un script de mise à jour automatique pour simplifier le processus.

### Création du script :

1. **Créez un fichier `update.sh`** dans le répertoire du bot
   ```bash
   nano /chemin/vers/ZenBeat/update.sh
   ```

2. **Ajoutez le contenu suivant** :
   ```bash
   #!/bin/bash
   
   # Afficher un message de début
   echo "Début de la mise à jour de ZenBeat..."
   
   # Arrêter le bot
   echo "Arrêt du bot..."
   pm2 stop zenbeat
   
   # Sauvegarder les fichiers de configuration
   echo "Sauvegarde des fichiers de configuration..."
   cp .env .env.backup
   cp config.json config.json.backup
   
   # Récupérer les dernières modifications
   echo "Récupération des dernières modifications..."
   git pull origin main
   
   # Restaurer les fichiers de configuration
   echo "Restauration des fichiers de configuration..."
   cp .env.backup .env
   cp config.json.backup config.json
   
   # Installer les nouvelles dépendances
   echo "Installation des nouvelles dépendances..."
   npm install
   
   # Redémarrer le bot
   echo "Redémarrage du bot..."
   pm2 restart zenbeat
   
   # Afficher les logs
   echo "Affichage des logs..."
   pm2 logs zenbeat --lines 20
   
   echo "Mise à jour terminée !"
   ```

3. **Rendez le script exécutable**
   ```bash
   chmod +x /chemin/vers/ZenBeat/update.sh
   ```

4. **Exécutez le script** pour mettre à jour le bot
   ```bash
   cd /chemin/vers/ZenBeat
   ./update.sh
   ```

## Conseils supplémentaires

### Sauvegarde avant mise à jour

Avant toute mise à jour, il est recommandé de sauvegarder vos fichiers importants :

```bash
# Créer un répertoire de sauvegarde
mkdir -p ~/backups/zenbeat/$(date +%Y-%m-%d)

# Copier les fichiers importants
cp -r /chemin/vers/ZenBeat/{.env,config.json,utils,commands} ~/backups/zenbeat/$(date +%Y-%m-%d)/
```

### Mise à jour de Lavalink

Si vous devez également mettre à jour Lavalink :

1. **Arrêtez Lavalink**
   ```bash
   pm2 stop lavalink
   ```

2. **Téléchargez la nouvelle version**
   ```bash
   cd /chemin/vers/ZenBeat
   node download-lavalink.js
   ```

3. **Redémarrez Lavalink**
   ```bash
   pm2 restart lavalink
   ```

### Automatisation avec Cron

Vous pouvez configurer une tâche cron pour vérifier et appliquer automatiquement les mises à jour :

```bash
# Ouvrir l'éditeur crontab
crontab -e

# Ajouter cette ligne pour exécuter le script tous les jours à 3h du matin
0 3 * * * cd /chemin/vers/ZenBeat && ./update.sh >> /chemin/vers/ZenBeat/update.log 2>&1
```

## Résolution des problèmes

Si vous rencontrez des problèmes après une mise à jour :

1. **Vérifiez les logs**
   ```bash
   pm2 logs zenbeat
   ```

2. **Restaurez une version précédente** si nécessaire
   ```bash
   cd /chemin/vers/ZenBeat
   git reset --hard HEAD~1  # Revenir à la version précédente
   pm2 restart zenbeat
   ```

3. **Restaurez vos sauvegardes**
   ```bash
   cp ~/backups/zenbeat/YYYY-MM-DD/.env /chemin/vers/ZenBeat/
   cp ~/backups/zenbeat/YYYY-MM-DD/config.json /chemin/vers/ZenBeat/
