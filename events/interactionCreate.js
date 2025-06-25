const { Events, InteractionType } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Une erreur s\'est produite lors de l\'exécution de cette commande!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'exécution de cette commande!', ephemeral: true });
        }
      }
    }
    
    // Handle button interactions
    else if (interaction.isButton()) {
      // Get the custom ID of the button
      const customId = interaction.customId;
      
      // Handle music control buttons
      if (customId.startsWith('music_')) {
        const command = customId.split('_')[1];
        const guildId = interaction.guildId;
        const queue = interaction.client.musicQueue.get(guildId);
        
        if (!queue) {
          await interaction.reply({ content: 'Il n\'y a pas de musique en cours de lecture!', ephemeral: true });
          return;
        }
        
        try {
          switch (command) {
            case 'skip':
              // Skip command logic
              queue.skip();
              await interaction.reply({ content: '⏭️ Musique passée!', ephemeral: true });
              break;
            case 'pause':
              // Pause command logic
              queue.pause();
              await interaction.reply({ content: '⏸️ Musique mise en pause!', ephemeral: true });
              break;
            case 'resume':
              // Resume command logic
              queue.resume();
              await interaction.reply({ content: '▶️ Musique reprise!', ephemeral: true });
              break;
            case 'stop':
              // Stop command logic
              queue.stop();
              await interaction.reply({ content: '⏹️ Musique arrêtée!', ephemeral: true });
              break;
            default:
              await interaction.reply({ content: 'Commande inconnue!', ephemeral: true });
          }
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'Une erreur s\'est produite lors de l\'exécution de cette commande!', ephemeral: true });
        }
      }
    }
  },
};
