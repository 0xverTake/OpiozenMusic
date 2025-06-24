#!/usr/bin/env python3
"""
Script de test pour vérifier les imports et dépendances du bot Discord
"""

import sys
import traceback
from colorama import init, Fore, Style

init(autoreset=True)

def test_import(module_name, import_statement=None):
    """Test d'import d'un module"""
    try:
        if import_statement:
            exec(import_statement)
        else:
            __import__(module_name)
        print(f"{Fore.GREEN}✓ {module_name} - OK")
        return True
    except ImportError as e:
        print(f"{Fore.RED}✗ {module_name} - ERREUR: {e}")
        return False
    except Exception as e:
        print(f"{Fore.YELLOW}⚠ {module_name} - ATTENTION: {e}")
        return False

def main():
    print(f"{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}Test des dépendances du bot Discord Music")
    print(f"{Fore.CYAN}{'='*60}")
    
    print(f"\n{Fore.YELLOW}Version Python: {sys.version}")
    
    # Test des imports principaux
    modules_to_test = [
        ("discord", "import discord"),
        ("discord.ext.commands", "from discord.ext import commands"),
        ("yt_dlp", "import yt_dlp"),
        ("asyncio", "import asyncio"),
        ("os", "import os"),
        ("json", "import json"),
        ("re", "import re"),
        ("dotenv", "from dotenv import load_dotenv"),
        ("spotipy", "import spotipy"),
        ("spotipy.oauth2", "from spotipy.oauth2 import SpotifyClientCredentials"),
        ("requests", "import requests"),
        ("colorama", "import colorama"),
        ("PyNaCl", "import nacl")
    ]
    
    print(f"\n{Fore.CYAN}Test des imports:")
    success_count = 0
    
    for module_name, import_stmt in modules_to_test:
        if test_import(module_name, import_stmt):
            success_count += 1
    
    print(f"\n{Fore.CYAN}Résultats:")
    print(f"Modules testés: {len(modules_to_test)}")
    print(f"Succès: {Fore.GREEN}{success_count}")
    print(f"Échecs: {Fore.RED}{len(modules_to_test) - success_count}")
    
    # Test fonctionnel de base
    print(f"\n{Fore.CYAN}Test fonctionnel de base:")
    
    try:
        import discord
        print(f"{Fore.GREEN}✓ Discord.py version: {discord.__version__}")
    except:
        print(f"{Fore.RED}✗ Impossible de récupérer la version de discord.py")
    
    try:
        import yt_dlp
        print(f"{Fore.GREEN}✓ yt-dlp importé avec succès")
        
        # Test de configuration yt-dlp basique
        ytdl_opts = {
            'format': 'bestaudio/best',
            'noplaylist': True,
            'quiet': True
        }
        ytdl = yt_dlp.YoutubeDL(ytdl_opts)
        print(f"{Fore.GREEN}✓ Configuration yt-dlp OK")
        
    except Exception as e:
        print(f"{Fore.RED}✗ Erreur yt-dlp: {e}")
    
    if success_count == len(modules_to_test):
        print(f"\n{Fore.GREEN}{Style.BRIGHT}🎉 Tous les modules sont installés correctement!")
        print(f"{Fore.GREEN}Le bot devrait pouvoir démarrer sans problème.")
        return 0
    else:
        print(f"\n{Fore.RED}{Style.BRIGHT}❌ Certains modules manquent ou ont des erreurs.")
        print(f"{Fore.YELLOW}Exécutez: pip install -r requirements.txt")
        return 1

if __name__ == "__main__":
    exit(main())
