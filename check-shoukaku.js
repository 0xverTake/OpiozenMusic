const { Shoukaku, Connectors } = require('shoukaku');
const { Client } = require('discord.js');

// Create a dummy client
const client = new Client({
  intents: []
});

// Log Shoukaku version
console.log(`Shoukaku version: installed`);

// Initialize Shoukaku
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

// Log available methods
console.log('\nShoukaku instance methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(shoukaku)));

// Log Node class methods
console.log('\nShoukaku Node class methods:');
const nodeProto = Object.getPrototypeOf(shoukaku.options.nodeResolver);
console.log(Object.getOwnPropertyNames(nodeProto));

// Check if getNode method exists
console.log('\nDoes shoukaku.getNode exist?', typeof shoukaku.getNode === 'function');

// Log how to get nodes in Shoukaku v4
console.log('\nHow to get nodes in Shoukaku v4:');
console.log('shoukaku.nodes is a Map:', shoukaku.nodes instanceof Map);
console.log('To get a node: Array.from(shoukaku.nodes.values())[0]');
