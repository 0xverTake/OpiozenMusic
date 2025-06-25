const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Arrête la lecture et vide la file d\'attente'),
  
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
    
    // Stop the music player
    musicPlayer.stop();
    
    // Create a response embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('⏹️ Lecture arrêtée')
      .setDescription('La lecture a été arrêtée et la file d\'attente a été vidée.')
      .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed] });
  },
};
