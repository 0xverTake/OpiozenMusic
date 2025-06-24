#!/usr/bin/env python3
"""
Script de contournement avancé pour OpiozenMusic
Méthodes multiples pour éviter les restrictions YouTube
"""

import yt_dlp
import requests
import json
import random
import time
from urllib.parse import quote
import subprocess
import os

class AdvancedBypass:
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
        ]
        
        self.proxies = self.load_free_proxies()
    
    def load_free_proxies(self):
        """Charger une liste de proxies gratuits (optionnel)"""
        # Liste de proxies publics (attention: peuvent être instables)
        return [
            # Ajoutez ici des proxies si nécessaire
            # Format: 'http://proxy:port'
        ]
    
    def get_ytdl_options_with_bypass(self, method='standard'):
        """Obtenir les options yt-dlp avec différentes méthodes de contournement"""
        
        base_options = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extractaudio': True,
            'audioformat': 'mp3',
            'outtmpl': '%(title)s.%(ext)s',
            'noplaylist': True,
            'extract_flat': False,
        }
        
        if method == 'standard':
            base_options.update({
                'http_headers': {
                    'User-Agent': random.choice(self.user_agents),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-us,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                }
            })
        
        elif method == 'mobile':
            base_options.update({
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Connection': 'keep-alive',
                }
            })
        
        elif method == 'embedded':
            base_options.update({
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'web_embedded'],
                        'skip': ['hls', 'dash'],
                    }
                }
            })
        
        elif method == 'cookies':
            if os.path.exists('cookies.txt'):
                base_options['cookiefile'] = 'cookies.txt'
        
        return base_options
    
    def try_extract_with_methods(self, url, max_attempts=3):
        """Essayer plusieurs méthodes de contournement"""
        methods = ['standard', 'mobile', 'embedded', 'cookies']
        
        for method in methods:
            for attempt in range(max_attempts):
                try:
                    print(f"🔄 Tentative {attempt + 1} avec méthode '{method}'...")
                    
                    options = self.get_ytdl_options_with_bypass(method)
                    
                    # Ajouter un délai aléatoire entre les tentatives
                    if attempt > 0:
                        time.sleep(random.uniform(1, 3))
                    
                    with yt_dlp.YoutubeDL(options) as ydl:
                        info = ydl.extract_info(url, download=False)
                        print(f"✅ Succès avec méthode '{method}'!")
                        return info
                
                except Exception as e:
                    print(f"❌ Échec méthode '{method}', tentative {attempt + 1}: {str(e)[:100]}...")
                    continue
        
        raise Exception("Toutes les méthodes de contournement ont échoué")
    
    def search_alternative_apis(self, query):
        """Rechercher via des APIs alternatives"""
        results = []
        
        # API YouTube alternative (Invidious)
        try:
            invidious_instances = [
                'https://invidious.io',
                'https://y.com.sb',
                'https://invidious.xamh.de',
                'https://inv.riverside.rocks'
            ]
            
            for instance in invidious_instances:
                try:
                    response = requests.get(f"{instance}/api/v1/search", 
                                          params={'q': query, 'type': 'video'},
                                          timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        if data:
                            video = data[0]
                            results.append({
                                'title': video.get('title', ''),
                                'url': f"https://youtube.com/watch?v={video.get('videoId', '')}",
                                'duration': video.get('lengthSeconds', 0),
                                'uploader': video.get('author', ''),
                                'source': 'invidious'
                            })
                            break
                except:
                    continue
        except Exception as e:
            print(f"Erreur Invidious: {e}")
        
        return results
    
    def create_bypass_script(self):
        """Créer un script de contournement personnalisé"""
        script_content = '''#!/usr/bin/env python3
import sys
import json
from advanced_bypass import AdvancedBypass

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 bypass_script.py <search_query>")
        sys.exit(1)
    
    query = " ".join(sys.argv[1:])
    bypass = AdvancedBypass()
    
    try:
        # Essayer d'abord la recherche YouTube avec contournement
        search_url = f"ytsearch:{query}"
        result = bypass.try_extract_with_methods(search_url)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Erreur: {e}")
        # Essayer les APIs alternatives
        alt_results = bypass.search_alternative_apis(query)
        if alt_results:
            print(json.dumps(alt_results[0], indent=2))
        else:
            print("Aucun résultat trouvé")
            sys.exit(1)

if __name__ == "__main__":
    main()
'''
        
        with open('bypass_script.py', 'w') as f:
            f.write(script_content)
        
        print("✅ Script de contournement créé: bypass_script.py")

def test_bypass_methods():
    """Tester les différentes méthodes de contournement"""
    bypass = AdvancedBypass()
    
    test_queries = [
        "lofi hip hop",
        "relaxing music",
        "jazz instrumental"
    ]
    
    print("🧪 Test des méthodes de contournement...")
    
    for query in test_queries:
        print(f"\n🔍 Test avec: '{query}'")
        try:
            result = bypass.try_extract_with_methods(f"ytsearch1:{query}")
            if result and 'entries' in result:
                entry = result['entries'][0]
                print(f"✅ Trouvé: {entry.get('title', 'Titre inconnu')}")
            else:
                print("❌ Aucun résultat")
        except Exception as e:
            print(f"❌ Erreur: {e}")
            
            # Essayer les APIs alternatives
            alt_results = bypass.search_alternative_apis(query)
            if alt_results:
                print(f"🔄 Alternative trouvée: {alt_results[0]['title']}")
            else:
                print("❌ Aucune alternative trouvée")

if __name__ == "__main__":
    print("🚀 Configuration du système de contournement avancé...")
    
    bypass = AdvancedBypass()
    bypass.create_bypass_script()
    
    print("\n🧪 Lancement des tests...")
    test_bypass_methods()
    
    print("\n✅ Configuration terminée!")
    print("📋 Fichiers créés:")
    print("  - bypass_script.py: Script de contournement standalone")
    print("  - advanced_bypass.py: Module de contournement")
    print("\n💡 Utilisation:")
    print("  python3 bypass_script.py 'votre recherche'")
