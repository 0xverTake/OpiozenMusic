# Résolution de l'erreur "TokenInvalid: An invalid token was provided"

Cette erreur indique que le token Discord fourni à votre bot est invalide ou manquant. Voici comment résoudre ce problème :

## Causes possibles

1. **Token manquant** : Le token n'est pas défini dans votre fichier `.env` ou `config.json`
2. **Token invalide** : Le token a été révoqué, est mal copié, ou contient des caractères incorrects
3. **Problème de chargement** : Le fichier contenant le token n'est pas correctement chargé

## Solutions

### 1. Vérifier votre token Discord

1. Connectez-vous au [Portail des développeurs Discord](https://discord.com/developers/applications)
2. Sélectionnez votre application
3. Allez dans l'onglet "Bot"
4. Cliquez sur "Reset Token" pour générer un nouveau token
5. Copiez ce nouveau token

### 2. Mettre à jour votre configuration

#### Option A : Utiliser un fichier .env

1. Créez ou modifiez le fichier `.env` à la racine de votre projet
2. Ajoutez ou mettez à jour la ligne suivante :
   ```
   TOKEN=votre_nouveau_token_ici
   ```
3. Assurez-vous qu'il n'y a pas d'espaces avant ou après le signe égal
4. Sauvegardez le fichier

#### Option B : Utiliser config.json

1. Ouvrez le fichier `config.json`
2. Mettez à jour la valeur du token :
   ```json
   {
     "token": "votre_nouveau_token_ici",
     "clientId": "...",
     "guildId": "...",
     "prefix": "!",
     "embedColor": "#7289DA"
   }
   ```
3. Sauvegardez le fichier

### 3. Vérifier le chargement du token dans index.js

Assurez-vous que votre fichier `index.js` charge correctement le token. Le code devrait ressembler à ceci :

```javascript
// Load environment variables from .env file
require('dotenv').config();

// Get token from environment variables or config.json as fallback
let token;
try {
  token = process.env.TOKEN || require('./config.json').token;
  
  // Vérification que le token existe et n'est pas vide
  if (!token || token.length === 0) {
    throw new Error('Token is empty or undefined');
  }
  
  console.log('Token loaded successfully');
} catch (error) {
  console.error('Error loading token:', error.message);
  console.error('Please make sure you have a valid config.json file or TOKEN in your .env file');
  process.exit(1);
}

// Login to Discord with your client's token
client.login(token);
```

### 4. Redémarrer votre bot

Après avoir mis à jour le token, redémarrez votre bot :

```bash
pm2 restart OpiozenM
```

## Conseils de sécurité

- **Ne partagez jamais** votre token Discord avec qui que ce soit
- Ne le publiez pas sur GitHub ou d'autres dépôts publics
- Si vous pensez que votre token a été compromis, réinitialisez-le immédiatement
- Utilisez `.gitignore` pour exclure les fichiers `.env` et `config.json` de vos commits

## Vérification supplémentaire

Si vous utilisez PM2, vous pouvez vérifier les variables d'environnement avec :

```bash
pm2 env OpiozenM
```

Cela vous montrera si la variable TOKEN est correctement définie dans l'environnement PM2.
