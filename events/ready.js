const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    
    // Set the bot's activity status
    client.user.setActivity('de la musique | /help', { type: ActivityType.Playing });
  }
};
