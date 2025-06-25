const { EmbedBuilder, ChannelType } = require('discord.js');
const { embedColor } = require('../config.json');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    console.log(`Joined a new guild: ${guild.name} (id: ${guild.id})`);
    
    // Find the first text channel we can send messages in
    const channel = guild.channels.cache.find(
      channel => 
        channel.type === ChannelType.GuildText && 
        channel.permissionsFor(guild.members.me).has('SendMessages')
    );
    
    if (!channel) return;
    
    // Create a welcome embed
    const welcomeEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('🎵 ZenBeat est arrivé! 🎵')
      .setDescription('Merci de m\'avoir ajouté à votre serveur! Je suis ZenBeat, un bot musical qui peut jouer de la musique depuis YouTube et SoundCloud.')
      .addFields(
        { name: '📋 Commandes', value: 'Utilisez `/help` pour voir la liste des commandes disponibles.' },
        { name: '🎧 Lecture de musique', value: 'Utilisez `/play` suivi d\'un titre ou d\'un lien YouTube/SoundCloud pour commencer à écouter de la musique.' },
        { name: '🛠️ Support', value: 'Si vous avez des questions ou des problèmes, n\'hésitez pas à contacter mon créateur.' }
      )
      .setFooter({ text: 'ZenBeat - Votre compagnon musical' })
      .setTimestamp();
    
    // Send the welcome message
    await channel.send({ embeds: [welcomeEmbed] });
  },
};
