const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passe à la chanson suivante'),
  
  async execute(interaction) {
    try {
      const musicPlayer = interaction.client.musicPlayer;
      
      if (musicPlayer.skip(interaction.guildId)) {
        await interaction.reply('⏭️ Musique passée!');
      } else {
        await interaction.reply('❌ Il n\'y a pas de musique en cours de lecture!');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Erreur: ${error.message}`);
    }
  },
};
