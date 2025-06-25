const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Règle le volume de lecture')
    .addIntegerOption(option => 
      option.setName('level')
        .setDescription('Niveau de volume (0-100)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)),
  
  async execute(interaction) {
    // Get the volume level from the options
    const volumeLevel = interaction.options.getInteger('level');
    
    // Get the guild ID
    const guildId = interaction.guildId;
    
    // Get the music player for this guild
    const musicPlayer = interaction.client.musicQueue.get(guildId);
    
    if (!musicPlayer) {
      return interaction.reply({
        content: '❌ Il n\'y a pas de lecteur de musique actif!',
        ephemeral: true
      });
    }
    
    try {
      // Set the volume
      const newVolume = musicPlayer.setVolume(volumeLevel);
      
      // Create a response embed
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🔊 Volume modifié')
        .setDescription(`Le volume a été réglé à **${newVolume}%**.`)
        .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return interaction.reply({
        content: `❌ Erreur: ${error.message}`,
        ephemeral: true
      });
    }
  },
};
