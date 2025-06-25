# Correction de l'erreur "node.joinChannel is not a function"

## Problème

L'erreur suivante se produisait lors de l'utilisation des commandes de musique :

```
TypeError: node.joinChannel is not a function
    at MusicPlayer.connect (/root/bots/OpiozenMusic/utils/musicPlayerLavalink.js:180:33)
    at MusicPlayer.addSong (/root/bots/OpiozenMusic/utils/musicPlayerLavalink.js:299:33)
    at Object.execute (/root/bots/OpiozenMusic/commands/play.js:46:56)
```

## Cause

Cette erreur était due à un changement d'API dans la bibliothèque Shoukaku v4.1.1. La méthode `joinChannel` n'existe pas dans cette version. De plus, la méthode pour rejoindre un canal vocal n'est pas disponible sur l'objet `node` mais directement sur l'instance de `Shoukaku` elle-même, sous le nom de `joinVoiceChannel`.

## Solution

La solution a consisté à mettre à jour la méthode `connect` dans le fichier `utils/musicPlayerLavalink.js` pour utiliser la méthode correcte de l'API Shoukaku v4.

### Modification effectuée

```javascript
// Avant (code incorrect)
const player = await node.joinChannel({
  guildId: interaction.guild.id,
  channelId: channel.id,
  shardId: interaction.guild.shardId || 0,
  deaf: true
});

// Après (code corrigé)
const player = await this.shoukaku.joinVoiceChannel({
  guildId: interaction.guild.id,
  channelId: channel.id,
  shardId: interaction.guild.shardId || 0,
  deaf: true,
  node: node.name // Spécifier quel nœud utiliser
});
```

## Vérification

Pour vérifier que la correction fonctionne :

1. Redémarrez le bot
2. Utilisez la commande `/play` pour jouer une chanson
3. Vérifiez que le bot rejoint le salon vocal et commence à jouer la musique

## Informations supplémentaires

- Cette correction est spécifique à Shoukaku v4.1.1
- Dans Shoukaku v4, la méthode pour rejoindre un canal vocal est disponible sur l'instance principale de Shoukaku, pas sur les nœuds individuels
- L'API correcte pour rejoindre un canal vocal est :
  ```javascript
  shoukaku.joinVoiceChannel({
    guildId: "ID_DU_SERVEUR",
    channelId: "ID_DU_CANAL",
    shardId: 0,
    deaf: true,
    node: "NOM_DU_NOEUD" // Optionnel, spécifie quel nœud utiliser
  });
  ```
- Si vous mettez à jour Shoukaku vers une version ultérieure, vérifiez la documentation pour vous assurer que l'API n'a pas changé à nouveau
- Pour plus d'informations sur l'API de Shoukaku, consultez la documentation officielle : https://github.com/Deivu/Shoukaku
