# Guide de gestion des logs PM2

Ce guide explique comment nettoyer, gérer et optimiser les logs de PM2 pour votre bot Discord.

## Comprendre les logs PM2

PM2 génère deux types de logs pour chaque application :
- **Logs de sortie (output)** : Contiennent les messages `console.log()` et la sortie standard
- **Logs d'erreur (error)** : Contiennent les messages `console.error()` et les erreurs

Ces logs peuvent rapidement s'accumuler et occuper beaucoup d'espace disque, surtout pour un bot musical qui génère beaucoup de messages.

## Localisation des logs PM2

Par défaut, les logs PM2 sont stockés dans le répertoire suivant :
- Linux/Mac : `~/.pm2/logs/`
- Windows : `C:\Users\<username>\.pm2\logs\`

Vous y trouverez des fichiers comme :
- `OpiozenM-out.log` : Logs de sortie standard
- `OpiozenM-error.log` : Logs d'erreur

## Nettoyer les logs PM2

### 1. Vider les logs d'une application spécifique

Pour vider les logs de votre bot musical :

```bash
pm2 flush OpiozenM
```

Cela supprimera tous les logs de sortie et d'erreur pour cette application.

### 2. Vider tous les logs

Pour vider les logs de toutes les applications gérées par PM2 :

```bash
pm2 flush
```

### 3. Supprimer manuellement les fichiers de logs

Vous pouvez également supprimer manuellement les fichiers de logs :

```bash
# Linux/Mac
rm ~/.pm2/logs/*

# Windows (dans PowerShell)
Remove-Item $env:USERPROFILE\.pm2\logs\*
```

## Rotation automatique des logs

Pour éviter que les logs ne deviennent trop volumineux, vous pouvez configurer une rotation automatique dans votre fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: "OpiozenM",
    script: "index.js",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    max_memory_restart: "1G",
    log_file: "logs/combined.log",
    error_file: "logs/error.log",
    out_file: "logs/output.log",
    merge_logs: true,
    // Configuration de la rotation des logs
    log_type: "json",
    log_size: "10M",        // Taille maximale avant rotation
    max_logs: 10,           // Nombre maximal de fichiers de logs à conserver
  }]
};
```

Avec cette configuration, PM2 créera un nouveau fichier de log lorsque le fichier actuel atteint 10 Mo, et ne conservera que les 10 fichiers les plus récents.

## Visualiser les logs

### Afficher les logs en temps réel

Pour voir les logs en temps réel :

```bash
pm2 logs OpiozenM
```

Pour voir uniquement les logs d'erreur :

```bash
pm2 logs OpiozenM --err
```

### Limiter le nombre de lignes affichées

Pour afficher seulement les 200 dernières lignes :

```bash
pm2 logs OpiozenM --lines 200
```

## Désactiver les logs

Si vous souhaitez désactiver complètement les logs pour une application :

```javascript
module.exports = {
  apps: [{
    name: "OpiozenM",
    script: "index.js",
    out_file: "/dev/null",
    error_file: "/dev/null",
    // Sur Windows, utilisez plutôt :
    // out_file: "NUL",
    // error_file: "NUL",
  }]
};
```

## Bonnes pratiques pour réduire la taille des logs

1. **Limitez les messages de débogage** : Utilisez des niveaux de log (debug, info, warn, error) et n'activez le niveau debug qu'en développement.

2. **Filtrez les logs inutiles** : Évitez de logger des informations répétitives ou volumineuses comme les objets complets.

3. **Utilisez un format de log structuré** : Les logs au format JSON sont plus faciles à analyser et à filtrer.

4. **Implémentez une rotation des logs** : Comme expliqué ci-dessus, configurez PM2 pour faire une rotation automatique des logs.

5. **Nettoyez régulièrement** : Mettez en place un script cron ou une tâche planifiée pour nettoyer les logs anciens :

```bash
# Exemple de script cron pour nettoyer les logs tous les jours à minuit
0 0 * * * pm2 flush
```

## Utiliser PM2 Logrotate

PM2 propose un module officiel pour la rotation des logs :

```bash
pm2 install pm2-logrotate
```

Vous pouvez configurer ce module selon vos besoins :

```bash
# Définir la taille maximale des fichiers de logs à 10 Mo
pm2 set pm2-logrotate:max_size 10M

# Compresser les logs après rotation
pm2 set pm2-logrotate:compress true

# Conserver 7 jours de logs
pm2 set pm2-logrotate:retain 7

# Faire une rotation tous les jours à minuit
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

## Conclusion

Une bonne gestion des logs est essentielle pour maintenir les performances de votre serveur et faciliter le débogage. En suivant ces conseils, vous pourrez garder vos logs PM2 sous contrôle tout en conservant les informations importantes pour le dépannage.
