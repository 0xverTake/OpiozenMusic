const { Manager } = require('erela.js');
const { EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

// Fonction de journalisation améliorée
function logDebug(message, obj = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [LAVALINK DEBUG] ${message}`);
  if (obj) console.log(JSON.stringify(obj, null, 2));
}

// Fonction pour détecter le type de source
function detectSourceType(query) {
  // Spotify
  if (query.match(/^(https?:\/\/)?(open\.spotify\.com|spotify)\/(track|album|playlist)/) || 
      query.match(/^spotify:(track|album|playlist):/)) {
    return 'spotify';
  }
  // Apple Music
  else if (query.match(/^(https?:\/\/)?(music\.apple\.com|apple\.co)\/(album|playlist)/)) {
    return 'applemusic';
  }
  // Deezer
  else if (query.match(/^(https?:\/\/)?(www\.)?deezer\.com\/(track|album|playlist)/)) {
    return 'deezer';
  }
  // YouTube
  else if (query.match(/^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)/)) {
    return 'youtube';
  }
  // SoundCloud
  else if (query.match(/^(https?:\/\/)?(www\.|m\.)?(soundcloud\.com)/)) {
    return 'soundcloud';
  }
  // Recherche par défaut
  else {
    return 'search';
  }
}

class MusicPlayer {
  constructor(client) {
    this.client = client;
    
    // Récupérer les paramètres de configuration
    const host = process.env.LAVALINK_HOST || '127.0.0.1';
    const port = parseInt(process.env.LAVALINK_PORT || '2333');
    const password = process.env.LAVALINK_PASSWORD || 'youshallnotpass';
    const secure = process.env.LAVALINK_SECURE === 'true';
    
    // Journaliser les paramètres de connexion
    logDebug(`Initialisation de la connexion Lavalink avec les paramètres suivants:`);
    logDebug(`Host: ${host}, Port: ${port}, Secure: ${secure}, Password: ${password ? '****' : 'non défini'}`);
    
    this.manager = new Manager({
      // Define the nodes (Lavalink servers)
      nodes: [
        {
          identifier: 'Main Node',
          host: host,
          port: port,
          password: password,
          secure: secure,
          retryAmount: 10,
          retryDelay: 5000,
        },
      ],
      // Method to send voice data to Discord
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });

    // Initialize event listeners
    this.initEvents();
  }

  // Initialize the manager and set up event listeners
  initEvents() {
    // Node events
    this.manager.on('nodeConnect', (node) => {
      logDebug(`✅ Node ${node.options.identifier} connected.`);
    });

    this.manager.on('nodeError', (node, error) => {
      logDebug(`❌ Node ${node.options.identifier} had an error: ${error.message}`);
      logDebug('Détails de l\'erreur:', error);
      
      // Tentative de reconnexion après erreur
      setTimeout(() => {
        logDebug(`Tentative de reconnexion au nœud ${node.options.identifier}...`);
        node.connect();
      }, 5000);
    });

    this.manager.on('nodeDisconnect', (node) => {
      logDebug(`⚠️ Node ${node.options.identifier} disconnected.`);
      
      // Tentative de reconnexion après déconnexion
      setTimeout(() => {
        logDebug(`Tentative de reconnexion au nœud ${node.options.identifier}...`);
        node.connect();
      }, 5000);
    });

    // Player events
    this.manager.on('playerCreate', (player) => {
      console.log(`Player created in guild ${player.guild}`);
    });

    this.manager.on('playerDestroy', (player) => {
      console.log(`Player destroyed in guild ${player.guild}`);
    });

    this.manager.on('trackStart', (player, track) => {
      const channel = this.client.channels.cache.get(player.textChannel);
      if (channel) this.sendNowPlayingEmbed(channel, track, player);
    });

    this.manager.on('trackEnd', (player) => {
      // Track ended, nothing to do as the next track will automatically play
    });

    this.manager.on('trackStuck', (player, track) => {
      const channel = this.client.channels.cache.get(player.textChannel);
      if (channel) channel.send(`❌ La piste ${track.title} est bloquée. Passage à la suivante...`);
      player.stop();
    });

    this.manager.on('trackError', (player, track, error) => {
      const channel = this.client.channels.cache.get(player.textChannel);
      if (channel) channel.send(`❌ Erreur lors de la lecture de ${track.title}: ${error.message}`);
      player.stop();
    });

    this.manager.on('queueEnd', (player) => {
      const channel = this.client.channels.cache.get(player.textChannel);
      if (channel) {
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(embedColor)
              .setDescription('🎵 La file d\'attente est vide. Ajoutez des chansons avec `/play`!')
          ]
        });
      }
      
      // Disconnect after 5 minutes of inactivity
      setTimeout(() => {
        if (player.queue.size === 0 && !player.playing) {
          channel.send('👋 Déconnexion du salon vocal après 5 minutes d\'inactivité.');
          player.destroy();
        }
      }, 5 * 60 * 1000);
    });

    // Initialize the manager when the client is ready
    this.client.once('ready', () => {
      logDebug(`Initialisation du gestionnaire Lavalink avec l'ID utilisateur ${this.client.user.id}`);
      this.manager.init(this.client.user.id);
      
      // Vérifier l'état des nœuds après initialisation
      setTimeout(() => {
        const nodes = this.manager.nodes;
        logDebug(`État des nœuds après initialisation:`);
        nodes.forEach(node => {
          logDebug(`- ${node.options.identifier}: ${node.connected ? 'Connecté' : 'Déconnecté'}`);
        });
      }, 5000);
    });

    // Handle voice state updates for users
    this.client.on('raw', (d) => this.manager.updateVoiceState(d));
  }

  // Connect to a voice channel and create a player
  async connect(interaction) {
    const { channel } = interaction.member.voice;
    
    if (!channel) {
      throw new Error('Vous devez être dans un salon vocal pour utiliser cette commande!');
    }
    
    // Get or create a player
    const player = this.manager.create({
      guild: interaction.guild.id,
      voiceChannel: channel.id,
      textChannel: interaction.channel.id,
      selfDeafen: true,
    });
    
    // Connect to the voice channel
    player.connect();
    
    return player;
  }
  
  // Add a song to the queue
  async addSong(interaction, query) {
    let songInfo;
    let playlist = false;
    
    try {
      // Vérifier si des nœuds sont disponibles
      if (this.manager.nodes.size === 0) {
        logDebug("❌ Erreur: Aucun nœud Lavalink n'est configuré");
        throw new Error("Aucun nœud Lavalink n'est configuré");
      }
      
      // Vérifier si des nœuds sont connectés
      const connectedNodes = Array.from(this.manager.nodes.values()).filter(node => node.connected);
      if (connectedNodes.length === 0) {
        logDebug("❌ Erreur: No available nodes. Aucun nœud Lavalink n'est connecté");
        
        // Afficher l'état de tous les nœuds
        this.manager.nodes.forEach(node => {
          logDebug(`- Nœud ${node.options.identifier}: ${node.connected ? 'Connecté' : 'Déconnecté'}`);
        });
        
        throw new Error("No available nodes");
      }
      
      // Get or create a player
      const player = this.manager.players.get(interaction.guild.id) || await this.connect(interaction);
      
      // Détecter le type de source
      const sourceType = detectSourceType(query);
      logDebug(`Type de source détecté: ${sourceType} pour la requête: ${query}`);
      
      // Préfixer la requête pour les recherches
      let searchQuery = query;
      if (sourceType === 'search') {
        searchQuery = `ytsearch:${query}`;
        logDebug(`Recherche convertie en: ${searchQuery}`);
      }
      
      // Search for the song
      const res = await this.manager.search(searchQuery, interaction.user);
      
      // Handle different result types
      switch (res.loadType) {
        case 'TRACK_LOADED': {
          // Single track loaded
          player.queue.add(res.tracks[0]);
          songInfo = {
            title: res.tracks[0].title,
            url: res.tracks[0].uri,
            thumbnail: res.tracks[0].thumbnail || null,
            duration: res.tracks[0].duration,
            requestedBy: interaction.user.tag,
            source: res.tracks[0].sourceName || detectSourceType(res.tracks[0].uri)
          };
          
          if (!player.playing && !player.paused && !player.queue.size) {
            player.play();
          }
          break;
        }
        
        case 'PLAYLIST_LOADED': {
          // Playlist loaded
          playlist = true;
          
          // Add all tracks to the queue
          player.queue.add(res.tracks);
          
          songInfo = {
            title: res.playlist.name,
            url: query,
            count: res.tracks.length,
            source: detectSourceType(query)
          };
          
          if (!player.playing && !player.paused && !player.queue.size) {
            player.play();
          }
          break;
        }
        
        case 'SEARCH_RESULT': {
          // Search result, use the first result
          player.queue.add(res.tracks[0]);
          songInfo = {
            title: res.tracks[0].title,
            url: res.tracks[0].uri,
            thumbnail: res.tracks[0].thumbnail || null,
            duration: res.tracks[0].duration,
            requestedBy: interaction.user.tag,
            source: res.tracks[0].sourceName || 'youtube'
          };
          
          if (!player.playing && !player.paused && !player.queue.size) {
            player.play();
          }
          break;
        }
        
        case 'LOAD_FAILED': {
          throw new Error(`Erreur lors du chargement: ${res.exception?.message || 'Erreur inconnue'}`);
        }
        
        case 'NO_MATCHES': {
          throw new Error('Aucun résultat trouvé pour cette recherche!');
        }
        
        default: {
          throw new Error('Erreur inconnue lors de la recherche.');
        }
      }
      
      return { songInfo, playlist };
    } catch (error) {
      console.error(error);
      throw new Error(`Erreur lors de l'ajout de la chanson: ${error.message}`);
    }
  }
  
  // Skip the current song
  skip(guildId) {
    const player = this.manager.players.get(guildId);
    if (!player) return false;
    
    player.stop();
    return true;
  }
  
  // Pause the current song
  pause(guildId) {
    const player = this.manager.players.get(guildId);
    if (!player || player.paused) return false;
    
    player.pause(true);
    return true;
  }
  
  // Resume the current song
  resume(guildId) {
    const player = this.manager.players.get(guildId);
    if (!player || !player.paused) return false;
    
    player.pause(false);
    return true;
  }
  
  // Stop playing and clear the queue
  stop(guildId) {
    const player = this.manager.players.get(guildId);
    if (!player) return false;
    
    player.queue.clear();
    player.stop();
    return true;
  }
  
  // Toggle loop mode
  toggleLoop(guildId) {
    const player = this.manager.players.get(guildId);
    if (!player) return false;
    
    player.setTrackRepeat(!player.trackRepeat);
    return player.trackRepeat;
  }
  
  // Set the volume
  setVolume(guildId, volume) {
    const player = this.manager.players.get(guildId);
    if (!player) return false;
    
    if (volume < 0 || volume > 100) {
      throw new Error('Le volume doit être compris entre 0 et 100!');
    }
    
    player.setVolume(volume);
    return volume;
  }
  
  // Get the current queue
  getQueue(guildId) {
    const player = this.manager.players.get(guildId);
    if (!player) return null;
    
    return {
      current: player.queue.current ? {
        title: player.queue.current.title,
        url: player.queue.current.uri,
        thumbnail: player.queue.current.thumbnail || null,
        duration: player.queue.current.duration,
        requestedBy: player.queue.current.requester.tag
      } : null,
      queue: player.queue.map(track => ({
        title: track.title,
        url: track.uri,
        thumbnail: track.thumbnail || null,
        duration: track.duration,
        requestedBy: track.requester.tag
      })),
      loop: player.trackRepeat,
      volume: player.volume
    };
  }
  
  // Destroy the player and disconnect
  destroy(guildId) {
    const player = this.manager.players.get(guildId);
    if (!player) return false;
    
    player.destroy();
    return true;
  }
  
  // Send a now playing embed
  sendNowPlayingEmbed(channel, track, player) {
    if (!channel) return;
    
    // Format the duration
    const formatDuration = (ms) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('🎵 Lecture en cours')
      .setDescription(`[${track.title}](${track.uri})`)
      .addFields(
        { name: '⏱️ Durée', value: formatDuration(track.duration), inline: true },
        { name: '👤 Demandé par', value: track.requester.tag, inline: true },
        { name: '🔄 Mode boucle', value: player.trackRepeat ? 'Activé' : 'Désactivé', inline: true }
      )
      .setFooter({ text: `ZenBeat - ${player.queue.size} chanson(s) dans la file d'attente` })
      .setTimestamp();
    
    // Add thumbnail if available
    if (track.thumbnail) {
      embed.setThumbnail(track.thumbnail);
    }
    
    // Send the embed with control buttons
    channel.send({
      embeds: [embed],
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              style: 1, // Primary
              custom_id: 'music_pause',
              emoji: { name: '⏸️' },
              label: 'Pause'
            },
            {
              type: 2, // Button
              style: 1, // Primary
              custom_id: 'music_resume',
              emoji: { name: '▶️' },
              label: 'Reprendre'
            },
            {
              type: 2, // Button
              style: 1, // Primary
              custom_id: 'music_skip',
              emoji: { name: '⏭️' },
              label: 'Passer'
            },
            {
              type: 2, // Button
              style: 4, // Danger
              custom_id: 'music_stop',
              emoji: { name: '⏹️' },
              label: 'Arrêter'
            }
          ]
        }
      ]
    });
  }
}

module.exports = MusicPlayer;
