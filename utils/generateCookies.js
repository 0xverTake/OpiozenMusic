/**
 * Script pour générer des cookies YouTube pour contourner la détection de bot
 * 
 * Instructions:
 * 1. Exécutez ce script avec Node.js: node utils/generateCookies.js
 * 2. Suivez les instructions pour ouvrir un navigateur et vous connecter à YouTube
 * 3. Copiez les cookies générés et ajoutez-les à votre fichier .env ou définissez-les comme variable d'environnement
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateYouTubeCookies() {
  console.log('\n=== Générateur de cookies YouTube pour ZenBeat ===\n');
  console.log('Ce script va vous aider à générer des cookies YouTube pour contourner la détection de bot.');
  console.log('Un navigateur va s\'ouvrir. Veuillez vous connecter à votre compte YouTube.\n');
  
  rl.question('Appuyez sur Entrée pour continuer...', async () => {
    console.log('\nLancement du navigateur...');
    
    try {
      // Lancer le navigateur
      const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--window-size=1280,720']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      
      // Aller sur YouTube
      console.log('Navigation vers YouTube...');
      await page.goto('https://www.youtube.com', { waitUntil: 'networkidle2' });
      
      console.log('\n=== INSTRUCTIONS ===');
      console.log('1. Connectez-vous à votre compte YouTube dans le navigateur qui vient de s\'ouvrir');
      console.log('2. Une fois connecté, revenez à cette fenêtre de terminal');
      console.log('3. Appuyez sur Entrée pour extraire les cookies et fermer le navigateur\n');
      
      rl.question('Appuyez sur Entrée une fois connecté...', async () => {
        // Extraire les cookies
        const cookies = await page.cookies();
        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
        
        // Fermer le navigateur
        await browser.close();
        
        console.log('\n=== COOKIES GÉNÉRÉS AVEC SUCCÈS ===\n');
        console.log('Voici votre chaîne de cookies YouTube:');
        console.log('\x1b[33m%s\x1b[0m', cookieString);
        console.log('\nPour utiliser ces cookies avec ZenBeat:');
        console.log('1. Créez un fichier .env à la racine du projet');
        console.log('2. Ajoutez la ligne suivante au fichier:');
        console.log('\x1b[33m%s\x1b[0m', `YOUTUBE_COOKIE="${cookieString}"`);
        console.log('\nOU définissez la variable d\'environnement YOUTUBE_COOKIE avec cette valeur.\n');
        
        // Créer un exemple de fichier .env
        const envPath = path.join(__dirname, '..', '.env.example');
        fs.writeFileSync(envPath, `# Exemple de fichier .env pour ZenBeat\n\n# Token Discord Bot\nTOKEN=your_discord_bot_token\n\n# Cookie YouTube pour contourner la détection de bot\nYOUTUBE_COOKIE="${cookieString}"\n`);
        
        console.log(`Un fichier .env.example a été créé à la racine du projet. Vous pouvez le renommer en .env et le modifier selon vos besoins.`);
        console.log('\nMerci d\'avoir utilisé le générateur de cookies ZenBeat!\n');
        
        rl.close();
      });
    } catch (error) {
      console.error('Une erreur s\'est produite:', error);
      rl.close();
    }
  });
}

generateYouTubeCookies();
