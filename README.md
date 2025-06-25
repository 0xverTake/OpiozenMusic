# ZenBeat - Bot Musical Discord

ZenBeat est un bot musical Discord qui prend en charge YouTube, SoundCloud et d'autres plateformes avec des contrôles par boutons. Désormais compatible avec Lavalink pour une meilleure qualité audio et plus de fonctionnalités.

## Fonctionnalités

**Fonctionnalités avec Lavalink** (recommandé) :
- Lecture de musique depuis YouTube (vidéos et playlists)
- Lecture de musique depuis SoundCloud (pistes et playlists)
- Support pour Twitch, Bandcamp, Vimeo et fichiers audio HTTP
- Recherche par titre (pas besoin d'URL directe)
- Contrôles par boutons (pause, reprise, passer, arrêter)
- Mode boucle
- Contrôle du volume
- File d'attente de chansons

**Fonctionnalités alternatives** (avec ytdl-core et @distube/ytdl-core) :
- Lecture de musique depuis YouTube (vidéos individuelles uniquement)
- Contrôles par boutons (pause, reprise, passer, arrêter)
- Mode boucle
- Contrôle du volume
- File d'attente de chansons
- Limitations : pas de playlists, pas de recherche, pas de SoundCloud

## Installation

1. Clonez ce dépôt
2. Installez les dépendances avec `npm install`
3. Copiez `config.json.example` en `config.json` et remplissez les informations nécessaires
4. Démarrez le bot avec `npm start`

## Utilisation avec Lavalink (Recommandé)

Pour profiter de toutes les fonctionnalités, utilisez Lavalink :

1. Installez Java 13 ou supérieur
2. Téléchargez Lavalink depuis [GitHub](https://github.com/freyacodes/Lavalink/releases)
3. Utilisez le fichier `application.yml` fourni
4. Démarrez Lavalink avec `java -jar Lavalink.jar`
5. Configurez les variables d'environnement pour le bot (voir ci-dessous)

Pour des instructions détaillées, consultez le fichier [LAVALINK_GUIDE.md](LAVALINK_GUIDE.md).

## Utilisation avec PM2 (Recommandé pour la production)

Pour exécuter le bot en arrière-plan et le maintenir actif 24/7, vous pouvez utiliser PM2 :

1. Installez PM2 globalement : `npm install -g pm2`
2. Démarrez le bot avec PM2 : `pm2 start ecosystem.config.js`

Ou utilisez simplement les scripts de démarrage fournis :
- Sur Windows : exécutez `start-bot.bat`
- Sur Linux/Mac : exécutez `./start-bot.sh`

Pour plus d'informations sur l'utilisation de PM2, consultez le fichier [PM2_GUIDE.md](PM2_GUIDE.md).

## Configuration

Vous pouvez configurer le bot de plusieurs façons :

### 1. Utiliser config.json

Copiez `config.json.example` en `config.json` et remplissez les informations suivantes :

```json
{
  "token": "VOTRE_TOKEN_DISCORD",
  "clientId": "ID_CLIENT_DE_VOTRE_BOT",
  "guildId": "ID_DE_VOTRE_SERVEUR",
  "prefix": "!",
  "embedColor": "#7289DA"
}
```

### 2. Utiliser des variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# Obligatoire
TOKEN=VOTRE_TOKEN_DISCORD

# Pour Lavalink (recommandé)
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

# Pour ytdl-core (alternative)
YOUTUBE_COOKIE=VOTRE_COOKIE_YOUTUBE
```

## Méthodes de lecture audio

### Méthode 1 : Utiliser Lavalink (Recommandé)

Lavalink est un serveur audio autonome qui offre de nombreux avantages :
- Meilleure qualité audio
- Support pour plus de sources (YouTube, SoundCloud, Twitch, etc.)
- Meilleure gestion des playlists
- Recherche intégrée
- Moins de problèmes avec les restrictions de YouTube
- Performances améliorées

Voir [LAVALINK_GUIDE.md](LAVALINK_GUIDE.md) pour les instructions d'installation et d'utilisation.

### Méthode 2 : Utiliser ytdl-core et @distube/ytdl-core

Si vous ne pouvez pas utiliser Lavalink, le bot peut fonctionner avec `ytdl-core` et `@distube/ytdl-core`, mais avec des fonctionnalités limitées :
- Les playlists YouTube ne sont pas directement prises en charge
- La recherche YouTube n'est pas supportée (il faut fournir une URL directe YouTube)
- SoundCloud n'est pas pris en charge (YouTube uniquement)

## Commandes

- `/play <query>` - Joue une chanson ou ajoute à la file d'attente (URL ou recherche avec Lavalink)
- `/pause` - Met en pause la chanson en cours
- `/resume` - Reprend la lecture de la chanson en pause
- `/skip` - Passe à la chanson suivante
- `/stop` - Arrête la lecture et vide la file d'attente
- `/queue` - Affiche la file d'attente actuelle
- `/loop` - Active/désactive le mode boucle
- `/volume <1-100>` - Règle le volume de lecture
- `/help` - Affiche la liste des commandes

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
