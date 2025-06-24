#!/usr/bin/env python3
"""
Test simple pour vérifier que le bot peut s'importer et démarrer
"""

import sys
import os

def test_imports():
    """Test des imports critiques"""
    try:
        print("Test des imports critiques...")
        
        # Test des imports principaux
        import discord
        print(f"✓ discord.py version: {discord.__version__}")
        
        import yt_dlp
        print("✓ yt-dlp OK")
        
        from dotenv import load_dotenv
        print("✓ python-dotenv OK")
        
        import spotipy
        print("✓ spotipy OK")
        
        import requests
        print("✓ requests OK")
        
        # Test de l'import du bot
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        import music_bot
        print("✓ music_bot importé avec succès")
        
        # Test de configuration basique yt-dlp
        ytdl_opts = {
            'format': 'bestaudio/best',
            'quiet': True
        }
        ytdl = yt_dlp.YoutubeDL(ytdl_opts)
        print("✓ Configuration yt-dlp OK")
        
        return True
        
    except ImportError as e:
        print(f"✗ Erreur d'import: {e}")
        return False
    except Exception as e:
        print(f"✗ Erreur: {e}")
        return False

def test_environment():
    """Test de l'environnement"""
    print("\nTest de l'environnement...")
    
    # Vérifier si .env existe
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        print("✓ Fichier .env trouvé")
        
        # Charger et vérifier les variables
        from dotenv import load_dotenv
        load_dotenv()
        
        token = os.getenv('DISCORD_TOKEN')
        if token:
            print("✓ DISCORD_TOKEN configuré")
        else:
            print("⚠ DISCORD_TOKEN manquant dans .env")
            
        prefix = os.getenv('COMMAND_PREFIX', '!')
        print(f"✓ Préfixe de commande: {prefix}")
        
        # Test Spotify optionnel
        spotify_id = os.getenv('SPOTIFY_CLIENT_ID')
        spotify_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        if spotify_id and spotify_secret:
            print("✓ Configuration Spotify disponible")
        else:
            print("⚠ Configuration Spotify non trouvée (optionnel)")
            
    else:
        print("⚠ Fichier .env non trouvé")
        print("  Créez un fichier .env avec votre DISCORD_TOKEN")

def main():
    print("=" * 60)
    print("Test rapide du bot Discord Music")
    print("=" * 60)
    
    # Test des imports
    if not test_imports():
        print("\n❌ Échec du test des imports")
        print("Exécutez: pip install -r requirements.txt")
        return 1
    
    # Test de l'environnement
    test_environment()
    
    print("\n" + "=" * 60)
    print("🎉 Tests réussis!")
    print("Le bot devrait pouvoir démarrer correctement.")
    print("=" * 60)
    print("\nPour démarrer le bot:")
    print("1. Configurez votre DISCORD_TOKEN dans .env")
    print("2. Exécutez: python music_bot.py")
    
    return 0

if __name__ == "__main__":
    exit(main())
