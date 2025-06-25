# Guide d'hébergement sur Debian 12

Ce guide vous explique comment héberger ZenBeat sur un serveur Debian 12 pour qu'il reste actif en permanence.

## Prérequis

- Un serveur Debian 12
- Accès SSH à votre serveur
- Droits sudo (ou root)

## Étape 1: Installer Node.js

Debian 12 n'inclut pas toujours la dernière version de Node.js dans ses dépôts par défaut. Nous allons donc l'installer à partir du dépôt NodeSource:

```bash
# Mettre à jour les paquets
sudo apt update
sudo apt upgrade -y

# Installer les dépendances nécessaires
sudo apt install -y curl git build-essential

# Installer Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node -v
npm -v
```

## Étape 2: Installer les dépendances audio

Pour que le bot puisse lire de l'audio, vous devez installer certaines dépendances:

```bash
sudo apt install -y ffmpeg
```

## Étape 3: Cloner et configurer le bot

```bash
# Créer un dossier pour le bot
mkdir -p ~/bots
cd ~/bots

# Cloner le dépôt (si vous l'avez sur GitHub) ou transférer les fichiers via SCP/SFTP
git clone https://github.com/votre-nom/zenbeat.git
# OU transférer les fichiers depuis votre machine locale

cd zenbeat

# Installer les dépendances
npm install

# Configurer le bot (éditer config.json avec votre token et IDs)
nano config.json
```

## Étape 4: Installer PM2 pour garder le bot actif

PM2 est un gestionnaire de processus qui permet de maintenir votre application en ligne 24/7:

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Démarrer le bot avec PM2
pm2 start index.js --name "zenbeat"

# Vérifier que le bot est en cours d'exécution
pm2 status

# Configurer PM2 pour démarrer automatiquement au redémarrage du système
pm2 startup
# Exécutez la commande que PM2 vous indique

# Sauvegarder la configuration actuelle de PM2
pm2 save
```

## Étape 5: Configurer le redémarrage automatique

Pour s'assurer que le bot redémarre automatiquement en cas de problème:

```bash
# Ouvrir le fichier de configuration PM2
nano ~/bots/zenbeat/pm2-config.json
```

Ajoutez le contenu suivant:

```json
{
  "apps": [
    {
      "name": "zenbeat",
      "script": "index.js",
      "cwd": "/home/votre-utilisateur/bots/zenbeat",
      "watch": false,
      "max_memory_restart": "200M",
      "env": {
        "NODE_ENV": "production"
      },
      "restart_delay": 3000,
      "max_restarts": 10
    }
  ]
}
```

Puis utilisez cette configuration:

```bash
pm2 delete zenbeat  # Supprimer l'ancienne instance si elle existe
pm2 start pm2-config.json
pm2 save
```

## Étape 6: Surveiller le bot

Vous pouvez surveiller votre bot avec les commandes suivantes:

```bash
# Voir les logs en temps réel
pm2 logs zenbeat

# Voir les statistiques
pm2 monit
```

## Étape 7: Mettre à jour le bot

Lorsque vous souhaitez mettre à jour votre bot:

```bash
cd ~/bots/zenbeat
git pull  # Si vous utilisez git
# OU transférez les nouveaux fichiers

npm install  # Si de nouvelles dépendances ont été ajoutées
pm2 restart zenbeat
```

## Dépannage

### Le bot se déconnecte fréquemment

Vérifiez votre connexion Internet et les logs pour identifier le problème:

```bash
pm2 logs zenbeat --lines 100
```

### Erreurs de mémoire

Si le bot consomme trop de mémoire, ajustez la limite dans le fichier pm2-config.json et redémarrez:

```bash
nano ~/bots/zenbeat/pm2-config.json
# Modifiez "max_memory_restart" à une valeur plus élevée, par exemple "500M"
pm2 restart zenbeat
```

### Problèmes de permissions

Si vous rencontrez des problèmes de permissions:

```bash
# Assurez-vous que tous les fichiers appartiennent à votre utilisateur
sudo chown -R votre-utilisateur:votre-utilisateur ~/bots/zenbeat
```

## Conclusion

Votre bot Discord ZenBeat est maintenant configuré pour fonctionner 24/7 sur votre serveur Debian 12. PM2 s'assurera qu'il reste en ligne et redémarre automatiquement en cas de problème ou de redémarrage du serveur.
