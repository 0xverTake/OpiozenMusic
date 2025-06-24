@echo off
echo ================================================
echo   OpiozenMusic - Deploiement Automatique
echo ================================================
echo.

REM Configuration - MODIFIEZ CES VALEURS SELON VOTRE SETUP
set RASPBERRY_IP=
set RASPBERRY_USER=pi
set RASPBERRY_PATH=/home/pi/OpiozenMusic

REM Configuration avancee (optionnel)
set SSH_KEY_PATH=
set DISCORD_TOKEN=

echo Configuration actuelle:
echo - IP Raspberry Pi: %RASPBERRY_IP%
echo - Utilisateur: %RASPBERRY_USER%
echo - Repertoire: %RASPBERRY_PATH%
echo.

echo 🚀 Deploiement et installation automatique...
echo.

REM 1. Envoi des fichiers
echo 📤 Envoi des fichiers vers le Raspberry Pi...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "mkdir -p %RASPBERRY_PATH%"
scp -r * %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'envoi des fichiers
    pause
    exit /b 1
)

echo ✅ Fichiers envoyes
echo.

REM 2. Configuration des permissions
echo 🔧 Configuration des permissions...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && chmod +x *.sh"

REM 3. Installation automatique
echo 📦 Installation des dependances...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && ./install.sh"

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation
    pause
    exit /b 1
)

echo ✅ Installation terminee
echo.

REM 4. Configuration du token Discord (si fourni)
if not "%DISCORD_TOKEN%"=="" (
    echo 🔑 Configuration du token Discord...
    ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && sed -i 's/YOUR_BOT_TOKEN_HERE/%DISCORD_TOKEN%/g' .env"
    echo ✅ Token Discord configure
) else (
    echo ⚠️  Token Discord non configure - vous devrez le faire manuellement
)

echo.

REM 5. Configuration en service (optionnel)
echo 🛠️ Configuration du service systeme...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && ./setup-service.sh"

echo ✅ Service configure
echo.

echo ================================================
echo         DEPLOIEMENT AUTOMATIQUE TERMINE
echo ================================================
echo.
echo 🎉 Votre bot OpiozenMusic est maintenant installe sur votre Raspberry Pi!
echo.

if "%DISCORD_TOKEN%"=="" (
    echo ⚠️  ATTENTION: Vous devez encore configurer le token Discord:
    echo    ssh %RASPBERRY_USER%@%RASPBERRY_IP%
    echo    cd %RASPBERRY_PATH%
    echo    nano .env
    echo    Puis remplacez YOUR_BOT_TOKEN_HERE par votre token
    echo.
)

echo 🚀 Pour demarrer le bot:
echo    ssh %RASPBERRY_USER%@%RASPBERRY_IP%
echo    sudo systemctl start opiozenmusic
echo.
echo 📊 Pour voir les logs:
echo    ssh %RASPBERRY_USER%@%RASPBERRY_IP%
echo    sudo journalctl -u opiozenmusic -f
echo.
echo ================================================

pause
