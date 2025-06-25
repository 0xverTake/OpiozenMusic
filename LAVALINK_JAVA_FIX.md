# Résolution de l'erreur "Unexpected server response: 200" avec Lavalink

Cette erreur se produit lorsque votre bot Discord tente de se connecter à Lavalink via WebSocket, mais que la connexion échoue même si le serveur HTTP répond avec un code 200 (OK). Voici comment résoudre ce problème étape par étape.

## Diagnostic du problème

Après avoir exécuté le script de vérification (`node check-lavalink.js`), nous avons identifié plusieurs problèmes :

1. **Java n'est pas installé** ou n'est pas dans le PATH
2. **Lavalink n'est pas en cours d'exécution**
3. **Le port 2333 n'est pas ouvert** sur 127.0.0.1

## Solutions

### 1. Installer Java

Lavalink nécessite Java 13 ou supérieur pour fonctionner correctement.

#### Sur Debian/Ubuntu
```bash
sudo apt update
sudo apt install openjdk-17-jre
```

#### Sur CentOS/RHEL
```bash
sudo yum install java-17-openjdk
```

#### Vérifier l'installation
Après l'installation, vérifiez que Java est correctement installé :
```bash
java -version
```

Vous devriez voir quelque chose comme :
```
openjdk version "17.0.x" 20xx-xx-xx
OpenJDK Runtime Environment (build 17.0.x+x-Ubuntu-xxx)
OpenJDK 64-Bit Server VM (build 17.0.x+x-Ubuntu-xxx, mixed mode, sharing)
```

### 2. Accorder les permissions d'exécution au script de démarrage

```bash
chmod +x start-lavalink.sh
```

### 3. Démarrer Lavalink

Vous pouvez démarrer Lavalink de deux façons :

#### Option 1 : Utiliser le script de démarrage
```bash
./start-lavalink.sh
```

#### Option 2 : Démarrer Lavalink directement
```bash
java -jar lavalink/Lavalink.jar
```

#### Option 3 : Utiliser PM2 (recommandé pour la production)
```bash
pm2 start ecosystem.config.js --only lavalink
```

### 4. Vérifier que Lavalink est en cours d'exécution

Après avoir démarré Lavalink, vérifiez qu'il est bien en cours d'exécution :

```bash
ps aux | grep java
```

Vous devriez voir un processus Java exécutant Lavalink.jar.

Vous pouvez également vérifier si le port 2333 est ouvert :

```bash
netstat -tuln | grep 2333
```

### 5. Vérifier les logs de Lavalink

Si Lavalink ne démarre pas correctement, vérifiez les logs pour identifier le problème :

```bash
# Si vous utilisez PM2
pm2 logs lavalink

# Sinon, vérifiez les logs dans le répertoire lavalink/logs
cat lavalink/logs/spring.log
```

### 6. Redémarrer le bot

Une fois Lavalink correctement démarré, redémarrez votre bot :

```bash
# Si vous utilisez PM2
pm2 restart OpiozenM

# Sinon, démarrez votre bot normalement
node index.js
```

## Utiliser un serveur Lavalink public (solution temporaire)

Si vous ne parvenez pas à faire fonctionner Lavalink localement, vous pouvez utiliser un serveur Lavalink public temporairement. Modifiez votre fichier `.env` comme suit :

```
LAVALINK_HOST=lavalink.devz.cloud
LAVALINK_PORT=443
LAVALINK_PASSWORD=mathiscool
LAVALINK_SECURE=true
```

Notez que les serveurs publics peuvent avoir des limitations ou être instables. Cette solution devrait être temporaire pendant que vous résolvez les problèmes avec votre installation locale.

## Vérification finale

Après avoir effectué ces étapes, exécutez à nouveau le script de vérification pour vous assurer que tout est correctement configuré :

```bash
node check-lavalink.js
```

Si tous les tests passent, votre bot devrait maintenant pouvoir se connecter à Lavalink sans erreur.

## Problèmes courants et solutions

### Erreur "Unexpected server response: 200"

Cette erreur spécifique se produit généralement lorsque :

1. **Lavalink est en cours d'exécution mais n'accepte pas les connexions WebSocket** - Vérifiez que Lavalink est correctement configuré dans `application.yml` pour accepter les connexions sur l'interface et le port spécifiés.

2. **Le mot de passe est incorrect** - Assurez-vous que le mot de passe dans `.env` correspond exactement à celui dans `application.yml`.

3. **Problème de version de Java** - Assurez-vous d'utiliser Java 13 ou supérieur.

4. **Problème de pare-feu** - Vérifiez que le port 2333 n'est pas bloqué par un pare-feu.

### Erreur "No available nodes"

Cette erreur indique que le bot ne peut pas se connecter à Lavalink. Assurez-vous que :

1. Lavalink est en cours d'exécution
2. Les paramètres de connexion dans `.env` sont corrects
3. Le port n'est pas bloqué par un pare-feu

## Conclusion

Si vous avez suivi toutes ces étapes et que le problème persiste, vérifiez les logs complets de Lavalink et du bot pour identifier d'autres erreurs potentielles. N'hésitez pas à consulter la documentation officielle de Lavalink et d'erela.js pour plus d'informations.
