# ZenBeat - Bot Musical Discord

ZenBeat est un bot musical Discord qui prend en charge YouTube et SoundCloud avec des contrôles par boutons.

## Fonctionnalités

- Lecture de musique depuis YouTube et SoundCloud
- Prise en charge des playlists
- Contrôles par boutons (pause, reprise, passer, arrêter)
- Mode boucle
- Contrôle du volume
- File d'attente de chansons

## Installation

1. Clonez ce dépôt
2. Installez les dépendances avec `npm install`
3. Copiez `config.json.example` en `config.json` et remplissez les informations nécessaires
4. Démarrez le bot avec `npm start`

## Configuration

Vous pouvez configurer le bot de deux façons :

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
TOKEN=VOTRE_TOKEN_DISCORD
YOUTUBE_COOKIE=VOTRE_COOKIE_YOUTUBE
```

## Résoudre le problème "Sign in to confirm you're not a bot"

Si vous rencontrez l'erreur "Sign in to confirm you're not a bot" lors de l'utilisation de la commande `/play`, suivez ces étapes pour résoudre le problème :

### Méthode 1 : Utiliser le générateur de cookies

1. Installez les dépendances nécessaires :
   ```
   npm install puppeteer dotenv
   ```

2. Exécutez le script de génération de cookies :
   ```
   node utils/generateCookies.js
   ```

3. Suivez les instructions à l'écran pour vous connecter à YouTube et générer les cookies.

4. Une fois les cookies générés, ils seront automatiquement enregistrés dans un fichier `.env.example`. Renommez ce fichier en `.env` ou copiez la ligne `YOUTUBE_COOKIE` dans votre fichier `.env` existant.

### Méthode 2 : Obtenir les cookies manuellement

1. Connectez-vous à YouTube dans votre navigateur.
2. Ouvrez les outils de développement (F12 ou clic droit > Inspecter).
3. Allez dans l'onglet "Application" > "Cookies" > "https://www.youtube.com".
4. Copiez tous les cookies et leurs valeurs.
5. Créez un fichier `.env` à la racine du projet avec le contenu suivant :
   ```
   YOUTUBE_COOKIE="cookie1=valeur1; cookie2=valeur2; ..."
   ```

### Méthode 3 : Utiliser une autre bibliothèque

Si les méthodes ci-dessus ne fonctionnent pas, vous pouvez envisager d'utiliser une autre bibliothèque pour extraire les vidéos YouTube, comme `ytdl-core` ou `@distube/ytdl-core`.

## Commandes

- `/play <query>` - Joue une chanson ou ajoute à la file d'attente
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
