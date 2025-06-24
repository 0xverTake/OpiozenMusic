#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OpiozenMusic Bot - Gestionnaire de Déploiement Unifié
Gère le déploiement et la maintenance du bot Discord de musique
"""

import os
import sys
import subprocess
import json
import time
import platform
from pathlib import Path
from typing import Optional, List, Dict, Any

# Configuration
class Config:
    VPS_HOST = "31.97.157.154"
    VPS_USER = "root"
    VPS_PATH = "/root/OpiozenMusic"
    BOT_SERVICE = "opiozenmusic"
    
    # Fichiers nécessaires pour le déploiement
    REQUIRED_FILES = [
        "music_bot.py",
        "requirements.txt", 
        "opiozenmusic-debian.service",
        "deploy-debian.sh",
        "service-manager.sh", 
        "diagnose.sh",
        "update-ytdlp.sh",
        "install.sh",
        "start.sh",
        "README.md",
        ".env.example"
    ]

class Colors:
    """Codes couleur pour la console"""
    if platform.system() == "Windows":
        # Pour Windows, on utilise colorama si disponible
        try:
            import colorama
            colorama.init()
            RED = '\033[91m'
            GREEN = '\033[92m'
            YELLOW = '\033[93m'
            BLUE = '\033[94m'
            PURPLE = '\033[95m'
            CYAN = '\033[96m'
            WHITE = '\033[97m'
            BOLD = '\033[1m'
            END = '\033[0m'
        except ImportError:
            RED = GREEN = YELLOW = BLUE = PURPLE = CYAN = WHITE = BOLD = END = ''
    else:
        RED = '\033[91m'
        GREEN = '\033[92m'
        YELLOW = '\033[93m'  
        BLUE = '\033[94m'
        PURPLE = '\033[95m'
        CYAN = '\033[96m'
        WHITE = '\033[97m'
        BOLD = '\033[1m'
        END = '\033[0m'

class Logger:
    """Logger coloré pour la console"""
    
    @staticmethod
    def info(message: str):
        print(f"{Colors.BLUE}[INFO]{Colors.END} {message}")
    
    @staticmethod
    def success(message: str):
        print(f"{Colors.GREEN}[SUCCESS]{Colors.END} {message}")
    
    @staticmethod
    def warning(message: str):
        print(f"{Colors.YELLOW}[WARNING]{Colors.END} {message}")
    
    @staticmethod
    def error(message: str):
        print(f"{Colors.RED}[ERROR]{Colors.END} {message}")
    
    @staticmethod
    def header(message: str):
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN} {message.center(58)} {Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}\n")

class OpiozenManager:
    """Gestionnaire principal pour OpiozenMusic Bot"""
    
    def __init__(self):
        self.config = Config()
        self.logger = Logger()
        self.current_dir = Path.cwd()
        
    def check_requirements(self) -> bool:
        """Vérifier les prérequis système"""
        self.logger.info("Vérification des prérequis...")
        
        # Vérifier SSH
        if not self._command_exists("ssh"):
            self.logger.error("SSH non trouvé. Installez OpenSSH ou Git Bash.")
            return False
            
        # Vérifier SCP
        if not self._command_exists("scp"):
            self.logger.error("SCP non trouvé. Installez OpenSSH ou Git Bash.")
            return False
            
        # Vérifier les fichiers requis
        missing_files = []
        for file in self.config.REQUIRED_FILES:
            if not (self.current_dir / file).exists():
                missing_files.append(file)
        
        if missing_files:
            self.logger.error(f"Fichiers manquants: {', '.join(missing_files)}")
            return False
            
        self.logger.success("Tous les prérequis sont satisfaits")
        return True
    
    def _command_exists(self, command: str) -> bool:
        """Vérifier si une commande existe"""
        try:
            subprocess.run([command], capture_output=True, check=False)
            return True
        except FileNotFoundError:
            return False
    
    def _run_ssh_command(self, command: str, show_output: bool = True) -> tuple[bool, str]:
        """Exécuter une commande SSH"""
        ssh_cmd = ["ssh", f"{self.config.VPS_USER}@{self.config.VPS_HOST}", command]
        
        try:
            result = subprocess.run(
                ssh_cmd,
                capture_output=not show_output,
                text=True,
                timeout=300
            )
            
            if show_output:
                return result.returncode == 0, ""
            else:
                return result.returncode == 0, result.stdout.strip()
                
        except subprocess.TimeoutExpired:
            self.logger.error("Timeout lors de l'exécution de la commande SSH")
            return False, ""
        except Exception as e:
            self.logger.error(f"Erreur SSH: {e}")
            return False, ""
    
    def _upload_files(self, files: List[str]) -> bool:
        """Uploader des fichiers vers le VPS"""
        self.logger.info("Upload des fichiers vers le VPS...")
        
        # Créer le répertoire de destination
        success, _ = self._run_ssh_command(f"mkdir -p {self.config.VPS_PATH}", False)
        if not success:
            self.logger.error("Impossible de créer le répertoire de destination")
            return False
        
        # Uploader chaque fichier
        for file in files:
            file_path = self.current_dir / file
            if file_path.exists():
                self.logger.info(f"  - Upload de {file}...")
                scp_cmd = ["scp", str(file_path), f"{self.config.VPS_USER}@{self.config.VPS_HOST}:{self.config.VPS_PATH}/"]
                
                try:
                    result = subprocess.run(scp_cmd, capture_output=True, text=True)
                    if result.returncode == 0:
                        self.logger.success(f"  ✓ {file} uploadé")
                    else:
                        self.logger.error(f"  ✗ Échec upload {file}: {result.stderr}")
                        return False
                except Exception as e:
                    self.logger.error(f"  ✗ Erreur upload {file}: {e}")
                    return False
            else:
                self.logger.warning(f"  - Fichier {file} non trouvé, ignoré")
        
        return True
    
    def test_connection(self) -> bool:
        """Tester la connexion SSH"""
        self.logger.info("Test de la connexion SSH...")
        success, output = self._run_ssh_command("echo 'Connexion SSH réussie'", False)
        
        if success:
            self.logger.success("Connexion SSH établie")
            return True
        else:
            self.logger.error("Impossible de se connecter au VPS")
            self.logger.warning("Assurez-vous que:")
            self.logger.warning("- Votre clé SSH est configurée")
            self.logger.warning("- Ou que vous pouvez vous connecter manuellement")
            return False
    
    def deploy_full(self) -> bool:
        """Déploiement complet du bot"""
        self.logger.header("DÉPLOIEMENT COMPLET")
        
        if not self.check_requirements():
            return False
            
        if not self.test_connection():
            response = input(f"{Colors.YELLOW}Continuer quand même? (y/N): {Colors.END}")
            if response.lower() != 'y':
                return False
        
        # Arrêter le service existant
        self.logger.info("Arrêt du service existant...")
        self._run_ssh_command(f"systemctl stop {self.config.BOT_SERVICE} 2>/dev/null || true", False)
        
        # Upload des fichiers
        if not self._upload_files(self.config.REQUIRED_FILES):
            return False
        
        # Configuration des permissions
        self.logger.info("Configuration des permissions...")
        success, _ = self._run_ssh_command(f"cd {self.config.VPS_PATH} && chmod +x *.sh", False)
        if not success:
            self.logger.error("Erreur lors de la configuration des permissions")
            return False
        
        # Mise à jour des dépendances
        self.logger.info("Mise à jour des dépendances...")
        success, _ = self._run_ssh_command(f"cd {self.config.VPS_PATH} && ./update-ytdlp.sh")
        if not success:
            self.logger.warning("Problème lors de la mise à jour des dépendances")
        
        # Vérification du fichier .env
        self.logger.info("Vérification du fichier .env...")
        self._run_ssh_command(f"cd {self.config.VPS_PATH} && if [ ! -f .env ]; then cp .env.example .env && echo 'Fichier .env créé depuis .env.example'; else echo 'Fichier .env existe déjà'; fi")
        
        self.logger.success("Déploiement des fichiers terminé")
        
        # Instructions de configuration
        self.logger.header("CONFIGURATION REQUISE")
        print(f"{Colors.YELLOW}Avant de démarrer le bot, configurez votre token Discord:{Colors.END}")
        print(f"\n1. Connectez-vous au VPS:")
        print(f"   ssh {self.config.VPS_USER}@{self.config.VPS_HOST}")
        print(f"\n2. Éditez le fichier .env:")
        print(f"   cd {self.config.VPS_PATH}")
        print(f"   nano .env")
        print(f"\n3. Remplacez YOUR_BOT_TOKEN_HERE par votre vrai token Discord")
        print(f"\n4. (Optionnel) Ajoutez vos credentials Spotify:")
        print(f"   SPOTIFY_CLIENT_ID=votre_id")
        print(f"   SPOTIFY_CLIENT_SECRET=votre_secret")
        print(f"\n5. Déployez le service:")
        print(f"   ./deploy-debian.sh")
        
        # Proposition de déploiement automatique
        response = input(f"\n{Colors.CYAN}Voulez-vous essayer de déployer maintenant? (y/N): {Colors.END}")
        if response.lower() == 'y':
            self.logger.info("Tentative de déploiement automatique...")
            self.logger.warning("Assurez-vous que votre token Discord est configuré!")
            time.sleep(3)
            
            success, _ = self._run_ssh_command(f"cd {self.config.VPS_PATH} && ./deploy-debian.sh")
            if success:
                self.logger.success("Déploiement terminé avec succès!")
                self.show_management_commands()
                return True
            else:
                self.logger.error("Problème lors du déploiement")
                self.logger.info("Vérifiez manuellement la configuration sur le VPS")
        
        return True
    
    def deploy_quick(self) -> bool:
        """Déploiement rapide (fichiers essentiels seulement)"""
        self.logger.header("DÉPLOIEMENT RAPIDE")
        
        essential_files = ["music_bot.py", "requirements.txt", "service-manager.sh", "update-ytdlp.sh"]
        
        if not self._upload_files(essential_files):
            return False
        
        # Configuration des permissions
        self._run_ssh_command(f"cd {self.config.VPS_PATH} && chmod +x *.sh", False)
        
        # Redémarrage du service
        self.logger.info("Redémarrage du service...")
        success, _ = self._run_ssh_command(f"cd {self.config.VPS_PATH} && ./service-manager.sh restart")
        
        if success:
            self.logger.success("Déploiement rapide terminé!")
            return True
        else:
            self.logger.error("Erreur lors du redémarrage du service")
            return False
    
    def show_status(self):
        """Afficher le statut du bot"""
        self.logger.header("STATUT DU BOT")
        self._run_ssh_command(f"systemctl status {self.config.BOT_SERVICE}")
    
    def show_logs(self):
        """Afficher les logs en temps réel"""
        self.logger.header("LOGS EN TEMPS RÉEL")
        self.logger.info("Appuyez sur Ctrl+C pour quitter")
        self._run_ssh_command(f"journalctl -u {self.config.BOT_SERVICE} -f")
    
    def restart_bot(self):
        """Redémarrer le bot"""
        self.logger.info("Redémarrage du bot...")
        success, _ = self._run_ssh_command(f"cd {self.config.VPS_PATH} && ./service-manager.sh restart")
        if success:
            self.logger.success("Bot redémarré avec succès!")
        else:
            self.logger.error("Erreur lors du redémarrage")
    
    def stop_bot(self):
        """Arrêter le bot"""
        self.logger.info("Arrêt du bot...")
        success, _ = self._run_ssh_command(f"cd {self.config.VPS_PATH} && ./service-manager.sh stop")
        if success:
            self.logger.success("Bot arrêté!")
        else:
            self.logger.error("Erreur lors de l'arrêt")
    
    def update_ytdlp(self):
        """Mettre à jour yt-dlp"""
        self.logger.info("Mise à jour de yt-dlp...")
        success, _ = self._run_ssh_command(f"cd {self.config.VPS_PATH} && ./update-ytdlp.sh")
        if success:
            self.logger.success("yt-dlp mis à jour!")
        else:
            self.logger.error("Erreur lors de la mise à jour")
    
    def run_diagnostics(self):
        """Exécuter les diagnostics"""
        self.logger.header("DIAGNOSTIC COMPLET")
        self._run_ssh_command(f"cd {self.config.VPS_PATH} && ./diagnose.sh")
    
    def edit_env(self):
        """Éditer le fichier .env"""
        self.logger.info("Ouverture de l'éditeur .env...")
        self.logger.warning("Configurez votre token Discord!")
        self._run_ssh_command(f"cd {self.config.VPS_PATH} && nano .env")
    
    def connect_ssh(self):
        """Se connecter en SSH au VPS"""
        self.logger.info("Connexion SSH au VPS...")
        try:
            subprocess.run(["ssh", f"{self.config.VPS_USER}@{self.config.VPS_HOST}"])
        except KeyboardInterrupt:
            self.logger.info("Connexion SSH fermée")
    
    def show_management_commands(self):
        """Afficher les commandes de gestion utiles"""
        print(f"\n{Colors.BOLD}Commandes utiles:{Colors.END}")
        print(f"  - Voir le statut: ssh {self.config.VPS_USER}@{self.config.VPS_HOST} 'systemctl status {self.config.BOT_SERVICE}'")
        print(f"  - Voir les logs: ssh {self.config.VPS_USER}@{self.config.VPS_HOST} 'journalctl -u {self.config.BOT_SERVICE} -f'")
        print(f"  - Redémarrer: ssh {self.config.VPS_USER}@{self.config.VPS_HOST} 'systemctl restart {self.config.BOT_SERVICE}'")
    
    def show_menu(self):
        """Afficher le menu principal"""
        while True:
            self.logger.header("OPIOZENMUSIC BOT - GESTIONNAIRE")
            
            options = [
                ("1", "🚀 Déploiement complet", self.deploy_full),
                ("2", "⚡ Déploiement rapide", self.deploy_quick),
                ("3", "📊 Voir le statut", self.show_status),
                ("4", "📋 Voir les logs", self.show_logs),
                ("5", "🔄 Redémarrer le bot", self.restart_bot),
                ("6", "⏹️  Arrêter le bot", self.stop_bot),
                ("7", "🔧 Mettre à jour yt-dlp", self.update_ytdlp),
                ("8", "🔍 Diagnostic complet", self.run_diagnostics),
                ("9", "✏️  Éditer .env", self.edit_env),
                ("10", "🖥️  Connexion SSH", self.connect_ssh),
                ("0", "❌ Quitter", None)
            ]
            
            for key, description, _ in options:
                print(f"  {Colors.CYAN}{key}{Colors.END}. {description}")
            
            print()
            choice = input(f"{Colors.BOLD}Votre choix: {Colors.END}")
            
            if choice == "0":
                self.logger.info("Au revoir!")
                break
            
            # Trouver et exécuter l'option
            option_found = False
            for key, description, action in options:
                if choice == key and action:
                    print()
                    try:
                        action()
                    except KeyboardInterrupt:
                        self.logger.info("Opération annulée")
                    except Exception as e:
                        self.logger.error(f"Erreur: {e}")
                    
                    input(f"\n{Colors.YELLOW}Appuyez sur Entrée pour continuer...{Colors.END}")
                    option_found = True
                    break
            
            if not option_found:
                self.logger.error("Choix invalide!")
                time.sleep(1)

def main():
    """Point d'entrée principal"""
    try:
        manager = OpiozenManager()
        
        # Vérifier les arguments de ligne de commande
        if len(sys.argv) > 1:
            command = sys.argv[1].lower()
            
            if command == "deploy":
                manager.deploy_full()
            elif command == "quick":
                manager.deploy_quick()
            elif command == "status":
                manager.show_status()
            elif command == "logs":
                manager.show_logs()
            elif command == "restart":
                manager.restart_bot()
            elif command == "stop":
                manager.stop_bot()
            elif command == "update":
                manager.update_ytdlp()
            elif command == "diagnose":
                manager.run_diagnostics()
            elif command == "ssh":
                manager.connect_ssh()
            else:
                print(f"Commande inconnue: {command}")
                print("Commandes disponibles: deploy, quick, status, logs, restart, stop, update, diagnose, ssh")
        else:
            # Afficher le menu interactif
            manager.show_menu()
            
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Opération annulée par l'utilisateur{Colors.END}")
    except Exception as e:
        print(f"{Colors.RED}Erreur fatale: {e}{Colors.END}")
        sys.exit(1)

if __name__ == "__main__":
    main()
