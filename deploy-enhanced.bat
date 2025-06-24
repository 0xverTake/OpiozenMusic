@echo off
echo ================================================
echo   OpiozenMusic Enhanced - Deploiement Avance
echo ================================================
echo.

REM Configuration - MODIFIEZ CES VALEURS
set RASPBERRY_IP=192.168.1.100
set RASPBERRY_USER=pi
set RASPBERRY_PATH=/home/pi/OpiozenMusic

echo Configuration:
echo - IP Raspberry Pi: %RASPBERRY_IP%
echo - Utilisateur: %RASPBERRY_USER%
echo - Repertoire cible: %RASPBERRY_PATH%
echo.

REM Test de connexion
echo 🔍 Test de connexion SSH...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "echo 'Connexion SSH OK'"
if %errorlevel% neq 0 (
    echo ❌ Erreur de connexion SSH
    pause
    exit /b 1
)

echo ✅ Connexion SSH etablie
echo.

REM Creation du repertoire
echo 📁 Creation du repertoire sur le Raspberry Pi...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "mkdir -p %RASPBERRY_PATH%"

REM Envoi de tous les fichiers
echo 📤 Envoi des fichiers enhanced...
scp -r *.py *.txt *.sh *.md *.env.example *.service .gitignore %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'envoi des fichiers
    pause
    exit /b 1
)

echo ✅ Fichiers envoyes avec succes
echo.

REM Configuration du fichier .env si il existe
if exist .env (
    echo 🔧 Envoi de la configuration .env...
    scp .env %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/
    echo ✅ Configuration .env envoyee
) else (
    echo ⚠️  Fichier .env non trouve - copie du template
    ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && cp .env.example .env"
)

echo.

REM Configuration des permissions
echo 🔧 Configuration des permissions...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && chmod +x *.sh && chmod +x *.py"

REM Installation enhanced
echo 📦 Installation des dependances enhanced...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && if [ -f requirements_enhanced.txt ]; then cp requirements_enhanced.txt requirements.txt; fi && ./install.sh"

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation
    echo 🔄 Tentative avec installation de base...
    ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && pip install -r requirements.txt"
)

REM Configuration des cookies YouTube (optionnel)
echo 🍪 Configuration des cookies YouTube...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && if [ -f setup-cookies.sh ]; then ./setup-cookies.sh; fi"

echo ✅ Installation terminee
echo.

REM Configuration du service systeme
echo 🛠️ Configuration du service systeme...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && ./setup-service.sh"

echo ✅ Service configure
echo.

echo ================================================
echo         DEPLOIEMENT ENHANCED TERMINE
echo ================================================
echo.
echo 🚀 Votre bot OpiozenMusic Enhanced est installe!
echo.
echo 📋 Fonctionnalites incluses:
echo   ✅ Support multi-sources (YouTube, SoundCloud, Bandcamp)
echo   ✅ Contournement avance des restrictions YouTube
echo   ✅ Systeme de cookies automatique
echo   ✅ APIs alternatives (Invidious)
echo   ✅ Mode shuffle et commandes avancees
echo   ✅ Gestion d'erreurs amelioree
echo.
echo ⚙️  Configuration finale:
echo 1. Configurez votre token Discord:
echo    ssh %RASPBERRY_USER%@%RASPBERRY_IP%
echo    cd %RASPBERRY_PATH%
echo    nano .env
echo.
echo 2. Demarrez le bot enhanced:
echo    sudo systemctl start opiozenmusic
echo.
echo 3. Ou utilisez le nouveau bot:
echo    python3 music_bot_enhanced.py
echo.
echo 📊 Surveillance:
echo    sudo journalctl -u opiozenmusic -f
echo.
echo 🎵 Le bot supporte maintenant:
echo    - Recherche multi-plateformes automatique
echo    - Contournement des restrictions YouTube
echo    - Sources alternatives en cas d'echec
echo    - Commandes avancees (!shuffle, !alternative, !sources)
echo.
echo ================================================

pause
