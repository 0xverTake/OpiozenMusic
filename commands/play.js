const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MusicPlayer = require('../utils/musicPlayer');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue de la musique depuis YouTube ou SoundCloud')
    .addStringOption(option => 
      option.setName('query')
        .setDescription('Titre de la chanson ou URL (YouTube/SoundCloud)')
        .setRequired(true)),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const query = interaction.options.getString('query');
      
      // Get the guild ID
      const guildId = interaction.guildId;
      
      // Get or create a music player for this guild
      if (!interaction.client.musicQueue.has(guildId)) {
        interaction.client.musicQueue.set(guildId, new MusicPlayer());
      }
      
      const musicPlayer = interaction.client.musicQueue.get(guildId);
      
      // Connect to the voice channel if not already connected
      if (!musicPlayer.connection) {
        await musicPlayer.connect(interaction);
      }
      
      // Add the song to the queue
      const { songInfo, playlist } = await musicPlayer.addSong(interaction, query);
      
      // Create a response embed
      let embed;
      
      if (playlist) {
        // Playlist was added
        embed = new EmbedBuilder()
          .setColor(embedColor)
          .setTitle('🎵 Playlist ajoutée à la file d\'attente')
          .setDescription(`**${songInfo.title}**`)
          .addFields(
            { name: '📋 Nombre de chansons', value: `${songInfo.count}`, inline: true },
            { name: '👤 Ajouté par', value: interaction.user.tag, inline: true }
          )
          .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
          .setTimestamp();
      } else {
        // Single song was added
        embed = new EmbedBuilder()
          .setColor(embedColor)
          .setTitle('🎵 Chanson ajoutée à la file d\'attente')
          .setDescription(`[${songInfo.title}](${songInfo.url})`)
          .addFields(
            { name: '⏱️ Durée', value: `${Math.floor(songInfo.duration / 60)}:${(songInfo.duration % 60).toString().padStart(2, '0')}`, inline: true },
            { name: '👤 Ajouté par', value: interaction.user.tag, inline: true },
            { name: '🔢 Position dans la file', value: musicPlayer.queue.length === 0 ? 'En cours de lecture' : `${musicPlayer.queue.length}`, inline: true }
          )
          .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
          .setTimestamp();
        
        // Add thumbnail if available
        if (songInfo.thumbnail) {
          embed.setThumbnail(songInfo.thumbnail);
        }
      }
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply(`❌ Erreur: ${error.message}`);
    }
  },
};
