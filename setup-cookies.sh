#!/bin/bash

# Script pour configurer les cookies YouTube et contourner les restrictions

echo "🍪 Configuration des cookies YouTube pour OpiozenMusic..."

# Vérification des dépendances
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 non trouvé"
    exit 1
fi

# Installation des dépendances pour l'extraction des cookies
echo "📦 Installation des dépendances pour cookies..."
pip install browser-cookie3 selenium webdriver-manager

# Création du script d'extraction des cookies
cat > extract_cookies.py << 'EOF'
#!/usr/bin/env python3
import browser_cookie3
import json
import os
from pathlib import Path

def extract_youtube_cookies():
    """Extraire les cookies YouTube depuis les navigateurs"""
    cookies_data = []
    
    # Essayer différents navigateurs
    browsers = [
        ('Chrome', browser_cookie3.chrome),
        ('Firefox', browser_cookie3.firefox),
        ('Edge', browser_cookie3.edge),
        ('Safari', browser_cookie3.safari) if os.name != 'nt' else None
    ]
    
    for browser_name, browser_func in browsers:
        if browser_func is None:
            continue
            
        try:
            print(f"🔍 Extraction des cookies de {browser_name}...")
            jar = browser_func(domain_name='youtube.com')
            
            for cookie in jar:
                if 'youtube.com' in cookie.domain:
                    cookies_data.append({
                        'name': cookie.name,
                        'value': cookie.value,
                        'domain': cookie.domain,
                        'path': cookie.path,
                        'secure': cookie.secure,
                        'httponly': hasattr(cookie, 'rest') and 'HttpOnly' in cookie.rest
                    })
            
            if cookies_data:
                print(f"✅ {len(cookies_data)} cookies extraits de {browser_name}")
                break
                
        except Exception as e:
            print(f"⚠️ Erreur avec {browser_name}: {e}")
            continue
    
    return cookies_data

def save_cookies_netscape_format(cookies_data, filename='cookies.txt'):
    """Sauvegarder les cookies au format Netscape pour yt-dlp"""
    with open(filename, 'w') as f:
        f.write("# Netscape HTTP Cookie File\n")
        f.write("# This is a generated file! Do not edit.\n\n")
        
        for cookie in cookies_data:
            line = f"{cookie['domain']}\tTRUE\t{cookie['path']}\t{'TRUE' if cookie['secure'] else 'FALSE'}\t0\t{cookie['name']}\t{cookie['value']}\n"
            f.write(line)
    
    print(f"💾 Cookies sauvegardés dans {filename}")

if __name__ == "__main__":
    try:
        cookies = extract_youtube_cookies()
        if cookies:
            save_cookies_netscape_format(cookies)
            print("✅ Configuration des cookies terminée!")
            print("🎵 Vous pouvez maintenant utiliser le bot sans restrictions YouTube")
        else:
            print("❌ Aucun cookie YouTube trouvé")
            print("💡 Connectez-vous à YouTube dans votre navigateur puis relancez ce script")
    except Exception as e:
        print(f"❌ Erreur: {e}")
EOF

# Rendre le script executable
chmod +x extract_cookies.py

# Exécuter le script d'extraction
echo "🚀 Extraction des cookies..."
python3 extract_cookies.py

# Vérifier si les cookies ont été créés
if [ -f "cookies.txt" ]; then
    echo "✅ Cookies configurés avec succès!"
    echo "📋 Le fichier cookies.txt a été créé"
    echo "🎵 Le bot peut maintenant accéder à YouTube sans restrictions"
else
    echo "⚠️ Cookies non créés"
    echo "💡 Solutions alternatives:"
    echo "1. Connectez-vous à YouTube dans votre navigateur"
    echo "2. Relancez ce script"
    echo "3. Ou utilisez les sources alternatives (SoundCloud, Bandcamp)"
fi

echo ""
echo "🔧 Configuration terminée!"
echo "▶️ Vous pouvez maintenant démarrer le bot avec: ./start.sh"
