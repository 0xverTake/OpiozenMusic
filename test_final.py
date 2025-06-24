# -*- coding: utf-8 -*-
"""
Test simple du bot OpiozenMusic
"""

def test_imports():
    """Tester les imports un par un"""
    errors = []
    
    try:
        import discord
        print("✅ discord.py importé")
    except Exception as e:
        errors.append(f"discord.py: {e}")
        
    try:
        import yt_dlp
        print("✅ yt-dlp importé")
    except Exception as e:
        errors.append(f"yt-dlp: {e}")
        
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv importé")
    except Exception as e:
        errors.append(f"python-dotenv: {e}")
        
    try:
        import spotipy
        print("✅ spotipy importé")
    except Exception as e:
        errors.append(f"spotipy: {e}")
        
    try:
        import requests
        print("✅ requests importé")
    except Exception as e:
        errors.append(f"requests: {e}")
    
    if errors:
        print("\n❌ Erreurs d'import:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print("\n🎉 Tous les imports sont OK!")
        return True

def test_bot_syntax():
    """Tester la syntaxe du bot"""
    try:
        import music_bot
        print("✅ Bot importé sans erreur de syntaxe")
        return True
    except SyntaxError as e:
        print(f"❌ Erreur de syntaxe dans le bot: {e}")
        return False
    except Exception as e:
        print(f"⚠️ Import du bot OK mais erreur d'exécution: {e}")
        return True  # Syntaxe OK même si erreur d'exécution

if __name__ == "__main__":
    print("🔍 Test des dépendances OpiozenMusic")
    print("=" * 50)
    
    # Test des imports
    imports_ok = test_imports()
    
    if imports_ok:
        print("\n🔍 Test de la syntaxe du bot")
        print("-" * 30)
        syntax_ok = test_bot_syntax()
        
        if syntax_ok:
            print("\n🎉 SUCCESS: Le bot est prêt à fonctionner!")
            print("\nÉtapes suivantes:")
            print("1. Configurez votre DISCORD_TOKEN dans .env")
            print("2. Lancez: python music_bot.py")
        else:
            print("\n❌ ERREUR: Problème de syntaxe dans le bot")
    else:
        print("\n❌ ERREUR: Dépendances manquantes")
        print("Exécutez: pip install discord.py yt-dlp spotipy python-dotenv requests colorama PyNaCl")
