<div align="center">
  <img src="assets/pp.jpg" alt="ZenBeat Logo" width="100%">
</div>

# ZenBeat - Bot Musical Discord

<div align="center">

[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Lavalink](https://img.shields.io/badge/Lavalink-Powered-orange.svg)](https://github.com/freyacodes/Lavalink)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-brightgreen.svg)](https://nodejs.org)

</div>

<div align="center">
  <b>Un bot musical Discord puissant et élégant avec support multi-plateformes et contrôles intuitifs</b>
</div>

<br>

## ✨ Fonctionnalités

<table>
  <tr>
    <td>
      <h3>🎵 Sources Musicales</h3>
      <ul>
        <li>YouTube (vidéos et playlists)</li>
        <li>Spotify (avec LavaSrc)</li>
        <li>Apple Music (avec LavaSrc)</li>
        <li>Deezer (avec LavaSrc)</li>
        <li>SoundCloud</li>
        <li>Twitch, Bandcamp, Vimeo</li>
      </ul>
    </td>
    <td>
      <h3>🎮 Contrôles</h3>
      <ul>
        <li>Boutons interactifs</li>
        <li>Commandes slash</li>
        <li>Contrôle du volume</li>
        <li>Mode boucle</li>
        <li>File d'attente avancée</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>⚙️ Technique</h3>
      <ul>
        <li>Lavalink pour une qualité audio supérieure</li>
        <li>Recherche par titre (pas besoin d'URL)</li>
        <li>Faible consommation de ressources</li>
        <li>Haute disponibilité avec PM2</li>
      </ul>
    </td>
    <td>
      <h3>🛠️ Facilité d'utilisation</h3>
      <ul>
        <li>Installation simple</li>
        <li>Documentation détaillée</li>
        <li>Guides de dépannage</li>
        <li>Configuration flexible</li>
      </ul>
    </td>
  </tr>
</table>

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v16.9.0 ou supérieur)
- [npm](https://www.npmjs.com/) (inclus avec Node.js)
- [Java](https://www.oracle.com/java/technologies/javase-jdk13-downloads.html) (v13 ou supérieur, pour Lavalink)

### Étapes d'installation

1. **Clonez le dépôt**
   ```bash
   git clone https://github.com/votre-nom/ZenBeat.git
   cd ZenBeat
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Configurez le bot**
   ```bash
   cp config.json.example config.json
   cp .env.example .env
   ```
   Modifiez `config.json` et `.env` avec vos informations

4. **Déployez les commandes slash**
   ```bash
   node deploy-commands.js
   ```

5. **Démarrez Lavalink**
   ```bash
   # Sur Windows
   start-lavalink.bat
   
   # Sur Linux/Mac
   ./start-lavalink.sh
   ```

6. **Démarrez le bot**
   ```bash
   # Démarrage simple
   npm start
   
   # Avec PM2 (recommandé pour la production)
   pm2 start ecosystem.config.js
   ```

## 📚 Utilisation

### Commandes principales

| Commande | Description |
|----------|-------------|
| `/play <query>` | Joue une chanson ou ajoute à la file d'attente (URL ou recherche) |
| `/pause` | Met en pause la chanson en cours |
| `/resume` | Reprend la lecture de la chanson en pause |
| `/skip` | Passe à la chanson suivante |
| `/stop` | Arrête la lecture et vide la file d'attente |
| `/queue` | Affiche la file d'attente actuelle |
| `/loop` | Active/désactive le mode boucle |
| `/volume <1-100>` | Règle le volume de lecture |
| `/help` | Affiche la liste des commandes |

### Exemples d'utilisation

```
/play never gonna give you up
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
/play https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
/play https://music.apple.com/fr/album/song/123456789
/play https://www.deezer.com/track/987654321
```

## 🔧 Configuration avancée

### Lavalink avec LavaSrc

ZenBeat prend en charge le plugin LavaSrc pour Lavalink, permettant la lecture depuis Spotify, Apple Music, et Deezer. Consultez [LAVASRC_GUIDE.md](LAVASRC_GUIDE.md) pour les instructions de configuration.

### Hébergement 24/7

Pour maintenir votre bot en ligne 24/7, nous recommandons l'utilisation de PM2. Consultez [PM2_LAVALINK_GUIDE.md](PM2_LAVALINK_GUIDE.md) pour les instructions détaillées.

### Résolution des problèmes

Si vous rencontrez des problèmes, consultez nos guides de dépannage :
- [NO_AVAILABLE_NODES_FIX.md](NO_AVAILABLE_NODES_FIX.md) - Pour les problèmes de connexion à Lavalink
- [TOKEN_ERROR_FIX.md](TOKEN_ERROR_FIX.md) - Pour les problèmes d'authentification Discord
- [SHOUKAKU_V4_API_FIX.md](SHOUKAKU_V4_API_FIX.md) - Pour l'erreur "node.joinChannel is not a function"

## 📋 Guides

- [LAVALINK_GUIDE.md](LAVALINK_GUIDE.md) - Guide complet pour Lavalink
- [LAVASRC_GUIDE.md](LAVASRC_GUIDE.md) - Configuration de LavaSrc pour Spotify, Apple Music, etc.
- [PM2_GUIDE.md](PM2_GUIDE.md) - Utilisation de PM2 pour l'hébergement
- [PM2_LAVALINK_GUIDE.md](PM2_LAVALINK_GUIDE.md) - Configuration de PM2 avec Lavalink
- [HOSTING_GUIDE.md](hosting-guide.md) - Guide d'hébergement sur VPS
- [LAVALINK_V4_UPDATE.md](LAVALINK_V4_UPDATE.md) - Mise à jour vers Lavalink v4
- [SHOUKAKU_V4_API_FIX.md](SHOUKAKU_V4_API_FIX.md) - Correction de l'erreur "node.joinChannel is not a function"

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

---

<div align="center">
  <p>Créé avec ❤️ pour les amateurs de musique sur Discord</p>
  <p>© 2025 ZenBeat</p>
</div>
