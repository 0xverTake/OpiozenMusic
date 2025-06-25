const { Shoukaku, Connectors } = require('shoukaku');
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

// Format the duration
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

class MusicPlayer {
  constructor(client) {
    this.client = client;
    this.players = new Map();
    this.queues = new Map();
    
    // Récupérer les paramètres de configuration
    const host = process.env.LAVALINK_HOST || '127.0.0.1';
    const port = parseInt(process.env.LAVALINK_PORT || '2333');
    const password = process.env.LAVALINK_PASSWORD || 'youshallnotpass';
    const secure = process.env.LAVALINK_SECURE === 'true';
    
    // Journaliser les paramètres de connexion
    logDebug(`Initialisation de la connexion Lavalink avec les paramètres suivants:`);
    logDebug(`Host: ${host}, Port: ${port}, Secure: ${secure}, Password: ${password ? '****' : 'non défini'}`);
    
    // Initialize Shoukaku
    this.shoukaku = new Shoukaku(
      new Connectors.DiscordJS(client), 
      [
        {
          name: 'Main Node',
          url: `${host}:${port}`,
          auth: password,
          secure: secure,
          path: '/v4/websocket'
        }
      ],
      {
        moveOnDisconnect: false,
        resume: true,
        resumeTimeout: 30,
        reconnectTries: 10,
        restTimeout: 10000
      }
    );

    // Initialize event listeners
    this.initEvents();
  }

  // Initialize the manager and set up event listeners
  initEvents() {
    // Node events
    this.shoukaku.on('ready', (name) => {
      logDebug(`✅ Node ${name} connected.`);
    });

    this.shoukaku.on('error', (name, error) => {
      logDebug(`❌ Node ${name} had an error: ${error.message}`);
      logDebug('Détails de l\'erreur:', error);
    });

    this.shoukaku.on('disconnect', (name, reason) => {
      logDebug(`⚠️ Node ${name} disconnected. Reason: ${reason}`);
    });

    this.shoukaku.on('reconnecting', (name) => {
      logDebug(`🔄 Node ${name} is reconnecting...`);
    });

    // Initialize the manager when the client is ready
    this.client.once('ready', () => {
      logDebug(`Initialisation du gestionnaire Lavalink avec l'ID utilisateur ${this.client.user.id}`);
      
      // Vérifier l'état des nœuds après initialisation
      setTimeout(() => {
        const nodes = this.shoukaku.nodes;
        logDebug(`État des nœuds après initialisation:`);
        nodes.forEach((node, name) => {
          logDebug(`- ${name}: ${node.state === 1 ? 'Connecté' : 'Déconnecté'}`);
        });
      }, 5000);
    });
  }

  // Get a node from Shoukaku
  getNode() {
    try {
      // Get the first available node using the nodes Map
      const nodes = Array.from(this.shoukaku.nodes.values());
      const availableNode = nodes.find(node => node.state === 1) || nodes[0];
      
      if (!availableNode) {
        logDebug("❌ Erreur: No available nodes found in the nodes Map");
        throw new Error("No available nodes");
      }
      
      return availableNode;
    } catch (error) {
      logDebug(`❌ Erreur lors de la récupération d'un nœud: ${error.message}`);
      throw error;
    }
  }

  // Get or create a player for a guild
  async getPlayer(guildId) {
    return this.players.get(guildId);
  }

  // Get or create a queue for a guild
  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        tracks: [],
        current: null,
        loop: false,
        volume: 100
      });
    }
    return this.queues.get(guildId);
  }

  // Connect to a voice channel and create a player
  async connect(interaction) {
    const { channel } = interaction.member.voice;
    
    if (!channel) {
      throw new Error('Vous devez être dans un salon vocal pour utiliser cette commande!');
    }
    
    // Check if a player already exists
    if (this.players.has(interaction.guild.id)) {
      return this.players.get(interaction.guild.id);
    }
    
    try {
      // Get the node
      const node = this.getNode();
      if (!node) throw new Error("No available nodes");
      
      // Create a player - using the correct API for Shoukaku v4
      // La méthode joinVoiceChannel est sur l'instance de Shoukaku, pas sur le nœud
      const player = await this.shoukaku.joinVoiceChannel({
        guildId: interaction.guild.id,
        channelId: channel.id,
        shardId: interaction.guild.shardId || 0,
        deaf: true,
        node: node.name // Spécifier quel nœud utiliser
      });
      
      // Store the player and create a queue
      this.players.set(interaction.guild.id, player);
      this.getQueue(interaction.guild.id);
      
      // Set up player events
      this.setupPlayerEvents(player, interaction.guild.id, interaction.channel.id);
      
      return player;
    } catch (error) {
      logDebug(`Error connecting to voice channel: ${error.message}`);
      throw error;
    }
  }
  
  // Set up player events
  setupPlayerEvents(player, guildId, textChannelId) {
    player.on('start', () => {
      const queue = this.getQueue(guildId);
      if (queue.current) {
        const channel = this.client.channels.cache.get(textChannelId);
        if (channel) this.sendNowPlayingEmbed(channel, queue.current, guildId);
      }
    });
    
    player.on('end', () => {
      const queue = this.getQueue(guildId);
      
      // If loop is enabled, add the current track back to the queue
      if (queue.loop && queue.current) {
        queue.tracks.push(queue.current);
      }
      
      // If there are more tracks in the queue, play the next one
      if (queue.tracks.length > 0) {
        const nextTrack = queue.tracks.shift();
        queue.current = nextTrack;
        this.playTrack(guildId, nextTrack);
      } else {
        // Queue is empty
        queue.current = null;
        const channel = this.client.channels.cache.get(textChannelId);
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
          if (!queue.current && this.players.has(guildId)) {
            const player = this.players.get(guildId);
            if (player) {
              const channel = this.client.channels.cache.get(textChannelId);
              if (channel) {
                channel.send('👋 Déconnexion du salon vocal après 5 minutes d\'inactivité.');
              }
              this.destroy(guildId);
            }
          }
        }, 5 * 60 * 1000);
      }
    });
    
    player.on('exception', (error) => {
      logDebug(`Player exception: ${error.message}`);
      const channel = this.client.channels.cache.get(textChannelId);
      if (channel) {
        channel.send(`❌ Erreur lors de la lecture: ${error.message}`);
      }
      
      // Skip to the next track
      this.skip(guildId);
    });
    
    player.on('closed', (reason) => {
      logDebug(`Player connection closed: ${reason}`);
      this.players.delete(guildId);
    });
  }
  
  // Play a track
  async playTrack(guildId, track) {
    const player = this.players.get(guildId);
    if (!player) return false;
    
    try {
      await player.playTrack({ track: track.encoded });
      return true;
    } catch (error) {
      logDebug(`Error playing track: ${error.message}`);
      return false;
    }
  }
  
  // Add a song to the queue
  async addSong(interaction, query) {
    let songInfo;
    let playlist = false;
    
    try {
      // Vérifier si des nœuds sont disponibles
      const node = this.getNode();
      if (!node) {
        logDebug("❌ Erreur: No available nodes");
        throw new Error("No available nodes");
      }
      
      // Get or create a player
      const player = await this.connect(interaction);
      const queue = this.getQueue(interaction.guild.id);
      
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
      logDebug(`Recherche avec la requête: ${searchQuery}`);
      let result;
      try {
        result = await node.rest.resolve(searchQuery);
        logDebug(`Résultat de la recherche:`, result);
      } catch (error) {
        logDebug(`Erreur lors de la recherche: ${error.message}`);
        throw new Error(`Erreur lors de la recherche: ${error.message}`);
      }
      
      if (!result || result.loadType === 'error' || result.loadType === 'empty') {
        logDebug(`Aucun résultat trouvé pour la requête: ${searchQuery}`, result);
        
        // Essayer une recherche YouTube directe si ce n'était pas déjà une recherche
        if (!searchQuery.startsWith('ytsearch:')) {
          logDebug(`Tentative de recherche YouTube directe pour: ${query}`);
          try {
            const ytResult = await node.rest.resolve(`ytsearch:${query}`);
            if (ytResult && ytResult.loadType !== 'error' && ytResult.loadType !== 'empty') {
              logDebug(`Recherche YouTube réussie`, ytResult);
              result = ytResult;
            } else {
              throw new Error('Aucun résultat trouvé pour cette recherche!');
            }
          } catch (error) {
            logDebug(`Échec de la recherche YouTube: ${error.message}`);
            throw new Error('Aucun résultat trouvé pour cette recherche!');
          }
        } else {
          throw new Error('Aucun résultat trouvé pour cette recherche!');
        }
      }
      
      // Handle different result types
      switch (result.loadType) {
        case 'track': {
          // Single track loaded
          const track = result.data;
          
          // Add metadata
          track.requester = interaction.user;
          track.thumbnail = `https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg`;
          
          // Add to queue
          if (!queue.current) {
            queue.current = track;
            this.playTrack(interaction.guild.id, track);
          } else {
            queue.tracks.push(track);
          }
          
          songInfo = {
            title: track.info.title,
            url: track.info.uri,
            thumbnail: track.thumbnail,
            duration: track.info.length,
            requestedBy: interaction.user.tag,
            source: sourceType
          };
          break;
        }
        
        case 'playlist': {
          // Playlist loaded
          playlist = true;
          const tracks = result.data.tracks;
          
          // Add metadata to each track
          tracks.forEach(track => {
            track.requester = interaction.user;
            track.thumbnail = `https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg`;
          });
          
          // Add to queue
          if (!queue.current) {
            queue.current = tracks[0];
            queue.tracks.push(...tracks.slice(1));
            this.playTrack(interaction.guild.id, tracks[0]);
          } else {
            queue.tracks.push(...tracks);
          }
          
          songInfo = {
            title: result.data.info.name,
            url: query,
            count: tracks.length,
            source: sourceType
          };
          break;
        }
        
        case 'search': {
          // Search result, use the first result
          const track = result.data[0];
          
          // Add metadata
          track.requester = interaction.user;
          track.thumbnail = `https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg`;
          
          // Add to queue
          if (!queue.current) {
            queue.current = track;
            this.playTrack(interaction.guild.id, track);
          } else {
            queue.tracks.push(track);
          }
          
          songInfo = {
            title: track.info.title,
            url: track.info.uri,
            thumbnail: track.thumbnail,
            duration: track.info.length,
            requestedBy: interaction.user.tag,
            source: 'youtube'
          };
          break;
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
    const player = this.players.get(guildId);
    if (!player) return false;
    
    player.stopTrack();
    return true;
  }
  
  // Pause the current song
  pause(guildId) {
    const player = this.players.get(guildId);
    if (!player) return false;
    
    player.setPaused(true);
    return true;
  }
  
  // Resume the current song
  resume(guildId) {
    const player = this.players.get(guildId);
    if (!player) return false;
    
    player.setPaused(false);
    return true;
  }
  
  // Stop playing and clear the queue
  stop(guildId) {
    const player = this.players.get(guildId);
    if (!player) return false;
    
    const queue = this.getQueue(guildId);
    queue.tracks = [];
    queue.current = null;
    
    player.stopTrack();
    return true;
  }
  
  // Toggle loop mode
  toggleLoop(guildId) {
    const queue = this.getQueue(guildId);
    queue.loop = !queue.loop;
    return queue.loop;
  }
  
  // Set the volume
  setVolume(guildId, volume) {
    const player = this.players.get(guildId);
    if (!player) return false;
    
    if (volume < 0 || volume > 100) {
      throw new Error('Le volume doit être compris entre 0 et 100!');
    }
    
    player.setVolume(volume / 100);
    
    const queue = this.getQueue(guildId);
    queue.volume = volume;
    
    return volume;
  }
  
  // Get the current queue
  getQueueInfo(guildId) {
    const queue = this.getQueue(guildId);
    if (!queue) return null;
    
    return {
      current: queue.current ? {
        title: queue.current.info.title,
        url: queue.current.info.uri,
        thumbnail: queue.current.thumbnail,
        duration: queue.current.info.length,
        requestedBy: queue.current.requester.tag
      } : null,
      queue: queue.tracks.map(track => ({
        title: track.info.title,
        url: track.info.uri,
        thumbnail: track.thumbnail,
        duration: track.info.length,
        requestedBy: track.requester.tag
      })),
      loop: queue.loop,
      volume: queue.volume
    };
  }
  
  // Destroy the player and disconnect
  destroy(guildId) {
    const player = this.players.get(guildId);
    if (!player) return false;
    
    player.connection.disconnect();
    this.players.delete(guildId);
    this.queues.delete(guildId);
    
    return true;
  }
  
  // Send a now playing embed
  sendNowPlayingEmbed(channel, track, guildId) {
    if (!channel) return;
    
    const queue = this.getQueue(guildId);
    
    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('🎵 Lecture en cours')
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .addFields(
        { name: '⏱️ Durée', value: formatDuration(track.info.length), inline: true },
        { name: '👤 Demandé par', value: track.requester.tag, inline: true },
        { name: '🔄 Mode boucle', value: queue.loop ? 'Activé' : 'Désactivé', inline: true }
      )
      .setFooter({ text: `ZenBeat - ${queue.tracks.length} chanson(s) dans la file d'attente` })
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
