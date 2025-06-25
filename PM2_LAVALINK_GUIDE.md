# Guide d'utilisation de Lavalink avec PM2

Ce guide vous explique comment configurer et démarrer Lavalink avec PM2 sur votre VPS pour le bot ZenBeat.

## Prérequis

1. Java 13 ou supérieur installé sur votre VPS
2. PM2 installé sur votre VPS
3. Le bot ZenBeat correctement configuré

## Vérification de Java

Avant de commencer, vérifiez que Java est bien installé sur votre VPS :

```bash
java -version
```

Si Java n'est pas installé ou si la version est inférieure à 13, installez-le :

### Sur Debian/Ubuntu
```bash
sudo apt update
sudo apt install openjdk-17-jre
```

### Sur CentOS/RHEL
```bash
sudo yum install java-17-openjdk
```

## Configuration

1. Assurez-vous que le fichier `.env` contient les paramètres Lavalink corrects :

```
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

2. Vérifiez que le fichier `lavalink/application.yml` est correctement configuré avec le même mot de passe.

3. Assurez-vous que les scripts `start-lavalink.sh` et `start-bot.sh` sont exécutables :

```bash
chmod +x start-lavalink.sh
chmod +x start-bot.sh
```

## Démarrage avec PM2

Le fichier `ecosystem.config.js` a été configuré pour démarrer à la fois Lavalink et le bot ZenBeat. Lavalink démarrera en premier, puis le bot.

Pour démarrer les deux services :

```bash
pm2 start ecosystem.config.js
```

Pour vérifier l'état des services :

```bash
pm2 status
```

Pour voir les logs de Lavalink :

```bash
pm2 logs lavalink
```

Pour voir les logs du bot :

```bash
pm2 logs zenbeat
```

## Redémarrage des services

Si vous devez redémarrer les services :

```bash
pm2 restart ecosystem.config.js
```

Ou individuellement :

```bash
pm2 restart lavalink
pm2 restart zenbeat
```

## Configuration pour démarrage automatique

Pour que les services démarrent automatiquement au redémarrage du VPS :

```bash
pm2 save
pm2 startup
```

Suivez les instructions affichées pour configurer le démarrage automatique.

## Dépannage

### Lavalink ne démarre pas

Vérifiez les logs de Lavalink :

```bash
pm2 logs lavalink
```

Assurez-vous que Java est correctement installé et que le fichier JAR est présent dans le dossier `lavalink/`.

### Le bot ne se connecte pas à Lavalink

Vérifiez que Lavalink est bien démarré et que les paramètres dans `.env` correspondent à ceux dans `lavalink/application.yml`.

Vérifiez les logs du bot :

```bash
pm2 logs zenbeat
```

### Erreur "No available nodes"

Cette erreur indique que le bot ne peut pas se connecter à Lavalink. Vérifiez :

1. Que Lavalink est bien démarré (`pm2 status`)
2. Que les paramètres de connexion sont corrects
3. Que le port 2333 n'est pas bloqué par un pare-feu

Si nécessaire, redémarrez Lavalink puis le bot :

```bash
pm2 restart lavalink
# Attendez quelques secondes que Lavalink démarre complètement
pm2 restart zenbeat
```

## Conclusion

Avec cette configuration, Lavalink et ZenBeat fonctionneront ensemble et seront gérés par PM2, ce qui assure leur disponibilité et leur redémarrage automatique en cas de problème.
