# Résolution de l'erreur "No available nodes" avec ZenBeat

Ce guide vous aidera à résoudre l'erreur "No available nodes" qui peut survenir lors de l'utilisation du bot musical ZenBeat avec Lavalink.

## Comprendre l'erreur

L'erreur "No available nodes" signifie que votre bot Discord ne peut pas se connecter à un serveur Lavalink. Cette erreur peut se produire pour plusieurs raisons :

1. **Lavalink n'est pas en cours d'exécution**
2. **Java n'est pas installé** ou la version est incompatible
3. **Problèmes de configuration** dans les fichiers .env ou application.yml
4. **Problèmes de connectivité réseau** ou de pare-feu
5. **Problèmes de permissions** pour exécuter Lavalink

## Solutions étape par étape

### 1. Vérifier l'installation de Java

Lavalink nécessite Java 13 ou supérieur pour fonctionner correctement.

```bash
java -version
```

Si Java n'est pas installé ou si la version est inférieure à 13, installez-le :

#### Sur Debian/Ubuntu
```bash
sudo apt update
sudo apt install openjdk-17-jre
```

#### Sur CentOS/RHEL
```bash
sudo yum install java-17-openjdk
```

#### Sur Windows
Téléchargez et installez Java depuis [le site officiel d'Oracle](https://www.oracle.com/java/technologies/downloads/) ou [AdoptOpenJDK](https://adoptopenjdk.net/).

### 2. Vérifier la configuration

#### Fichier .env
Assurez-vous que votre fichier `.env` contient les paramètres Lavalink corrects :

```
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

#### Fichier application.yml
Vérifiez que le fichier `lavalink/application.yml` est correctement configuré avec le même mot de passe :

```yaml
server:
  port: 2333
  address: 0.0.0.0
lavalink:
  server:
    password: "youshallnotpass"
```

### 3. Démarrer Lavalink

#### Télécharger Lavalink (si nécessaire)
Si vous n'avez pas encore Lavalink, exécutez le script de téléchargement :

```bash
node download-lavalink.js
```

#### Démarrer Lavalink manuellement
Pour démarrer Lavalink manuellement :

```bash
# Sur Linux/Mac
./start-lavalink.sh

# Sur Windows
start-lavalink.bat
```

#### Vérifier que Lavalink est en cours d'exécution
Vous devriez voir des logs indiquant que Lavalink a démarré avec succès. Recherchez des messages comme :

```
[INFO] Lavalink is ready to accept connections.
```

### 4. Utiliser le script de débogage

Exécutez le script de débogage pour vérifier la connexion à Lavalink :

```bash
node utils/debugLavalink.js
```

Ce script vérifiera si Lavalink est accessible et affichera des informations de diagnostic.

### 5. Vérifier la connectivité réseau

Assurez-vous que le port 2333 n'est pas bloqué par un pare-feu :

```bash
# Sur Linux
sudo ufw status
# ou
sudo iptables -L

# Sur Windows (PowerShell)
netsh advfirewall firewall show rule name=all | findstr 2333
```

Testez la connexion au port 2333 :

```bash
# Sur Linux/Mac
telnet 127.0.0.1 2333
# ou
nc -zv 127.0.0.1 2333

# Sur Windows (PowerShell)
Test-NetConnection -ComputerName 127.0.0.1 -Port 2333
```

### 6. Vérifier les logs

Examinez les logs de Lavalink pour voir s'il y a des erreurs au démarrage :

```bash
# Si vous utilisez PM2
pm2 logs lavalink

# Sinon, vérifiez les logs dans le répertoire lavalink/logs
cat lavalink/logs/spring.log
```

### 7. Redémarrer les services

Si vous utilisez PM2, redémarrez Lavalink puis le bot :

```bash
pm2 restart lavalink
# Attendez quelques secondes que Lavalink démarre complètement
pm2 restart zenbeat
```

### 8. Exécuter le script de vérification complet

Exécutez le script de vérification pour diagnostiquer tous les problèmes potentiels :

```bash
node check-lavalink.js
```

## Problèmes courants et solutions

### Erreur "connect ECONNREFUSED ::1:2333"

Cette erreur indique que Lavalink n'est pas en cours d'exécution ou n'est pas accessible sur l'adresse IPv6 locale.

**Solution** : Utilisez explicitement l'adresse IPv4 dans votre fichier .env :
```
LAVALINK_HOST=127.0.0.1
```

### Erreur "java.lang.RuntimeException: Failed to bind to address"

Cette erreur indique que le port 2333 est déjà utilisé par un autre processus.

**Solution** : Changez le port dans `application.yml` et mettez à jour la variable `LAVALINK_PORT` dans `.env`.

### Erreur "Error: Failed to connect to node: Error: connect ECONNREFUSED"

Cette erreur indique que le bot ne peut pas se connecter à Lavalink.

**Solution** :
1. Vérifiez que Lavalink est en cours d'exécution
2. Vérifiez les paramètres de connexion
3. Vérifiez que le port n'est pas bloqué par un pare-feu

### Erreur "Error: Failed to connect to node: Error: Timeout"

Cette erreur indique que la connexion à Lavalink a expiré.

**Solution** :
1. Vérifiez que Lavalink est en cours d'exécution
2. Vérifiez que l'adresse IP et le port sont corrects
3. Vérifiez la connectivité réseau

## Utiliser un serveur Lavalink public (solution temporaire)

Si vous ne parvenez pas à faire fonctionner Lavalink localement, vous pouvez utiliser un serveur Lavalink public temporairement :

```
LAVALINK_HOST=lavalink.devz.cloud
LAVALINK_PORT=443
LAVALINK_PASSWORD=mathiscool
LAVALINK_SECURE=true
```

Notez que les serveurs publics peuvent avoir des limitations ou être instables. Cette solution devrait être temporaire pendant que vous résolvez les problèmes avec votre installation locale.

## Conclusion

Si vous avez suivi toutes ces étapes et que le problème persiste, vérifiez les logs complets de Lavalink et du bot pour identifier d'autres erreurs potentielles. N'hésitez pas à consulter la documentation officielle de Lavalink et d'erela.js pour plus d'informations.
