const { Manager } = require('erela.js');
const { EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

class MusicPlayer {
  constructor(client) {
    this.client = client;
    this.manager = new Manager({
      // Define the nodes (Lavalink servers)
      nodes: [
        {
          host: process.env.LAVALINK_HOST || '127.0.0.1', // Utiliser 127.0.0.1 au lieu de localhost pour éviter les problèmes IPv6
          port: parseInt(process.env.LAVALINK_PORT || '2333'),
          password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
          secure: process.env.LAVALINK_SECURE === 'true',
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
      console.log(`Node ${node.options.identifier} connected.`);
    });

    this.manager.on('nodeError', (node, error) => {
      console.log(`Node ${node.options.identifier} had an error: ${error.message}`);
    });

    this.manager.on('nodeDisconnect', (node) => {
      console.log(`Node ${node.options.identifier} disconnected.`);
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
      this.manager.init(this.client.user.id);
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
      // Get or create a player
      const player = this.manager.players.get(interaction.guild.id) || await this.connect(interaction);
      
      // Search for the song
      const res = await this.manager.search(query, interaction.user);
      
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
            requestedBy: interaction.user.tag
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
            count: res.tracks.length
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
            requestedBy: interaction.user.tag
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
