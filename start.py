#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OpiozenMusic Bot - Script de Démarrage Rapide
Usage: python start.py [commande]
"""

import sys
import os
import subprocess
from pathlib import Path

def install_requirements():
    """Installer les dépendances Python si nécessaire"""
    try:
        import colorama
    except ImportError:
        print("Installation de colorama pour les couleurs...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "colorama"])

def main():
    """Point d'entrée principal"""
    # Installer les dépendances si nécessaire
    install_requirements()
    
    # S'assurer qu'on est dans le bon répertoire
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Lancer le gestionnaire principal
    try:
        subprocess.run([sys.executable, "opiomanager.py"] + sys.argv[1:])
    except FileNotFoundError:
        print("❌ Erreur: opiomanager.py non trouvé")
        print("Assurez-vous d'être dans le répertoire OpiozenMusic")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Au revoir!")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
