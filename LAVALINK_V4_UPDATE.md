# Mise à jour vers Lavalink v4

Ce guide explique les modifications apportées pour rendre ZenBeat compatible avec Lavalink v4.

## Problème initial

L'erreur "Unexpected server response: 200" se produisait car le bot utilisait la bibliothèque `erela.js` qui est compatible avec Lavalink v3, mais pas avec Lavalink v4. Les logs Lavalink montraient clairement ce problème :

```
WARN lavalink.server.config.WebsocketConfig : This is the old Lavalink websocket endpoint. Please use /v4/websocket instead. If you are using a client library, please update it to a Lavalink v4 compatible version or use Lavalink v3 instead.
```

## Solution implémentée

Pour résoudre ce problème, nous avons :

1. Remplacé la bibliothèque `erela.js` par `shoukaku`, qui est compatible avec Lavalink v4
2. Réécrit le fichier `utils/musicPlayerLavalink.js` pour utiliser l'API de `shoukaku`
3. Mis à jour les commandes qui interagissent avec le lecteur de musique

## Modifications apportées

### 1. Installation de la nouvelle bibliothèque

```bash
npm install shoukaku --save
```

### 2. Réécriture du gestionnaire de musique

Le fichier `utils/musicPlayerLavalink.js` a été entièrement réécrit pour utiliser `shoukaku` au lieu de `erela.js`. Les principales différences sont :

- Utilisation de `Shoukaku` et `Connectors.DiscordJS` au lieu de `Manager`
- Connexion à l'endpoint WebSocket v4 en utilisant le paramètre `path: '/v4/websocket'`
- Gestion manuelle de la file d'attente (shoukaku ne gère pas les files d'attente contrairement à erela.js)
- Adaptation des méthodes pour correspondre à l'API de shoukaku

**Mise à jour importante** : La configuration de connexion a été modifiée pour utiliser le format correct pour Lavalink v4 :

```javascript
// Configuration correcte pour Lavalink v4
{
  name: 'Main Node',
  url: `${host}:${port}`,
  auth: password,
  secure: secure,
  path: '/v4/websocket'
}
```

### 3. Mise à jour des commandes

La commande `queue.js` a été mise à jour pour utiliser la nouvelle méthode `getQueueInfo()` au lieu de `getQueue()`.

## Comment vérifier que tout fonctionne

1. Assurez-vous que Lavalink est en cours d'exécution :
   ```bash
   pm2 restart lavalink
   ```

2. Redémarrez le bot :
   ```bash
   pm2 restart zenbeat
   ```

3. Vérifiez les logs du bot pour vous assurer qu'il se connecte correctement à Lavalink :
   ```bash
   pm2 logs zenbeat
   ```

   Vous devriez voir un message comme :
   ```
   [LAVALINK DEBUG] ✅ Node Main Node connected.
   ```

4. Testez les commandes de musique :
   - `/play` pour jouer une chanson
   - `/queue` pour afficher la file d'attente
   - `/skip` pour passer à la chanson suivante
   - etc.

## Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez les logs de Lavalink :
   ```bash
   pm2 logs lavalink
   ```

2. Vérifiez les logs du bot :
   ```bash
   pm2 logs zenbeat
   ```

3. Assurez-vous que les variables d'environnement sont correctement configurées dans le fichier `.env` :
   ```
   LAVALINK_HOST=127.0.0.1
   LAVALINK_PORT=2333
   LAVALINK_PASSWORD=youshallnotpass
   LAVALINK_SECURE=false
   ```

## Remarques importantes

- La nouvelle implémentation utilise une gestion de file d'attente personnalisée, car `shoukaku` ne fournit pas cette fonctionnalité contrairement à `erela.js`.
- Les événements et méthodes ont été adaptés pour correspondre à l'API de `shoukaku`.
- L'URL de connexion WebSocket inclut maintenant explicitement le chemin `/v4/websocket`.

## Alternatives

Si cette solution ne fonctionne pas pour vous, vous pouvez également :

1. Revenir à Lavalink v3 (voir LAVALINK_JAVA_FIX.md)
2. Essayer une autre bibliothèque compatible avec Lavalink v4 comme `@lavaclient/lavalink` ou `kazagumo`
