const { 
  createAudioPlayer, 
  createAudioResource, 
  joinVoiceChannel, 
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  NoSubscriberBehavior,
  demuxProbe
} = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const distube_ytdl = require('@distube/ytdl-core');
const { embedColor } = require('../config.json');

class MusicPlayer {
  constructor() {
    this.connection = null;
    this.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });
    this.queue = [];
    this.currentSong = null;
    this.volume = 100;
    this.textChannel = null;
    this.loop = false;
    this.isPlaying = false;
    
    // Set up audio player event listeners
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      if (this.loop && this.currentSong) {
        // If loop is enabled, add the current song back to the beginning of the queue
        this.queue.unshift(this.currentSong);
      }
      
      this.currentSong = null;
      this.playNext();
    });
    
    this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
      this.isPlaying = true;
    });
    
    this.audioPlayer.on(AudioPlayerStatus.Paused, () => {
      this.isPlaying = false;
    });
    
    this.audioPlayer.on('error', error => {
      console.error(`Error: ${error.message}`);
      this.textChannel?.send(`Une erreur s'est produite lors de la lecture: ${error.message}`);
      this.currentSong = null;
      this.playNext();
    });
  }
  
  // Connect to a voice channel
  async connect(interaction) {
    const { channel } = interaction.member.voice;
    
    if (!channel) {
      throw new Error('Vous devez être dans un salon vocal pour utiliser cette commande!');
    }
    
    this.textChannel = interaction.channel;
    
    // Create a voice connection
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    
    // Set up connection event listeners
    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      } catch (error) {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        this.destroy();
      }
    });
    
    // Subscribe the connection to the audio player
    this.connection.subscribe(this.audioPlayer);
    
    return this.connection;
  }
  
  // Add a song to the queue
  async addSong(interaction, query) {
    let songInfo;
    let playlist = false;
    
    try {
      // Check if the query is a URL
      if (query.match(/^https?:\/\//)) {
        // Check if it's a YouTube URL
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
          try {
            // Check if it's a playlist
            if (query.includes('list=')) {
              playlist = true;
              
              // YouTube playlists are not directly supported by ytdl-core
              // We would need to implement a custom solution or use another library for playlists
              throw new Error('Les playlists YouTube ne sont pas prises en charge avec ytdl-core pour le moment.');
              
            } else {
              // Single YouTube video
              try {
                // Try with @distube/ytdl-core first
                const videoInfo = await distube_ytdl.getInfo(query, {
                  requestOptions: {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                      'Accept-Language': 'en-US,en;q=0.9',
                      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                      'Cookie': process.env.YOUTUBE_COOKIE || ''
                    }
                  }
                });
                
                if (!videoInfo || !videoInfo.videoDetails) {
                  throw new Error('Impossible de récupérer les informations de la vidéo. Elle est peut-être privée ou restreinte.');
                }
                
                const video = videoInfo.videoDetails;
                
                songInfo = {
                  title: video.title || 'Vidéo YouTube inconnue',
                  url: video.video_url || query,
                  thumbnail: video.thumbnails && video.thumbnails.length > 0 ? video.thumbnails[0].url : null,
                  duration: parseInt(video.lengthSeconds) || 0,
                  requestedBy: interaction.user.tag
                };
                
                this.queue.push(songInfo);
              } catch (distubeError) {
                console.error('Erreur @distube/ytdl-core, utilisation de ytdl-core:', distubeError);
                
                // Fall back to regular ytdl-core
                const videoInfo = await ytdl.getInfo(query, {
                  requestOptions: {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                      'Accept-Language': 'en-US,en;q=0.9',
                      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                      'Cookie': process.env.YOUTUBE_COOKIE || ''
                    }
                  }
                });
                
                if (!videoInfo || !videoInfo.videoDetails) {
                  throw new Error('Impossible de récupérer les informations de la vidéo. Elle est peut-être privée ou restreinte.');
                }
                
                const video = videoInfo.videoDetails;
                
                songInfo = {
                  title: video.title || 'Vidéo YouTube inconnue',
                  url: video.video_url || query,
                  thumbnail: video.thumbnails && video.thumbnails.length > 0 ? video.thumbnails[0].url : null,
                  duration: parseInt(video.lengthSeconds) || 0,
                  requestedBy: interaction.user.tag
                };
                
                this.queue.push(songInfo);
              }
            }
          } catch (error) {
            console.error('Erreur YouTube:', error);
            throw new Error(`Erreur lors de l'extraction YouTube: ${error.message}`);
          }
        }
        // SoundCloud is not supported with ytdl-core
        else if (query.includes('soundcloud.com')) {
          throw new Error('SoundCloud n\'est pas pris en charge avec ytdl-core. Utilisez YouTube pour le moment.');
        } else {
          throw new Error('URL non prise en charge. Utilisez YouTube.');
        }
      } else {
        // Search YouTube for the query
        // ytdl-core doesn't support search, so we need to construct a YouTube search URL
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        throw new Error('La recherche YouTube n\'est pas prise en charge avec ytdl-core. Veuillez fournir une URL YouTube directe.');
      }
      
      // If nothing is currently playing, start playing
      if (!this.isPlaying && this.queue.length === 1) {
        this.playNext();
      }
      
      return { songInfo, playlist };
    } catch (error) {
      console.error(error);
      throw new Error(`Erreur lors de l'ajout de la chanson: ${error.message}`);
    }
  }
  
  // Play the next song in the queue
  async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.currentSong = null;
      
      // Send a message indicating the queue is empty
      this.textChannel?.send({
        embeds: [
          new EmbedBuilder()
            .setColor(embedColor)
            .setDescription('🎵 La file d\'attente est vide. Ajoutez des chansons avec `/play`!')
        ]
      });
      
      return;
    }
    
    // Get the next song from the queue
    const song = this.queue.shift();
    this.currentSong = song;
    
    try {
      if (!song.url) {
        throw new Error('URL de la chanson invalide ou manquante.');
      }
      
      let stream;
      let resource;
      
      // Get the audio stream based on the URL
      try {
        if (song.url.includes('youtube.com') || song.url.includes('youtu.be')) {
          // Options for ytdl-core to help bypass YouTube's bot detection
          const ytdlOptions = {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25, // 32MB buffer
            requestOptions: {
              headers: {
                // Add common browser headers to appear more like a regular user
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Cookie': process.env.YOUTUBE_COOKIE || ''
              }
            }
          };
          
          try {
            // Try with @distube/ytdl-core first
            const ytStream = distube_ytdl(song.url, ytdlOptions);
            const { stream: probeStream, type } = await demuxProbe(ytStream);
            
            // Create an audio resource from the stream
            resource = createAudioResource(probeStream, {
              inputType: type,
              inlineVolume: true
            });
          } catch (distubeError) {
            console.error(`@distube/ytdl-core error, falling back to ytdl-core: ${distubeError.message}`);
            
            // Fall back to regular ytdl-core
            const ytStream = ytdl(song.url, ytdlOptions);
            const { stream: probeStream, type } = await demuxProbe(ytStream);
            
            // Create an audio resource from the stream
            resource = createAudioResource(probeStream, {
              inputType: type,
              inlineVolume: true
            });
          }
        } else {
          throw new Error('Format non pris en charge!');
        }
        
        if (!resource) {
          throw new Error('Impossible de créer le flux audio. La ressource est peut-être indisponible.');
        }
      } catch (streamError) {
        console.error(`Erreur de streaming: ${streamError.message}`);
        this.textChannel?.send(`❌ Erreur lors du streaming: ${streamError.message}`);
        this.currentSong = null;
        this.playNext();
        return;
      }
      
      // Set the volume
      resource.volume.setVolume(this.volume / 100);
      
      // Play the audio resource
      this.audioPlayer.play(resource);
      
      // Send a now playing message
      this.sendNowPlayingEmbed(song);
      
      return song;
    } catch (error) {
      console.error(`Error playing song: ${error.message}`);
      this.textChannel?.send(`❌ Erreur lors de la lecture de la chanson: ${error.message}`);
      this.currentSong = null;
      this.playNext();
    }
  }
  
  // Skip the current song
  skip() {
    this.audioPlayer.stop();
    return true;
  }
  
  // Pause the current song
  pause() {
    if (this.isPlaying) {
      this.audioPlayer.pause();
      return true;
    }
    return false;
  }
  
  // Resume the current song
  resume() {
    if (!this.isPlaying) {
      this.audioPlayer.unpause();
      return true;
    }
    return false;
  }
  
  // Stop playing and clear the queue
  stop() {
    this.queue = [];
    this.audioPlayer.stop();
    this.isPlaying = false;
    this.currentSong = null;
    return true;
  }
  
  // Toggle loop mode
  toggleLoop() {
    this.loop = !this.loop;
    return this.loop;
  }
  
  // Set the volume
  setVolume(volume) {
    if (volume < 0 || volume > 100) {
      throw new Error('Le volume doit être compris entre 0 et 100!');
    }
    
    this.volume = volume;
    
    // If a song is currently playing, update its volume
    if (this.audioPlayer.state.status === AudioPlayerStatus.Playing) {
      this.audioPlayer.state.resource.volume.setVolume(volume / 100);
    }
    
    return volume;
  }
  
  // Get the current queue
  getQueue() {
    return {
      current: this.currentSong,
      queue: this.queue,
      loop: this.loop,
      volume: this.volume
    };
  }
  
  // Destroy the player and disconnect
  destroy() {
    this.queue = [];
    this.currentSong = null;
    this.isPlaying = false;
    
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }
    
    this.audioPlayer.stop();
  }
  
  // Send a now playing embed
  sendNowPlayingEmbed(song) {
    if (!this.textChannel) return;
    
    // Format the duration
    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('🎵 Lecture en cours')
      .setDescription(`[${song.title}](${song.url})`)
      .addFields(
        { name: '⏱️ Durée', value: formatDuration(song.duration), inline: true },
        { name: '👤 Demandé par', value: song.requestedBy, inline: true },
        { name: '🔄 Mode boucle', value: this.loop ? 'Activé' : 'Désactivé', inline: true }
      )
      .setFooter({ text: `ZenBeat - ${this.queue.length} chanson(s) dans la file d'attente` })
      .setTimestamp();
    
    // Add thumbnail if available
    if (song.thumbnail) {
      embed.setThumbnail(song.thumbnail);
    }
    
    // Send the embed with control buttons
    this.textChannel.send({
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
