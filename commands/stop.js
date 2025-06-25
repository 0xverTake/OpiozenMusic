const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Arrête la lecture et vide la file d\'attente'),
  
  async execute(interaction) {
    try {
      const musicPlayer = interaction.client.musicPlayer;
      
      if (musicPlayer.stop(interaction.guildId)) {
        await interaction.reply('⏹️ Musique arrêtée et file d\'attente vidée!');
      } else {
        await interaction.reply('❌ Il n\'y a pas de musique en cours de lecture!');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Erreur: ${error.message}`);
    }
  },
};
