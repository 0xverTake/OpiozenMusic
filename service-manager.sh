#!/bin/bash

# Script de gestion du service OpiozenMusic

SERVICE_NAME="opiozenmusic"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Usage: $0 {start|stop|restart|status|logs|enable|disable|install}"
    echo ""
    echo "Commandes:"
    echo "  start     - Démarre le service"
    echo "  stop      - Arrête le service"
    echo "  restart   - Redémarre le service"
    echo "  status    - Affiche le statut du service"
    echo "  logs      - Affiche les logs en temps réel"
    echo "  enable    - Active le service au démarrage"
    echo "  disable   - Désactive le service au démarrage"
    echo "  install   - Installe et configure le service"
}

case "$1" in
    start)
        print_status "Démarrage du service $SERVICE_NAME..."
        sudo systemctl start $SERVICE_NAME
        if sudo systemctl is-active --quiet $SERVICE_NAME; then
            print_success "Service démarré avec succès"
        else
            print_error "Échec du démarrage du service"
            exit 1
        fi
        ;;
    stop)
        print_status "Arrêt du service $SERVICE_NAME..."
        sudo systemctl stop $SERVICE_NAME
        print_success "Service arrêté"
        ;;
    restart)
        print_status "Redémarrage du service $SERVICE_NAME..."
        sudo systemctl restart $SERVICE_NAME
        if sudo systemctl is-active --quiet $SERVICE_NAME; then
            print_success "Service redémarré avec succès"
        else
            print_error "Échec du redémarrage du service"
            exit 1
        fi
        ;;
    status)
        sudo systemctl status $SERVICE_NAME
        ;;
    logs)
        print_status "Affichage des logs (Ctrl+C pour quitter)..."
        sudo journalctl -u $SERVICE_NAME -f
        ;;
    enable)
        print_status "Activation du service au démarrage..."
        sudo systemctl enable $SERVICE_NAME
        print_success "Service activé au démarrage"
        ;;
    disable)
        print_status "Désactivation du service au démarrage..."
        sudo systemctl disable $SERVICE_NAME
        print_success "Service désactivé au démarrage"
        ;;
    install)
        print_status "Installation du service..."
        ./deploy-debian.sh
        ;;
    *)
        show_help
        exit 1
        ;;
esac
