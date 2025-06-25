# Alternatives pour la lecture de médias dans les bots Discord

Ce document présente plusieurs bibliothèques et projets GitHub qui peuvent être utilisés comme alternatives à ytdl-core pour la lecture de médias dans les bots Discord.

## Bibliothèques recommandées

### 1. play-dl

**GitHub**: [https://github.com/play-dl/play-dl](https://github.com/play-dl/play-dl)

**Fonctionnalités**:
- Support pour YouTube (vidéos, playlists, recherche)
- Support pour SoundCloud (pistes, playlists, recherche)
- Support pour Spotify (pistes, playlists, albums)
- Support pour les fichiers MP3/MP4 locaux
- Pas besoin de dépendances externes comme FFmpeg
- Activement maintenu et mis à jour

**Installation**:
```bash
npm install play-dl
```

**Exemple d'utilisation**:
```javascript
const playdl = require('play-dl');
const { createAudioResource } = require('@discordjs/voice');

// YouTube
const stream = await playdl.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
const resource = createAudioResource(stream.stream, { inputType: stream.type });

// SoundCloud
const scStream = await playdl.stream('https://soundcloud.com/user/track');
const scResource = createAudioResource(scStream.stream, { inputType: scStream.type });

// Spotify (convertit en recherche YouTube)
const spotifyInfo = await playdl.spotify('https://open.spotify.com/track/...');
const searched = await playdl.search(`${spotifyInfo.name} ${spotifyInfo.artists[0].name}`, { limit: 1 });
const spotifyStream = await playdl.stream(searched[0].url);
```

### 2. discord-player

**GitHub**: [https://github.com/Androz2091/discord-player](https://github.com/Androz2091/discord-player)

**Fonctionnalités**:
- Framework complet pour les bots musicaux Discord
- Support pour YouTube, SoundCloud, Spotify, Apple Music, et plus
- Système de file d'attente intégré
- Filtres audio
- Extraction de playlists
- Compatible avec discord.js v14

**Installation**:
```bash
npm install discord-player @discord-player/extractor
```

**Exemple d'utilisation**:
```javascript
const { Player } = require('discord-player');
const { Client } = require('discord.js');

const client = new Client();
const player = new Player(client);

// Ajouter les extracteurs
player.extractors.loadDefault();

// Jouer une chanson
const queue = player.createQueue(guild, {
    metadata: {
        channel: interaction.channel
    }
});

try {
    await queue.connect(interaction.member.voice.channel);
} catch {
    queue.destroy();
    return await interaction.reply({ content: 'Impossible de rejoindre votre canal vocal!', ephemeral: true });
}

const track = await player.search(query, {
    requestedBy: interaction.user
}).then(x => x.tracks[0]);

if (!track) return await interaction.reply({ content: `❌ | Piste **${query}** introuvable!` });

queue.play(track);
```

### 3. distube

**GitHub**: [https://github.com/skick1234/DisTube](https://github.com/skick1234/DisTube)

**Fonctionnalités**:
- Support pour YouTube, SoundCloud, Spotify
- Système de file d'attente intégré
- Filtres audio
- Recherche et lecture de playlists
- Compatible avec discord.js v14

**Installation**:
```bash
npm install distube @distube/spotify @distube/soundcloud @distube/yt-dlp
```

**Exemple d'utilisation**:
```javascript
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

// Créer une instance DisTube
const distube = new DisTube(client, {
    searchSongs: 5,
    searchCooldown: 30,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: false,
    plugins: [
        new SpotifyPlugin({
            emitEventsAfterFetching: true
        }),
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ]
});

// Jouer une chanson
distube.play(voiceChannel, query, {
    member: interaction.member,
    textChannel: interaction.channel
});
```

### 4. lavalink avec erela.js

**GitHub**: 
- Lavalink: [https://github.com/freyacodes/Lavalink](https://github.com/freyacodes/Lavalink)
- erela.js: [https://github.com/MenuDocs/erela.js](https://github.com/MenuDocs/erela.js)

**Fonctionnalités**:
- Solution client-serveur (nécessite un serveur Lavalink)
- Excellentes performances
- Support pour YouTube, SoundCloud, Twitch, et plus
- Recherche et lecture de playlists
- Filtres audio avancés
- Gestion de la charge sur plusieurs nœuds

**Installation**:
```bash
npm install erela.js
```

**Remarque**: Nécessite un serveur Lavalink en cours d'exécution.

**Exemple d'utilisation**:
```javascript
const { Manager } = require("erela.js");

const manager = new Manager({
    nodes: [{
        host: "localhost",
        port: 2333,
        password: "youshallnotpass"
    }],
    send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    }
});

// Écouter les événements ready
client.once("ready", () => {
    manager.init(client.user.id);
});

// Jouer une chanson
const res = await manager.search(query, interaction.user);
const player = manager.create({
    guild: interaction.guild.id,
    voiceChannel: interaction.member.voice.channel.id,
    textChannel: interaction.channel.id,
});

player.connect();
player.queue.add(res.tracks[0]);

if (!player.playing && !player.paused && !player.queue.size) player.play();
```

## Conclusion

Pour un bot Discord musical complet avec support pour plusieurs plateformes (YouTube, SoundCloud, Spotify, MP3, etc.), voici les recommandations:

1. **Solution la plus simple**: `play-dl` - Facile à intégrer, supporte plusieurs plateformes, activement maintenu.

2. **Solution la plus complète**: `discord-player` - Framework complet avec de nombreuses fonctionnalités intégrées.

3. **Solution la plus performante**: `Lavalink` avec `erela.js` - Nécessite plus de configuration mais offre les meilleures performances pour les grands bots.

4. **Alternative solide**: `DisTube` - Bon équilibre entre facilité d'utilisation et fonctionnalités.

Pour ZenBeat, je recommande de revenir à `play-dl` ou d'adopter `discord-player` pour une solution plus complète et facile à maintenir.
