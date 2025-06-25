const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Active/désactive la lecture en boucle'),
  
  async execute(interaction) {
    try {
      const musicPlayer = interaction.client.musicPlayer;
      
      const loopEnabled = musicPlayer.toggleLoop(interaction.guildId);
      
      if (loopEnabled !== false) {
        await interaction.reply(`🔄 Mode boucle ${loopEnabled ? 'activé' : 'désactivé'}!`);
      } else {
        await interaction.reply('❌ Il n\'y a pas de musique en cours de lecture!');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Erreur: ${error.message}`);
    }
  },
};
