const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Reprend la lecture de la chanson en pause'),
  
  async execute(interaction) {
    try {
      const musicPlayer = interaction.client.musicPlayer;
      
      if (musicPlayer.resume(interaction.guildId)) {
        await interaction.reply('▶️ Musique reprise!');
      } else {
        await interaction.reply('❌ La musique n\'est pas en pause ou il n\'y a pas de musique en cours de lecture!');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Erreur: ${error.message}`);
    }
  },
};
