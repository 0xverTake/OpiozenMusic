const { Shoukaku, Connectors } = require('shoukaku');
const { Client, GatewayIntentBits } = require('discord.js');

// Créer un client Discord.js minimal
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Initialiser Shoukaku
const shoukaku = new Shoukaku(
  new Connectors.DiscordJS(client),
  [
    {
      name: 'Main Node',
      url: '127.0.0.1:2333',
      auth: 'youshallnotpass',
      secure: false,
      path: '/v4/websocket'
    }
  ]
);

// Afficher les méthodes disponibles sur Shoukaku
console.log('Méthodes disponibles sur Shoukaku:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(shoukaku)));

// Afficher les propriétés de Shoukaku
console.log('\nPropriétés de Shoukaku:');
console.log(Object.keys(shoukaku));

// Vérifier la documentation de Shoukaku
console.log('\nVérification de la documentation:');
console.log('Shoukaku.Node existe:', typeof shoukaku.Node === 'function');

// Importer directement la classe Node
const { Node } = require('shoukaku');
console.log('\nMéthodes de la classe Node:');
if (Node) {
  console.log(Object.getOwnPropertyNames(Node.prototype));
}

// Afficher les méthodes de la classe Player
console.log('\nMéthodes de la classe Player:');
const playerProto = require('shoukaku').Player.prototype;
console.log(Object.getOwnPropertyNames(playerProto));
