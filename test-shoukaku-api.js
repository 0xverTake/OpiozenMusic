// Script de test pour explorer l'API de Shoukaku v4.1.1
const { Client, GatewayIntentBits } = require('discord.js');
const { Shoukaku, Connectors } = require('shoukaku');

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const LAVALINK_HOST = process.env.LAVALINK_HOST || '127.0.0.1';
const LAVALINK_PORT = parseInt(process.env.LAVALINK_PORT || '2333');
const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD || 'youshallnotpass';
const LAVALINK_SECURE = process.env.LAVALINK_SECURE === 'true';

// Fonction de journalisation améliorée
function logDebug(message, obj = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [TEST DEBUG] ${message}`);
  if (obj) console.log(JSON.stringify(obj, null, 2));
}

// Créer un client Discord.js avec les intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Initialiser Shoukaku
const shoukaku = new Shoukaku(
  new Connectors.DiscordJS(client),
  [
    {
      name: 'Main Node',
      url: `${LAVALINK_HOST}:${LAVALINK_PORT}`,
      auth: LAVALINK_PASSWORD,
      secure: LAVALINK_SECURE,
      path: '/v4/websocket'
    }
  ],
  {
    moveOnDisconnect: false,
    resume: true,
    resumeTimeout: 30,
    reconnectTries: 10,
    restTimeout: 10000
  }
);

// Événements Shoukaku
shoukaku.on('ready', (name) => {
  logDebug(`✅ Node ${name} connected.`);
  
  // Afficher les méthodes disponibles sur l'instance Shoukaku
  logDebug('Méthodes disponibles sur l\'instance Shoukaku:');
  const shoukakuMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(shoukaku))
    .filter(method => typeof shoukaku[method] === 'function');
  logDebug(shoukakuMethods);
  
  // Vérifier si joinVoiceChannel existe
  if (typeof shoukaku.joinVoiceChannel === 'function') {
    logDebug('✅ La méthode joinVoiceChannel existe sur l\'instance Shoukaku');
  } else {
    logDebug('❌ La méthode joinVoiceChannel n\'existe PAS sur l\'instance Shoukaku');
  }
  
  // Obtenir un nœud
  const node = shoukaku.getNode();
  if (node) {
    logDebug('✅ Nœud obtenu avec succès');
    
    // Afficher les méthodes disponibles sur le nœud
    logDebug('Méthodes disponibles sur le nœud:');
    const nodeMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(node))
      .filter(method => typeof node[method] === 'function');
    logDebug(nodeMethods);
    
    // Vérifier si joinChannel existe sur le nœud
    if (typeof node.joinChannel === 'function') {
      logDebug('✅ La méthode joinChannel existe sur le nœud');
    } else {
      logDebug('❌ La méthode joinChannel n\'existe PAS sur le nœud');
    }
    
    // Explorer l'objet rest du nœud
    if (node.rest) {
      logDebug('Méthodes disponibles sur node.rest:');
      const restMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(node.rest))
        .filter(method => typeof node.rest[method] === 'function');
      logDebug(restMethods);
    }
  } else {
    logDebug('❌ Impossible d\'obtenir un nœud');
  }
});

shoukaku.on('error', (name, error) => {
  logDebug(`❌ Node ${name} had an error: ${error.message}`);
});

shoukaku.on('disconnect', (name, reason) => {
  logDebug(`⚠️ Node ${name} disconnected. Reason: ${reason}`);
});

// Événements Discord.js
client.once('ready', () => {
  logDebug(`✅ Bot connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Commande pour tester la connexion à un canal vocal
  if (message.content.startsWith('!testjoin')) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply('Vous devez être dans un canal vocal pour utiliser cette commande!');
      return;
    }
    
    try {
      logDebug(`Tentative de connexion au canal vocal ${voiceChannel.id} dans le serveur ${message.guild.id}`);
      
      // Obtenir un nœud
      const node = shoukaku.getNode();
      if (!node) {
        message.reply('❌ Aucun nœud disponible');
        return;
      }
      
      // Méthode 1: Essayer d'utiliser joinChannel sur le nœud (ancienne API)
      try {
        logDebug('Tentative avec node.joinChannel (ancienne API)');
        const player = await node.joinChannel({
          guildId: message.guild.id,
          channelId: voiceChannel.id,
          shardId: message.guild.shardId || 0,
          deaf: true
        });
        logDebug('✅ Connexion réussie avec node.joinChannel');
        message.reply('✅ Connexion réussie avec node.joinChannel');
      } catch (error1) {
        logDebug(`❌ Erreur avec node.joinChannel: ${error1.message}`);
        
        // Méthode 2: Essayer d'utiliser joinVoiceChannel sur l'instance Shoukaku (nouvelle API)
        try {
          logDebug('Tentative avec shoukaku.joinVoiceChannel (nouvelle API)');
          const player = await shoukaku.joinVoiceChannel({
            guildId: message.guild.id,
            channelId: voiceChannel.id,
            shardId: message.guild.shardId || 0,
            deaf: true,
            node: node.name // Spécifier quel nœud utiliser
          });
          logDebug('✅ Connexion réussie avec shoukaku.joinVoiceChannel');
          message.reply('✅ Connexion réussie avec shoukaku.joinVoiceChannel');
        } catch (error2) {
          logDebug(`❌ Erreur avec shoukaku.joinVoiceChannel: ${error2.message}`);
          message.reply(`❌ Erreur: ${error2.message}`);
        }
      }
    } catch (error) {
      logDebug(`❌ Erreur générale: ${error.message}`);
      message.reply(`❌ Erreur: ${error.message}`);
    }
  }
  
  // Commande pour tester la recherche de chansons
  if (message.content.startsWith('!testsearch')) {
    const query = message.content.slice('!testsearch'.length).trim();
    if (!query) {
      message.reply('Veuillez fournir une requête de recherche');
      return;
    }
    
    try {
      // Obtenir un nœud
      const node = shoukaku.getNode();
      if (!node) {
        message.reply('❌ Aucun nœud disponible');
        return;
      }
      
      // Tester la recherche directe
      logDebug(`Test de recherche directe pour: ${query}`);
      try {
        const result = await node.rest.resolve(query);
        logDebug('Résultat de la recherche directe:', result);
        message.reply(`✅ Recherche directe réussie: ${result.loadType}`);
      } catch (error) {
        logDebug(`❌ Erreur lors de la recherche directe: ${error.message}`);
        
        // Tester la recherche YouTube
        const ytQuery = `ytsearch:${query}`;
        logDebug(`Test de recherche YouTube pour: ${ytQuery}`);
        try {
          const ytResult = await node.rest.resolve(ytQuery);
          logDebug('Résultat de la recherche YouTube:', ytResult);
          message.reply(`✅ Recherche YouTube réussie: ${ytResult.loadType}`);
        } catch (ytError) {
          logDebug(`❌ Erreur lors de la recherche YouTube: ${ytError.message}`);
          message.reply(`❌ Erreur: ${ytError.message}`);
        }
      }
    } catch (error) {
      logDebug(`❌ Erreur générale: ${error.message}`);
      message.reply(`❌ Erreur: ${error.message}`);
    }
  }
});

// Connexion à Discord
client.login(DISCORD_TOKEN).catch(error => {
  logDebug(`❌ Erreur de connexion à Discord: ${error.message}`);
});

// Afficher un message pour indiquer que le script est en cours d'exécution
logDebug('Script de test démarré. Utilisez !testjoin dans un canal vocal pour tester la connexion.');
logDebug('Utilisez !testsearch <requête> pour tester la recherche de chansons.');
