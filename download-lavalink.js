const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const LAVALINK_VERSION = 'v3.7.8'; // Change this to the latest version if needed
const LAVALINK_DOWNLOAD_URL = `https://github.com/freyacodes/Lavalink/releases/download/${LAVALINK_VERSION}/Lavalink.jar`;
const LAVALINK_DIR = path.join(__dirname, 'lavalink');
const LAVALINK_JAR_PATH = path.join(LAVALINK_DIR, 'Lavalink.jar');
const APPLICATION_YML_PATH = path.join(LAVALINK_DIR, 'application.yml');

// Create Lavalink directory if it doesn't exist
if (!fs.existsSync(LAVALINK_DIR)) {
  console.log('Creating Lavalink directory...');
  fs.mkdirSync(LAVALINK_DIR, { recursive: true });
}

// Download Lavalink.jar
console.log(`Downloading Lavalink ${LAVALINK_VERSION}...`);
console.log(`URL: ${LAVALINK_DOWNLOAD_URL}`);

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded to ${dest}`);
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(dest, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
};

// Copy application.yml if it doesn't exist
const copyApplicationYml = () => {
  if (!fs.existsSync(APPLICATION_YML_PATH)) {
    console.log('Copying application.yml to Lavalink directory...');
    fs.copyFileSync(path.join(__dirname, 'application.yml'), APPLICATION_YML_PATH);
    console.log('application.yml copied successfully.');
  } else {
    console.log('application.yml already exists in Lavalink directory.');
  }
};

// Check Java version
const checkJava = () => {
  try {
    const javaVersion = execSync('java -version 2>&1').toString();
    console.log('Java version detected:');
    console.log(javaVersion);
    
    // Check if Java version is 13 or higher
    const versionMatch = javaVersion.match(/version "([^"]+)"/);
    if (versionMatch) {
      const version = versionMatch[1];
      const majorVersion = parseInt(version.split('.')[0]);
      
      if (majorVersion >= 13 || version.startsWith('1.8')) {
        console.log('Java version is compatible with Lavalink.');
        return true;
      } else {
        console.warn('WARNING: Lavalink requires Java 13 or higher. Please update your Java installation.');
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking Java version:');
    console.error(error.message);
    console.error('Please make sure Java is installed and available in your PATH.');
    return false;
  }
};

// Create start scripts
const createStartScripts = () => {
  // Windows batch script
  const batchScript = `@echo off
echo Starting Lavalink server...
cd "%~dp0lavalink"
java -jar Lavalink.jar
pause
`;
  fs.writeFileSync(path.join(__dirname, 'start-lavalink.bat'), batchScript);
  console.log('Created start-lavalink.bat');

  // Unix shell script
  const shellScript = `#!/bin/bash
echo "Starting Lavalink server..."
cd "$(dirname "$0")/lavalink"
java -jar Lavalink.jar
`;
  fs.writeFileSync(path.join(__dirname, 'start-lavalink.sh'), shellScript);
  fs.chmodSync(path.join(__dirname, 'start-lavalink.sh'), '755');
  console.log('Created start-lavalink.sh');
};

// Main function
const main = async () => {
  try {
    // Check Java
    checkJava();
    
    // Download Lavalink.jar
    if (!fs.existsSync(LAVALINK_JAR_PATH)) {
      await downloadFile(LAVALINK_DOWNLOAD_URL, LAVALINK_JAR_PATH);
    } else {
      console.log('Lavalink.jar already exists. Skipping download.');
    }
    
    // Copy application.yml
    copyApplicationYml();
    
    // Create start scripts
    createStartScripts();
    
    console.log('\nLavalink setup completed successfully!');
    console.log('\nTo start Lavalink:');
    console.log('- On Windows: Run start-lavalink.bat');
    console.log('- On Linux/Mac: Run ./start-lavalink.sh');
    console.log('\nMake sure to configure your bot to connect to Lavalink:');
    console.log('1. Add these variables to your .env file:');
    console.log('   LAVALINK_HOST=localhost');
    console.log('   LAVALINK_PORT=2333');
    console.log('   LAVALINK_PASSWORD=youshallnotpass');
    console.log('   LAVALINK_SECURE=false');
    console.log('2. Start your bot with npm start or pm2');
    console.log('\nFor more information, see LAVALINK_GUIDE.md');
  } catch (error) {
    console.error('Error setting up Lavalink:');
    console.error(error);
  }
};

// Run the main function
main();
