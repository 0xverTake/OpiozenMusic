const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Met en pause la lecture en cours'),
  
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
    
    // Pause the music player
    const success = musicPlayer.pause();
    
    if (!success) {
      return interaction.reply({
        content: '❌ La musique est déjà en pause!',
        ephemeral: true
      });
    }
    
    // Create a response embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('⏸️ Lecture mise en pause')
      .setDescription('La lecture a été mise en pause. Utilisez `/resume` pour reprendre.')
      .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed] });
  },
};
