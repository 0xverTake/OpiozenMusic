const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles'),
  
  async execute(interaction) {
    // Create a response embed
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('📋 Commandes ZenBeat')
      .setDescription('Voici la liste des commandes disponibles pour ZenBeat, votre compagnon musical Discord!')
      .addFields(
        { 
          name: '🎵 Commandes musicales', 
          value: 
            '`/play <titre ou URL>` - Joue de la musique depuis YouTube ou SoundCloud\n' +
            '`/skip` - Passe à la chanson suivante dans la file d\'attente\n' +
            '`/stop` - Arrête la lecture et vide la file d\'attente\n' +
            '`/queue` - Affiche la file d\'attente actuelle\n' +
            '`/pause` - Met en pause la lecture\n' +
            '`/resume` - Reprend la lecture\n' +
            '`/volume <0-100>` - Règle le volume de lecture\n' +
            '`/loop` - Active/désactive la lecture en boucle'
        },
        { 
          name: '🎧 Contrôles par boutons', 
          value: 'ZenBeat affiche des boutons de contrôle sous chaque chanson en cours de lecture, vous permettant de:\n' +
                 '- ⏸️ Mettre en pause\n' +
                 '- ▶️ Reprendre\n' +
                 '- ⏭️ Passer\n' +
                 '- ⏹️ Arrêter'
        },
        { 
          name: '🔗 Sources prises en charge', 
          value: '- YouTube (vidéos et playlists)\n- SoundCloud (pistes et playlists)'
        },
        { 
          name: '💡 Astuces', 
          value: '- Vous pouvez rechercher par titre ou fournir un lien direct\n' +
                 '- Pour les playlists, utilisez simplement l\'URL de la playlist\n' +
                 '- Vous devez être dans un salon vocal pour utiliser les commandes musicales'
        }
      )
      .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed] });
  },
};
