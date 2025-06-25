/**
 * Script de vérification de l'installation et de la configuration de Lavalink
 * 
 * Ce script vérifie si Lavalink est correctement installé et configuré sur votre VPS.
 * Il effectue plusieurs tests pour identifier les problèmes potentiels.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const net = require('net');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Fonction pour afficher un message avec une couleur
function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

// Fonction pour afficher un titre de section
function section(title) {
  console.log('\n' + colors.cyan + '='.repeat(50) + colors.reset);
  console.log(colors.cyan + ' ' + title + colors.reset);
  console.log(colors.cyan + '='.repeat(50) + colors.reset);
}

// Fonction pour afficher un résultat de test
function result(name, success, message) {
  const icon = success ? '✅' : '❌';
  const color = success ? colors.green : colors.red;
  console.log(`${color}${icon} ${name}${colors.reset}`);
  if (message) {
    console.log(`   ${message}`);
  }
  return success;
}

// Fonction pour exécuter une commande shell
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// Fonction pour vérifier si un port est ouvert
function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 5000;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// Fonction principale
async function main() {
  let allPassed = true;
  
  log('\n🔍 VÉRIFICATION DE L\'INSTALLATION LAVALINK POUR ZENBEAT 🔍\n', colors.magenta);
  
  // Vérifier les variables d'environnement
  section('1. Vérification des variables d\'environnement');
  
  const envFile = fs.existsSync('.env');
  allPassed &= result('Fichier .env', envFile, envFile ? 'Le fichier .env existe.' : 'Le fichier .env n\'existe pas. Créez-le à partir de .env.example.');
  
  if (envFile) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const hasLavalinkHost = envContent.includes('LAVALINK_HOST');
    const hasLavalinkPort = envContent.includes('LAVALINK_PORT');
    const hasLavalinkPassword = envContent.includes('LAVALINK_PASSWORD');
    
    allPassed &= result('LAVALINK_HOST', hasLavalinkHost, hasLavalinkHost ? `LAVALINK_HOST=${process.env.LAVALINK_HOST || '127.0.0.1'}` : 'LAVALINK_HOST n\'est pas défini dans .env');
    allPassed &= result('LAVALINK_PORT', hasLavalinkPort, hasLavalinkPort ? `LAVALINK_PORT=${process.env.LAVALINK_PORT || '2333'}` : 'LAVALINK_PORT n\'est pas défini dans .env');
    allPassed &= result('LAVALINK_PASSWORD', hasLavalinkPassword, hasLavalinkPassword ? 'LAVALINK_PASSWORD est défini' : 'LAVALINK_PASSWORD n\'est pas défini dans .env');
  }
  
  // Vérifier les fichiers Lavalink
  section('2. Vérification des fichiers Lavalink');
  
  const lavalinkDir = fs.existsSync('lavalink');
  allPassed &= result('Dossier lavalink', lavalinkDir, lavalinkDir ? 'Le dossier lavalink existe.' : 'Le dossier lavalink n\'existe pas.');
  
  if (lavalinkDir) {
    const lavalinkJar = fs.existsSync(path.join('lavalink', 'Lavalink.jar'));
    const applicationYml = fs.existsSync(path.join('lavalink', 'application.yml'));
    
    allPassed &= result('Lavalink.jar', lavalinkJar, lavalinkJar ? 'Le fichier Lavalink.jar existe.' : 'Le fichier Lavalink.jar n\'existe pas.');
    allPassed &= result('application.yml', applicationYml, applicationYml ? 'Le fichier application.yml existe.' : 'Le fichier application.yml n\'existe pas.');
    
    if (applicationYml) {
      const appContent = fs.readFileSync(path.join('lavalink', 'application.yml'), 'utf8');
      const passwordMatch = appContent.includes(`password: "${process.env.LAVALINK_PASSWORD || 'youshallnotpass'}"`);
      
      allPassed &= result('Mot de passe dans application.yml', passwordMatch, passwordMatch ? 'Le mot de passe dans application.yml correspond à celui dans .env' : 'Le mot de passe dans application.yml ne correspond pas à celui dans .env');
    }
  }
  
  // Vérifier Java
  section('3. Vérification de Java');
  
  try {
    const { stdout } = await executeCommand('java -version 2>&1');
    const javaVersion = stdout.match(/version "([^"]+)"/);
    
    if (javaVersion) {
      const version = javaVersion[1];
      const majorVersion = parseInt(version.split('.')[0]);
      const isJava13Plus = majorVersion >= 13 || version.startsWith('1.13');
      
      allPassed &= result('Java installé', true, `Java version ${version} détectée.`);
      allPassed &= result('Java 13+', isJava13Plus, isJava13Plus ? 'La version de Java est 13 ou supérieure.' : 'La version de Java est inférieure à 13. Lavalink nécessite Java 13+.');
    } else {
      allPassed &= result('Java installé', false, 'Impossible de déterminer la version de Java.');
    }
  } catch (error) {
    allPassed &= result('Java installé', false, 'Java n\'est pas installé ou n\'est pas dans le PATH.');
  }
  
  // Vérifier les scripts de démarrage
  section('4. Vérification des scripts de démarrage');
  
  const startLavalinkSh = fs.existsSync('start-lavalink.sh');
  const startLavalinkBat = fs.existsSync('start-lavalink.bat');
  
  allPassed &= result('Script de démarrage', startLavalinkSh || startLavalinkBat, 
    startLavalinkSh ? 'start-lavalink.sh existe.' : 
    startLavalinkBat ? 'start-lavalink.bat existe.' : 
    'Aucun script de démarrage trouvé (start-lavalink.sh ou start-lavalink.bat).');
  
  if (startLavalinkSh) {
    try {
      await executeCommand('chmod +x start-lavalink.sh');
      allPassed &= result('Permissions d\'exécution', true, 'Les permissions d\'exécution ont été accordées à start-lavalink.sh.');
    } catch (error) {
      allPassed &= result('Permissions d\'exécution', false, 'Impossible d\'accorder les permissions d\'exécution à start-lavalink.sh.');
    }
  }
  
  // Vérifier si Lavalink est en cours d'exécution
  section('5. Vérification de l\'exécution de Lavalink');
  
  try {
    const { stdout } = await executeCommand('ps aux | grep -v grep | grep Lavalink.jar');
    const isRunning = stdout.includes('Lavalink.jar');
    
    allPassed &= result('Lavalink en cours d\'exécution', isRunning, isRunning ? 'Lavalink est en cours d\'exécution.' : 'Lavalink n\'est pas en cours d\'exécution.');
  } catch (error) {
    allPassed &= result('Lavalink en cours d\'exécution', false, 'Impossible de vérifier si Lavalink est en cours d\'exécution.');
  }
  
  // Vérifier la connectivité
  section('6. Vérification de la connectivité');
  
  const host = process.env.LAVALINK_HOST || '127.0.0.1';
  const port = parseInt(process.env.LAVALINK_PORT || '2333');
  
  const portOpen = await checkPort(host, port);
  allPassed &= result(`Port ${port} ouvert sur ${host}`, portOpen, portOpen ? `Le port ${port} est ouvert sur ${host}.` : `Le port ${port} n'est pas ouvert sur ${host}.`);
  
  // Vérifier la configuration PM2
  section('7. Vérification de la configuration PM2');
  
  const ecosystemConfig = fs.existsSync('ecosystem.config.js');
  allPassed &= result('Fichier ecosystem.config.js', ecosystemConfig, ecosystemConfig ? 'Le fichier ecosystem.config.js existe.' : 'Le fichier ecosystem.config.js n\'existe pas.');
  
  if (ecosystemConfig) {
    const configContent = fs.readFileSync('ecosystem.config.js', 'utf8');
    const hasLavalinkApp = configContent.includes('name: "lavalink"');
    
    allPassed &= result('Configuration Lavalink dans PM2', hasLavalinkApp, hasLavalinkApp ? 'Lavalink est configuré dans ecosystem.config.js.' : 'Lavalink n\'est pas configuré dans ecosystem.config.js.');
  }
  
  // Résumé
  section('RÉSUMÉ');
  
  if (allPassed) {
    log('\n✅ Tous les tests ont réussi ! Lavalink semble correctement configuré.', colors.green);
  } else {
    log('\n❌ Certains tests ont échoué. Veuillez corriger les problèmes indiqués ci-dessus.', colors.red);
    
    log('\nConseils de dépannage :', colors.yellow);
    log('1. Assurez-vous que Java 13+ est installé : java -version', colors.yellow);
    log('2. Vérifiez que le fichier .env contient les bonnes variables Lavalink', colors.yellow);
    log('3. Vérifiez que le mot de passe dans application.yml correspond à celui dans .env', colors.yellow);
    log('4. Démarrez Lavalink manuellement : ./start-lavalink.sh ou java -jar lavalink/Lavalink.jar', colors.yellow);
    log('5. Vérifiez les logs de Lavalink pour des erreurs', colors.yellow);
    log('6. Assurez-vous que le port 2333 n\'est pas bloqué par un pare-feu', colors.yellow);
    log('7. Redémarrez Lavalink et le bot : pm2 restart ecosystem.config.js', colors.yellow);
  }
}

// Exécuter le script
main().catch(error => {
  console.error('Une erreur s\'est produite :', error);
});
