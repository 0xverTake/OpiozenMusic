/**
 * Script de débogage pour la connexion Lavalink
 * 
 * Ce script vérifie la connexion à Lavalink et affiche des informations de diagnostic
 */

const { Manager } = require('erela.js');
require('dotenv').config();

// Charger les variables d'environnement
const host = process.env.LAVALINK_HOST || '127.0.0.1';
const port = parseInt(process.env.LAVALINK_PORT || '2333');
const password = process.env.LAVALINK_PASSWORD || 'youshallnotpass';
const secure = process.env.LAVALINK_SECURE === 'true';

console.log('=== Débogage de la connexion Lavalink ===');
console.log(`Tentative de connexion à Lavalink sur ${host}:${port}`);
console.log(`Sécurisé: ${secure}, Mot de passe: ${password ? '****' : 'non défini'}`);

// Créer un faux client pour tester la connexion
const fakeClient = {
  guilds: {
    cache: new Map()
  },
  user: {
    id: '000000000000000000'
  }
};

// Créer un gestionnaire Lavalink
const manager = new Manager({
  nodes: [
    {
      identifier: 'Main Node',
      host: host,
      port: port,
      password: password,
      secure: secure,
    },
  ],
  send: (id, payload) => {
    console.log(`[SEND] ID: ${id}, Type: ${payload.op}`);
  },
});

// Événements de nœud
manager.on('nodeConnect', (node) => {
  console.log(`✅ Connexion réussie au nœud ${node.options.identifier} (${node.options.host}:${node.options.port})`);
});

manager.on('nodeError', (node, error) => {
  console.error(`❌ Erreur sur le nœud ${node.options.identifier}: ${error.message}`);
  console.error('Détails de l\'erreur:', error);
});

manager.on('nodeDisconnect', (node) => {
  console.log(`⚠️ Déconnexion du nœud ${node.options.identifier}`);
});

// Vérifier la connexion réseau
const net = require('net');
const testConnection = () => {
  const client = new net.Socket();
  const timeout = 5000;
  
  client.setTimeout(timeout);
  
  console.log(`\nTest de connexion TCP à ${host}:${port}...`);
  
  client.on('connect', () => {
    console.log(`✅ Connexion TCP réussie à ${host}:${port}`);
    client.end();
  });
  
  client.on('timeout', () => {
    console.error(`❌ Timeout lors de la connexion à ${host}:${port} après ${timeout}ms`);
    client.destroy();
  });
  
  client.on('error', (err) => {
    console.error(`❌ Erreur de connexion TCP: ${err.message}`);
  });
  
  client.on('close', () => {
    console.log('Test de connexion TCP terminé');
    
    // Initialiser le gestionnaire après le test de connexion
    console.log('\nInitialisation du gestionnaire Lavalink...');
    manager.init(fakeClient.user.id);
    
    // Attendre un peu pour voir les événements
    setTimeout(() => {
      const nodes = manager.nodes;
      console.log(`\nÉtat des nœuds après 5 secondes:`);
      nodes.forEach(node => {
        console.log(`- ${node.options.identifier}: ${node.connected ? 'Connecté' : 'Déconnecté'}`);
      });
      
      console.log('\n=== Conseils de dépannage ===');
      console.log('1. Vérifiez que Lavalink est en cours d\'exécution');
      console.log('2. Vérifiez que les paramètres de connexion sont corrects');
      console.log('3. Vérifiez que le port n\'est pas bloqué par un pare-feu');
      console.log('4. Vérifiez les logs de Lavalink pour des erreurs');
      
      // Terminer après 10 secondes
      setTimeout(() => {
        console.log('\nDébogage terminé');
        process.exit(0);
      }, 5000);
    }, 5000);
  });
  
  client.connect(port, host);
};

// Exécuter le test de connexion
testConnection();
