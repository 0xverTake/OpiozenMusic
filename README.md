# ZenBeat - Bot Musical Discord

ZenBeat est un bot musical Discord complet qui permet de jouer de la musique depuis YouTube et SoundCloud. Il offre une interface utilisateur intuitive avec des boutons de contrôle et des messages visuellement attrayants.

![ZenBeat Logo](https://i.imgur.com/YOUR_IMAGE_ID_HERE.png)

## ✨ Fonctionnalités

- 🎵 Lecture de musique depuis **YouTube** et **SoundCloud**
- 📋 Prise en charge des vidéos individuelles et des playlists
- 🎛️ Contrôles par boutons (pause, reprise, passer, arrêter)
- 🔊 Commandes de volume et de boucle
- 📊 Affichage détaillé de la file d'attente
- 🎨 Messages d'intégration visuellement attrayants
- 👋 Message de bienvenue personnalisé lors de l'ajout à un serveur

## 📋 Commandes

| Commande | Description |
|----------|-------------|
| `/play <titre ou URL>` | Joue de la musique depuis YouTube ou SoundCloud |
| `/skip` | Passe à la chanson suivante dans la file d'attente |
| `/stop` | Arrête la lecture et vide la file d'attente |
| `/queue` | Affiche la file d'attente actuelle |
| `/pause` | Met en pause la lecture en cours |
| `/resume` | Reprend la lecture en pause |
| `/volume <0-100>` | Règle le volume de lecture |
| `/loop` | Active ou désactive la lecture en boucle |
| `/help` | Affiche la liste des commandes disponibles |

## 🚀 Guide d'installation

### Prérequis

- [Node.js](https://nodejs.org/) (v16.9.0 ou supérieur)
- [npm](https://www.npmjs.com/) (généralement installé avec Node.js)
- Un [compte développeur Discord](https://discord.com/developers/applications)

### Étape 1: Créer une application Discord

1. Rendez-vous sur le [Portail des développeurs Discord](https://discord.com/developers/applications)
2. Cliquez sur "New Application" (Nouvelle application)
3. Donnez un nom à votre application (par exemple, "ZenBeat")
4. Naviguez vers l'onglet "Bot"
5. Cliquez sur "Add Bot" (Ajouter un bot)
6. Sous la section "Token", cliquez sur "Copy" (Copier) pour copier le token du bot
   - ⚠️ **IMPORTANT**: Ne partagez jamais ce token! Il donne un accès complet à votre bot.

### Étape 2: Configurer les intentions (Intents)

Toujours dans l'onglet "Bot" du portail des développeurs:

1. Activez les options sous "Privileged Gateway Intents" (Intentions privilégiées de la passerelle):
   - PRESENCE INTENT
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT

### Étape 3: Inviter le bot sur votre serveur

1. Allez dans l'onglet "OAuth2" > "URL Generator"
2. Dans la section "Scopes", sélectionnez "bot" et "applications.commands"
3. Dans la section "Bot Permissions", sélectionnez:
   - "Send Messages"
   - "Embed Links"
   - "Attach Files"
   - "Read Message History"
   - "Add Reactions"
   - "Connect"
   - "Speak"
   - "Use Voice Activity"
4. Copiez l'URL générée et ouvrez-la dans votre navigateur
5. Sélectionnez le serveur où vous souhaitez ajouter le bot et suivez les instructions

### Étape 4: Configurer le projet

1. Clonez ce dépôt ou téléchargez les fichiers
   ```bash
   git clone https://github.com/votre-nom/zenbeat.git
   cd zenbeat
   ```

2. Installez les dépendances
   ```bash
   npm install
   ```

3. Modifiez le fichier `config.json` avec vos informations:
   ```json
   {
     "token": "VOTRE_TOKEN_BOT",
     "clientId": "ID_DE_VOTRE_APPLICATION",
     "guildId": "ID_DE_VOTRE_SERVEUR_POUR_TESTS",
     "prefix": "!",
     "embedColor": "#7289DA"
   }
   ```
   - Pour obtenir l'ID de votre application, allez dans les paramètres généraux de votre application Discord
   - Pour obtenir l'ID de votre serveur, activez le mode développeur dans Discord (Paramètres > Avancés > Mode développeur), puis faites un clic droit sur votre serveur et sélectionnez "Copier l'identifiant"

### Étape 5: Déployer les commandes slash

```bash
node deploy-commands.js
```

### Étape 6: Démarrer le bot

```bash
node index.js
```

Si tout est configuré correctement, vous devriez voir "Ready! Logged in as [nom de votre bot]" dans la console.

### Hébergement sur un serveur Debian

Pour héberger le bot sur un serveur Debian 12 et le maintenir actif 24/7, consultez le fichier [hosting-guide.md](hosting-guide.md) qui contient des instructions détaillées pour:
- Installer Node.js et les dépendances nécessaires
- Configurer PM2 pour garder le bot en ligne en permanence
- Configurer le démarrage automatique au redémarrage du serveur
- Surveiller et mettre à jour le bot

## 🎮 Utilisation

1. Rejoignez un salon vocal
2. Utilisez la commande `/play` suivie du titre de la chanson ou d'une URL YouTube/SoundCloud
   ```
   /play Daft Punk Get Lucky
   ```
   ou
   ```
   /play https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

3. Utilisez les boutons sous le message "Lecture en cours" ou les commandes slash pour contrôler la lecture

## 🔧 Dépannage

### Le bot ne se connecte pas au salon vocal

- Vérifiez que le bot a les permissions nécessaires pour rejoindre et parler dans les salons vocaux
- Assurez-vous d'être dans un salon vocal avant d'utiliser la commande `/play`

### Les commandes slash n'apparaissent pas

- Exécutez à nouveau `node deploy-commands.js`
- Vérifiez que vous avez sélectionné les scopes "bot" et "applications.commands" lors de l'invitation du bot
- Il peut y avoir un délai avant que les commandes slash n'apparaissent (jusqu'à une heure)

### Erreurs lors de la lecture de musique

- Vérifiez que les URL sont valides et accessibles
- Certaines vidéos YouTube peuvent être restreintes et ne pas être lisibles par le bot
- Assurez-vous que votre version de Node.js est à jour

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 🙏 Remerciements

- [discord.js](https://discord.js.org/) - Pour l'API Discord
- [play-dl](https://github.com/play-dl/play-dl) - Pour la lecture de musique YouTube et SoundCloud
- [Discord](https://discord.com/) - Pour la plateforme incroyable

---

Créé avec ❤️ pour la communauté Discord
