const { SlashCommandBuilder } = require('discord.js');

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
    try {
      const volume = interaction.options.getInteger('level');
      const musicPlayer = interaction.client.musicPlayer;
      
      const newVolume = musicPlayer.setVolume(interaction.guildId, volume);
      
      if (newVolume !== false) {
        await interaction.reply(`🔊 Volume réglé à ${newVolume}%`);
      } else {
        await interaction.reply('❌ Il n\'y a pas de musique en cours de lecture!');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Erreur: ${error.message}`);
    }
  },
};
