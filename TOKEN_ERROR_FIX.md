# Résolution de l'erreur "Expected token to be set for this request"

Cette erreur se produit lorsque vous essayez de déployer les commandes slash de votre bot Discord, mais que le token du bot n'est pas correctement configuré.

## Cause du problème

L'erreur "Expected token to be set for this request, but none was present" indique que le script `deploy-commands.js` ou `deploy-commands-global.js` n'a pas pu trouver le token du bot Discord lors de l'exécution.

## Solution

### 1. Créer un fichier .env

La méthode recommandée est de créer un fichier `.env` à la racine de votre projet avec les informations suivantes :

```
TOKEN=votre_token_discord_bot
CLIENT_ID=votre_client_id_discord
```

Vous pouvez copier le fichier `.env.example` et le renommer en `.env` :

```bash
cp .env.example .env
```

Puis modifiez le fichier `.env` pour y ajouter votre token et votre client ID.

### 2. Où trouver votre token et client ID

1. **Token du bot** : 
   - Rendez-vous sur [Discord Developer Portal](https://discord.com/developers/applications)
   - Sélectionnez votre application
   - Dans le menu de gauche, cliquez sur "Bot"
   - Sous la section "TOKEN", cliquez sur "Reset Token" ou "Copy" si vous avez déjà un token
   - Copiez ce token dans votre fichier `.env` après `TOKEN=`

2. **Client ID** :
   - Dans le même portail développeur, sélectionnez votre application
   - Dans le menu de gauche, cliquez sur "General Information"
   - Sous "APPLICATION ID", copiez l'identifiant
   - Collez cet identifiant dans votre fichier `.env` après `CLIENT_ID=`

### 3. Alternative : Utiliser config.json

Si vous préférez ne pas utiliser de fichier `.env`, vous pouvez créer un fichier `config.json` à la racine de votre projet avec le contenu suivant :

```json
{
  "token": "votre_token_discord_bot",
  "clientId": "votre_client_id_discord",
  "embedColor": "#5865F2"
}
```

### 4. Redéployer les commandes

Une fois que vous avez configuré votre token et client ID, vous pouvez redéployer les commandes :

```bash
node deploy-commands.js
```

ou pour les commandes globales :

```bash
node deploy-commands-global.js
```

## Vérification

Après avoir exécuté le script, vous devriez voir un message comme :

```
Successfully reloaded X application (/) commands globally.
```

Si vous voyez toujours l'erreur, vérifiez que :
- Le fichier `.env` ou `config.json` est correctement formaté
- Le token et le client ID sont corrects
- Le fichier est bien placé à la racine du projet

## Sécurité

⚠️ **IMPORTANT** : Ne partagez jamais votre token de bot avec qui que ce soit et ne le publiez pas sur GitHub ou d'autres plateformes publiques. Le token donne un accès complet à votre bot.

- Assurez-vous que `.env` est inclus dans votre fichier `.gitignore`
- Si vous avez accidentellement exposé votre token, régénérez-en un immédiatement dans le portail développeur Discord
