const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Active ou désactive la lecture en boucle'),
  
  async execute(interaction) {
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
    
    // Toggle loop mode
    const loopEnabled = musicPlayer.toggleLoop();
    
    // Create a response embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(loopEnabled ? '🔄 Mode boucle activé' : '➡️ Mode boucle désactivé')
      .setDescription(loopEnabled 
        ? 'La chanson actuelle sera répétée lorsqu\'elle se termine.' 
        : 'Les chansons ne seront plus répétées automatiquement.')
      .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed] });
  },
};
