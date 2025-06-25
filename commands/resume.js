const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Reprend la lecture en pause'),
  
  async execute(interaction) {
    // Get the guild ID
    const guildId = interaction.guildId;
    
    // Get the music player for this guild
    const musicPlayer = interaction.client.musicQueue.get(guildId);
    
    if (!musicPlayer || (!musicPlayer.isPlaying && !musicPlayer.currentSong)) {
      return interaction.reply({
        content: '❌ Il n\'y a pas de musique à reprendre!',
        ephemeral: true
      });
    }
    
    // Resume the music player
    const success = musicPlayer.resume();
    
    if (!success) {
      return interaction.reply({
        content: '❌ La musique n\'est pas en pause!',
        ephemeral: true
      });
    }
    
    // Create a response embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('▶️ Lecture reprise')
      .setDescription('La lecture a été reprise.')
      .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed] });
  },
};
