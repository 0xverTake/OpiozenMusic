# Guide d'installation et d'utilisation de Lavalink avec ZenBeat

Ce guide vous explique comment configurer et utiliser Lavalink avec le bot musical ZenBeat pour une meilleure qualité audio et plus de fonctionnalités.

## Qu'est-ce que Lavalink ?

Lavalink est un serveur audio autonome pour Discord qui offre plusieurs avantages :

- Meilleure qualité audio
- Support pour plus de sources (YouTube, SoundCloud, Twitch, etc.)
- Meilleure gestion des playlists
- Recherche intégrée
- Moins de problèmes avec les restrictions de YouTube
- Performances améliorées

## Prérequis

- Java 13 ou supérieur
- Un serveur ou ordinateur pour héberger Lavalink (peut être le même que celui qui héberge le bot)

## Installation de Lavalink

### Étape 1 : Télécharger Lavalink

1. Téléchargez la dernière version de Lavalink depuis [GitHub](https://github.com/freyacodes/Lavalink/releases)
2. Placez le fichier JAR dans un dossier dédié (par exemple, `lavalink/`)

### Étape 2 : Configurer Lavalink

1. Copiez le fichier `application.yml` fourni dans le même dossier que le fichier JAR
2. Modifiez le fichier selon vos besoins (le mot de passe par défaut est "youshallnotpass")

```yaml
server:
  port: 2333
  address: 0.0.0.0
lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
```

### Étape 3 : Démarrer Lavalink

Ouvrez un terminal et exécutez :

```bash
java -jar Lavalink.jar
```

Vous devriez voir des logs indiquant que Lavalink a démarré avec succès.

## Configuration du bot ZenBeat pour utiliser Lavalink

### Étape 1 : Configurer les variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

Si vous hébergez Lavalink sur un serveur distant, remplacez `localhost` par l'adresse IP ou le nom d'hôte du serveur.

### Étape 2 : Démarrer le bot

Démarrez le bot normalement :

```bash
npm start
```

Ou avec PM2 :

```bash
pm2 start ecosystem.config.js
```

## Fonctionnalités disponibles avec Lavalink

Avec Lavalink, ZenBeat prend désormais en charge :

- **YouTube** : vidéos individuelles, playlists, recherche par titre
- **SoundCloud** : pistes individuelles, playlists
- **Twitch** : streams
- **Bandcamp** : pistes et albums
- **Vimeo** : vidéos
- **HTTP** : fichiers audio directs

## Commandes

Toutes les commandes existantes fonctionnent avec Lavalink :

- `/play <query>` - Joue une chanson ou ajoute à la file d'attente (URL ou recherche)
- `/pause` - Met en pause la chanson en cours
- `/resume` - Reprend la lecture de la chanson en pause
- `/skip` - Passe à la chanson suivante
- `/stop` - Arrête la lecture et vide la file d'attente
- `/queue` - Affiche la file d'attente actuelle
- `/loop` - Active/désactive le mode boucle
- `/volume <1-100>` - Règle le volume de lecture

## Dépannage

### Lavalink ne démarre pas

- Vérifiez que Java 13+ est installé : `java -version`
- Vérifiez que le port 2333 n'est pas déjà utilisé
- Vérifiez les logs pour plus d'informations

### Le bot ne se connecte pas à Lavalink

- Vérifiez que Lavalink est en cours d'exécution
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que le mot de passe dans `application.yml` correspond à celui dans les variables d'environnement

### Problèmes de lecture

- Vérifiez les logs de Lavalink pour des erreurs spécifiques
- Assurez-vous que les sources sont activées dans `application.yml`
- Vérifiez que le bot a les permissions nécessaires dans le salon vocal

## Hébergement de Lavalink sur un serveur distant

Si vous souhaitez héberger Lavalink sur un serveur distant :

1. Installez Java sur le serveur
2. Transférez le fichier JAR et `application.yml` sur le serveur
3. Démarrez Lavalink comme indiqué ci-dessus
4. Configurez le pare-feu pour autoriser les connexions sur le port 2333
5. Mettez à jour les variables d'environnement du bot avec l'adresse du serveur

## Ressources supplémentaires

- [Documentation officielle de Lavalink](https://github.com/freyacodes/Lavalink/blob/master/README.md)
- [Documentation d'erela.js](https://github.com/MenuDocs/erela.js)
