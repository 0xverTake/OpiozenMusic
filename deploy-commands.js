const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Load environment variables from .env file
require('dotenv').config();

// Get token and clientId from environment variables or config.json as fallback
let token, clientId;
try {
  token = process.env.TOKEN;
  clientId = process.env.CLIENT_ID;
  
  // If not found in .env, try config.json
  if (!token || !clientId) {
    const config = require('./config.json');
    token = token || config.token;
    clientId = clientId || config.clientId;
  }
  
  if (!token) {
    throw new Error('Bot token not found in .env or config.json');
  }
  
  if (!clientId) {
    throw new Error('Client ID not found in .env or config.json');
  }
} catch (error) {
  console.error('Error loading configuration:', error.message);
  console.error('Please make sure you have a valid config.json file or TOKEN and CLIENT_ID in your .env file');
  process.exit(1);
}

const commands = [];
// Grab all the command files from the commands directory
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy commands globally
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands globally.`);

    // The put method is used to fully refresh all commands globally
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
    console.log('Note: Global commands may take up to 1 hour to propagate to all servers.');
  } catch (error) {
    // Catch and log any errors
    console.error(error);
  }
})();
