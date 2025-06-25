const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Affiche la file d\'attente actuelle'),
  
  async execute(interaction) {
    try {
      const musicPlayer = interaction.client.musicPlayer;
      const queueData = musicPlayer.getQueue(interaction.guildId);
      
      if (!queueData || !queueData.current) {
        await interaction.reply('❌ Il n\'y a pas de musique en cours de lecture!');
        return;
      }
      
      // Format the duration
      const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      };
      
      // Create the embed
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🎵 File d\'attente')
        .setDescription(`**Lecture en cours:** [${queueData.current.title}](${queueData.current.url})`)
        .setFooter({ text: `ZenBeat - Mode boucle: ${queueData.loop ? 'Activé' : 'Désactivé'} | Volume: ${queueData.volume}%` })
        .setTimestamp();
      
      // Add the queue to the embed
      if (queueData.queue.length === 0) {
        embed.addFields({ name: 'File d\'attente', value: 'Aucune chanson dans la file d\'attente.' });
      } else {
        let queueString = '';
        
        for (let i = 0; i < Math.min(queueData.queue.length, 10); i++) {
          const song = queueData.queue[i];
          queueString += `**${i + 1}.** [${song.title}](${song.url}) | \`${formatDuration(song.duration)}\` | <@${song.requestedBy}>\n`;
        }
        
        if (queueData.queue.length > 10) {
          queueString += `\n... et ${queueData.queue.length - 10} autres chansons`;
        }
        
        embed.addFields({ name: 'File d\'attente', value: queueString });
      }
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply(`❌ Erreur: ${error.message}`);
    }
  },
};
