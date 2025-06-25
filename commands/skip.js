const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passe à la chanson suivante dans la file d\'attente'),
  
  async execute(interaction) {
    // Get the guild ID
    const guildId = interaction.guildId;
    
    // Get the music player for this guild
    const musicPlayer = interaction.client.musicQueue.get(guildId);
    
    if (!musicPlayer || !musicPlayer.isPlaying) {
      return interaction.reply({
        content: '❌ Il n\'y a pas de musique en cours de lecture!',
        ephemeral: true
      });
    }
    
    // Get the current song before skipping
    const currentSong = musicPlayer.currentSong;
    
    if (!currentSong) {
      return interaction.reply({
        content: '❌ Il n\'y a pas de chanson à passer!',
        ephemeral: true
      });
    }
    
    // Skip the current song
    musicPlayer.skip();
    
    // Create a response embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('⏭️ Chanson passée')
      .setDescription(`[${currentSong.title}](${currentSong.url})`)
      .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
      .setTimestamp();
    
    // Add thumbnail if available
    if (currentSong.thumbnail) {
      embed.setThumbnail(currentSong.thumbnail);
    }
    
    return interaction.reply({ embeds: [embed] });
  },
};
