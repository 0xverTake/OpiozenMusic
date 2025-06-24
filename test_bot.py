#!/usr/bin/env python3
"""
Script de test pour OpiozenMusic
Vérifie les dépendances et les fonctionnalités de base
"""

import sys
import subprocess
import os

def test_imports():
    """Tester les imports des dépendances"""
    print("🧪 Test des imports...")
    
    tests = [
        ("discord", "Discord.py"),
        ("yt_dlp", "yt-dlp"),
        ("dotenv", "python-dotenv"),
        ("requests", "requests"),
        ("spotipy", "spotipy (optionnel)")
    ]
    
    success = True
    for module, name in tests:
        try:
            __import__(module)
            print(f"✅ {name}")
        except ImportError as e:
            print(f"❌ {name}: {e}")
            if module != "spotipy":  # Spotipy est optionnel
                success = True
    
    return success

def test_ytdlp():
    """Tester yt-dlp avec une recherche simple"""
    print("\n🎵 Test de yt-dlp...")
    
    try:
        import yt_dlp
        
        options = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'format': 'best',
        }
        
        with yt_dlp.YoutubeDL(options) as ydl:
            result = ydl.extract_info('ytsearch1:test', download=False)
            if result and 'entries' in result and result['entries']:
                print("✅ yt-dlp fonctionne correctement")
                return True
            else:
                print("⚠️ yt-dlp: aucun résultat trouvé")
                return False
                
    except Exception as e:
        print(f"❌ yt-dlp: {e}")
        return False

def test_ffmpeg():
    """Tester FFmpeg"""
    print("\n🔊 Test de FFmpeg...")
    
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFmpeg: {version_line}")
            return True
        else:
            print("❌ FFmpeg non trouvé")
            return False
    except FileNotFoundError:
        print("❌ FFmpeg non installé")
        return False
    except subprocess.TimeoutExpired:
        print("⏱️ FFmpeg timeout")
        return False

def test_env_file():
    """Tester le fichier .env"""
    print("\n⚙️ Test du fichier .env...")
    
    if not os.path.exists('.env'):
        print("⚠️ Fichier .env non trouvé")
        print("💡 Copiez .env.example vers .env et configurez votre token Discord")
        return False
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        token = os.getenv('DISCORD_TOKEN')
        if not token or token == 'YOUR_BOT_TOKEN_HERE':
            print("⚠️ Token Discord non configuré")
            print("💡 Modifiez DISCORD_TOKEN dans le fichier .env")
            return False
        else:
            print("✅ Token Discord configuré")
            return True
            
    except Exception as e:
        print(f"❌ Erreur .env: {e}")
        return False

def test_spotify():
    """Tester la configuration Spotify (optionnel)"""
    print("\n🎶 Test de Spotify (optionnel)...")
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            print("⚠️ Spotify non configuré (optionnel)")
            print("💡 Ajoutez SPOTIFY_CLIENT_ID et SPOTIFY_CLIENT_SECRET pour le support Spotify")
            return True  # Ce n'est pas critique
        
        import spotipy
        from spotipy.oauth2 import SpotifyClientCredentials
        
        client_credentials_manager = SpotifyClientCredentials(
            client_id=client_id, client_secret=client_secret
        )
        sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
        
        # Test avec une piste populaire
        results = sp.search(q='test', type='track', limit=1)
        if results['tracks']['items']:
            print("✅ Spotify configuré et fonctionnel")
            return True
        else:
            print("⚠️ Spotify: aucun résultat de test")
            return True
            
    except Exception as e:
        print(f"⚠️ Spotify: {e}")
        return True  # Non critique

def main():
    """Fonction principale de test"""
    print("🚀 Tests OpiozenMusic Bot")
    print("=" * 40)
    
    results = []
    
    # Tests des composants
    results.append(("Imports", test_imports()))
    results.append(("yt-dlp", test_ytdlp()))
    results.append(("FFmpeg", test_ffmpeg()))
    results.append(("Configuration", test_env_file()))
    results.append(("Spotify", test_spotify()))
    
    # Résumé
    print("\n" + "=" * 40)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 40)
    
    critical_failed = False
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{name:15} {status}")
        
        if not success and name in ['Imports', 'yt-dlp', 'FFmpeg', 'Configuration']:
            critical_failed = True
    
    print("\n" + "=" * 40)
    
    if critical_failed:
        print("❌ TESTS ÉCHOUÉS - Le bot ne peut pas démarrer")
        print("\n💡 Actions recommandées:")
        print("1. Installez les dépendances: pip install -r requirements.txt")
        print("2. Installez FFmpeg: sudo apt install ffmpeg")
        print("3. Configurez le token Discord dans .env")
        return False
    else:
        print("✅ TOUS LES TESTS PASSÉS - Le bot est prêt!")
        print("\n🚀 Pour démarrer le bot:")
        print("python3 music_bot.py")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
