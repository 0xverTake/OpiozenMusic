# Guide d'utilisation de PM2 avec ZenBeat

Ce guide explique comment utiliser PM2 (Process Manager 2) pour exécuter le bot ZenBeat en arrière-plan et le maintenir actif 24/7.

## Qu'est-ce que PM2 ?

PM2 est un gestionnaire de processus pour les applications Node.js qui permet de :
- Garder les applications en vie en permanence
- Recharger les applications sans temps d'arrêt
- Faciliter les tâches DevOps courantes
- Gérer la journalisation des applications
- Surveiller les performances des applications

## Installation de PM2

Si vous n'avez pas encore installé PM2, exécutez la commande suivante :

```bash
npm install -g pm2
```

## Configuration

Un fichier de configuration PM2 (`ecosystem.config.js`) a déjà été créé pour ZenBeat avec les paramètres optimaux.

## Commandes PM2 pour ZenBeat

### Démarrer le bot

Pour démarrer le bot avec PM2 :

```bash
pm2 start ecosystem.config.js
```

### Vérifier l'état du bot

Pour voir l'état du bot et d'autres informations :

```bash
pm2 status
```

### Consulter les logs

Pour voir les logs en temps réel :

```bash
pm2 logs zenbeat
```

Pour voir uniquement les erreurs :

```bash
pm2 logs zenbeat --err
```

### Redémarrer le bot

Si vous avez fait des modifications au code et souhaitez redémarrer le bot :

```bash
pm2 restart zenbeat
```

### Arrêter le bot

Pour arrêter le bot :

```bash
pm2 stop zenbeat
```

### Supprimer le bot de PM2

Si vous ne souhaitez plus que le bot soit géré par PM2 :

```bash
pm2 delete zenbeat
```

## Configuration du démarrage automatique

Pour que PM2 démarre automatiquement au démarrage du système :

```bash
pm2 startup
```

Suivez les instructions affichées à l'écran, puis :

```bash
pm2 save
```

## Surveillance des performances

Pour ouvrir le moniteur de performances en temps réel :

```bash
pm2 monit
```

## Mise à jour de PM2

Pour mettre à jour PM2 vers la dernière version :

```bash
npm install -g pm2@latest
pm2 update
```

## Dépannage

Si le bot ne démarre pas correctement :

1. Vérifiez les logs d'erreur : `pm2 logs zenbeat --err`
2. Assurez-vous que toutes les dépendances sont installées : `npm install`
3. Vérifiez que le fichier `.env` ou `config.json` est correctement configuré
4. Redémarrez PM2 : `pm2 restart zenbeat`

## Remarques importantes

- Assurez-vous que le bot a les permissions Discord nécessaires
- Le bot redémarrera automatiquement en cas de crash
- Les logs sont stockés dans le dossier `logs/`
