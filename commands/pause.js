const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Met en pause la chanson en cours'),
  
  async execute(interaction) {
    try {
      const musicPlayer = interaction.client.musicPlayer;
      
      if (musicPlayer.pause(interaction.guildId)) {
        await interaction.reply('⏸️ Musique mise en pause!');
      } else {
        await interaction.reply('❌ La musique est déjà en pause ou il n\'y a pas de musique en cours de lecture!');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Erreur: ${error.message}`);
    }
  },
};
