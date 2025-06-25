# Résolution de l'erreur "connect ECONNREFUSED ::1:2333" avec Lavalink

Cette erreur indique que votre bot Discord ne peut pas se connecter au serveur Lavalink. Voici comment résoudre ce problème étape par étape.

## Comprendre l'erreur

L'erreur `connect ECONNREFUSED ::1:2333` signifie que :
- Le bot essaie de se connecter à Lavalink sur l'adresse `::1` (IPv6 localhost) et le port `2333`
- La connexion est refusée, ce qui indique généralement que Lavalink n'est pas en cours d'exécution ou n'est pas accessible

## Solutions

### 1. Vérifier que Lavalink est en cours d'exécution

Première étape : assurez-vous que le serveur Lavalink est bien démarré.

```bash
# Vérifier les processus Java en cours d'exécution
ps aux | grep java

# Ou sur Windows
tasklist | findstr java
```

Si Lavalink n'est pas en cours d'exécution, démarrez-le :

```bash
# Sur Linux/Mac
java -jar lavalink/Lavalink.jar

# Ou utilisez le script fourni
./start-lavalink.sh
```

```batch
:: Sur Windows
start-lavalink.bat
```

### 2. Forcer l'utilisation de l'adresse IPv4

Le problème peut venir de l'utilisation de l'adresse IPv6 (`::1`) au lieu de l'adresse IPv4 (`127.0.0.1`). Modifiez votre fichier `.env` pour spécifier explicitement l'adresse IPv4 :

```
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

### 3. Vérifier la configuration de Lavalink

Assurez-vous que le fichier `application.yml` est correctement configuré :

```yaml
server:
  port: 2333
  address: 0.0.0.0  # Ceci permet les connexions de toutes les interfaces
```

Si vous avez modifié le port ou l'adresse dans `application.yml`, assurez-vous que les variables d'environnement du bot correspondent.

### 4. Vérifier les logs de Lavalink

Examinez les logs de Lavalink pour voir s'il y a des erreurs au démarrage :

```bash
# Si vous utilisez le répertoire par défaut
cat lavalink/logs/spring.log
```

Recherchez des messages d'erreur comme :
- "Port already in use" (port déjà utilisé)
- "Failed to bind to address" (échec de liaison à l'adresse)
- "Permission denied" (permission refusée)

### 5. Vérifier les pare-feu et les règles de sécurité

Assurez-vous que le port 2333 n'est pas bloqué par un pare-feu :

```bash
# Sur Linux
sudo ufw status
# ou
sudo iptables -L

# Sur Windows
netsh advfirewall firewall show rule name=all | findstr 2333
```

Si nécessaire, ajoutez une règle pour autoriser le trafic sur le port 2333 :

```bash
# Sur Linux
sudo ufw allow 2333

# Sur Windows
netsh advfirewall firewall add rule name="Lavalink" dir=in action=allow protocol=TCP localport=2333
```

### 6. Tester la connexion manuellement

Vérifiez si le port est accessible :

```bash
# Sur Linux/Mac
telnet 127.0.0.1 2333
# ou
nc -zv 127.0.0.1 2333

# Sur Windows (PowerShell)
Test-NetConnection -ComputerName 127.0.0.1 -Port 2333
```

### 7. Vérifier la configuration du client Lavalink dans le bot

Assurez-vous que le code de connexion à Lavalink dans `utils/musicPlayerLavalink.js` est correct :

```javascript
this.manager = new Manager({
  nodes: [
    {
      host: process.env.LAVALINK_HOST || '127.0.0.1', // Utilisez 127.0.0.1 au lieu de localhost
      port: parseInt(process.env.LAVALINK_PORT || '2333'),
      password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
      secure: process.env.LAVALINK_SECURE === 'true',
    },
  ],
  // ...
});
```

### 8. Redémarrer les services

Parfois, un simple redémarrage peut résoudre le problème :

1. Arrêtez Lavalink
2. Arrêtez le bot
3. Démarrez Lavalink
4. Attendez que Lavalink soit complètement démarré (vérifiez les logs)
5. Démarrez le bot

```bash
# Arrêter et redémarrer le bot avec PM2
pm2 stop OpiozenM
pm2 start OpiozenM
```

### 9. Utiliser un serveur Lavalink public (solution temporaire)

Si vous ne parvenez pas à faire fonctionner Lavalink localement, vous pouvez utiliser un serveur Lavalink public temporairement :

```
LAVALINK_HOST=lavalink.devz.cloud
LAVALINK_PORT=443
LAVALINK_PASSWORD=mathiscool
LAVALINK_SECURE=true
```

Notez que les serveurs publics peuvent avoir des limitations ou être instables. Cette solution devrait être temporaire pendant que vous résolvez les problèmes avec votre installation locale.

## Vérification de l'état de la connexion

Pour vérifier si votre bot est correctement connecté à Lavalink, ajoutez temporairement ce code de débogage dans `utils/musicPlayerLavalink.js` :

```javascript
// Ajouter dans le constructeur après l'initialisation du manager
setInterval(() => {
  const nodes = this.manager.nodes;
  nodes.forEach(node => {
    console.log(`Node ${node.options.identifier} - État: ${node.connected ? 'Connecté' : 'Déconnecté'}`);
  });
}, 5000);
```

Cela affichera l'état de connexion de chaque nœud Lavalink toutes les 5 secondes.

## Problèmes courants et solutions

### Java n'est pas installé ou version incorrecte

Lavalink nécessite Java 13 ou supérieur. Vérifiez votre version de Java :

```bash
java -version
```

Si Java n'est pas installé ou si la version est inférieure à 13, installez une version compatible.

### Port déjà utilisé

Si le port 2333 est déjà utilisé par un autre service, vous pouvez :
1. Arrêter le service qui utilise ce port
2. Configurer Lavalink pour utiliser un port différent dans `application.yml` et mettre à jour la variable d'environnement `LAVALINK_PORT` en conséquence

### Problèmes de résolution DNS avec "localhost"

Parfois, "localhost" peut être résolu en IPv6 (::1) alors que votre système n'est pas correctement configuré pour IPv6. Utilisez toujours l'adresse IP explicite "127.0.0.1" au lieu de "localhost".

## Conclusion

Si vous avez suivi toutes ces étapes et que le problème persiste, vérifiez les logs complets de Lavalink et du bot pour identifier d'autres erreurs potentielles. N'hésitez pas à consulter la documentation officielle de Lavalink et d'erela.js pour plus d'informations.
