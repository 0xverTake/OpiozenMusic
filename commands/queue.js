const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Affiche la file d\'attente actuelle'),
  
  async execute(interaction) {
    // Get the guild ID
    const guildId = interaction.guildId;
    
    // Get the music player for this guild
    const musicPlayer = interaction.client.musicQueue.get(guildId);
    
    if (!musicPlayer || (!musicPlayer.isPlaying && musicPlayer.queue.length === 0)) {
      return interaction.reply({
        content: '❌ Il n\'y a pas de musique dans la file d\'attente!',
        ephemeral: true
      });
    }
    
    // Get the queue information
    const queueInfo = musicPlayer.getQueue();
    const { current, queue, loop, volume } = queueInfo;
    
    // Format the duration
    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    // Create a response embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('🎵 File d\'attente')
      .setFooter({ text: `ZenBeat - Volume: ${volume}% | Mode boucle: ${loop ? 'Activé' : 'Désactivé'}` })
      .setTimestamp();
    
    // Add the current song
    if (current) {
      embed.addFields({
        name: '▶️ En cours de lecture',
        value: `[${current.title}](${current.url}) | \`${formatDuration(current.duration)}\` | Ajouté par: ${current.requestedBy}`
      });
      
      // Add thumbnail if available
      if (current.thumbnail) {
        embed.setThumbnail(current.thumbnail);
      }
    }
    
    // Add the queue
    if (queue.length > 0) {
      const queueList = queue.slice(0, 10).map((song, index) => {
        return `${index + 1}. [${song.title}](${song.url}) | \`${formatDuration(song.duration)}\` | Ajouté par: ${song.requestedBy}`;
      }).join('\n');
      
      embed.addFields({
        name: '📋 Prochaines chansons',
        value: queueList
      });
      
      // If there are more songs in the queue than we displayed
      if (queue.length > 10) {
        embed.addFields({
          name: '📌 Et plus encore...',
          value: `${queue.length - 10} autres chansons dans la file d'attente`
        });
      }
    }
    
    return interaction.reply({ embeds: [embed] });
  },
};
