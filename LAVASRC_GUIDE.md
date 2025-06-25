# Guide d'utilisation du plugin LavaSrc pour ZenBeat

Ce guide explique comment configurer et utiliser le plugin LavaSrc avec votre bot Discord ZenBeat. LavaSrc permet de lire de la musique depuis diverses sources comme Spotify, Apple Music, Deezer et plus encore.

## Fonctionnalités

LavaSrc ajoute les fonctionnalités suivantes à votre bot ZenBeat :

- **Support de Spotify** : lecture de pistes, albums et playlists Spotify
- **Support d'Apple Music** : lecture de pistes, albums et playlists Apple Music
- **Support de Deezer** : lecture de pistes, albums et playlists Deezer
- **FlowerTube** : recherche YouTube sans API key
- **Recherche améliorée** : recherche dans plusieurs sources à la fois

## Configuration

Le plugin LavaSrc est déjà installé et configuré avec les paramètres de base. Voici comment activer et configurer les différentes sources de musique :

### Spotify

Pour activer le support de Spotify, vous devez obtenir un ID client et un secret client Spotify :

1. Allez sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Connectez-vous avec votre compte Spotify
3. Créez une nouvelle application
4. Notez l'ID client et le secret client
5. Modifiez le fichier `lavalink/application.yml` :

```yaml
plugins:
  lavasrc:
    providers:
      spotify: true # Changez de false à true
      spotifyClientId: "VOTRE_ID_CLIENT"
      spotifyClientSecret: "VOTRE_SECRET_CLIENT"
```

### Apple Music

Pour activer le support d'Apple Music, vous devez obtenir un token Apple Music :

1. Suivez les instructions sur [Apple Developer](https://developer.apple.com/documentation/applemusicapi/getting_keys_and_creating_tokens)
2. Modifiez le fichier `lavalink/application.yml` :

```yaml
plugins:
  lavasrc:
    providers:
      applemusic: true # Changez de false à true
      appleMusicToken: "VOTRE_TOKEN"
      appleMusicCountryCode: "FR" # Changez pour votre code pays
```

### Deezer

Le support de Deezer est déjà activé par défaut et ne nécessite pas de configuration supplémentaire.

## Utilisation

### Commandes

Utilisez la commande `/play` comme d'habitude, mais maintenant vous pouvez utiliser des liens de différentes sources :

- **Spotify** : `/play https://open.spotify.com/track/...`
- **Apple Music** : `/play https://music.apple.com/fr/album/...`
- **Deezer** : `/play https://www.deezer.com/track/...`
- **YouTube** : `/play https://www.youtube.com/watch?v=...`
- **SoundCloud** : `/play https://soundcloud.com/...`
- **Recherche** : `/play nom de la chanson`

### Exemples

```
/play https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
/play https://music.apple.com/fr/album/song/123456789
/play https://www.deezer.com/track/987654321
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
/play never gonna give you up
```

## Dépannage

### Problèmes avec Spotify

Si vous rencontrez des problèmes avec Spotify, vérifiez que :
- Votre ID client et secret client sont corrects
- Vous avez activé Spotify dans la configuration (`spotify: true`)
- Votre application Spotify est active

### Problèmes avec Apple Music

Si vous rencontrez des problèmes avec Apple Music, vérifiez que :
- Votre token est valide et n'a pas expiré
- Vous avez activé Apple Music dans la configuration (`applemusic: true`)
- Le code pays est correct

### Problèmes généraux

Si vous rencontrez des problèmes généraux :

1. Vérifiez les logs de Lavalink pour des erreurs spécifiques :
   ```bash
   pm2 logs lavalink
   ```

2. Redémarrez Lavalink :
   ```bash
   pm2 restart lavalink
   ```

3. Vérifiez que le plugin est correctement installé :
   ```bash
   ls -la lavalink/plugins/
   ```

## Mise à jour du plugin

Pour mettre à jour le plugin LavaSrc vers une version plus récente :

1. Téléchargez la dernière version depuis [GitHub](https://github.com/topi314/LavaSrc/releases)
2. Remplacez le fichier `lavalink/plugins/lavasrc-plugin.jar` par la nouvelle version
3. Redémarrez Lavalink :
   ```bash
   pm2 restart lavalink
   ```

## Conclusion

Avec LavaSrc, votre bot ZenBeat peut maintenant lire de la musique depuis diverses sources, offrant une expérience musicale plus riche à vos utilisateurs. Si vous avez des questions ou des problèmes, consultez la [documentation officielle de LavaSrc](https://github.com/topi314/LavaSrc).
