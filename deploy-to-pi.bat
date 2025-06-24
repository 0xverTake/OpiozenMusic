@echo off
echo ================================================
echo   OpiozenMusic - Deploiement vers Raspberry Pi
echo ================================================
echo.

REM Configuration - MODIFIEZ CES VALEURS
set RASPBERRY_IP=
set RASPBERRY_USER=pi
set RASPBERRY_PATH=/home/pi/OpiozenMusic
set SSH_KEY_PATH=

REM Affichage de la configuration
echo Configuration:
echo - IP Raspberry Pi: %RASPBERRY_IP%
echo - Utilisateur: %RASPBERRY_USER%
echo - Repertoire cible: %RASPBERRY_PATH%
echo.

REM Verification de la connection SSH
echo 🔍 Test de connexion SSH...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "echo 'Connexion SSH OK'"
if %errorlevel% neq 0 (
    echo ❌ Erreur de connexion SSH
    echo Verifiez:
    echo - L'adresse IP du Raspberry Pi
    echo - Les identifiants SSH
    echo - Que le SSH est active sur le Pi
    pause
    exit /b 1
)

echo ✅ Connexion SSH etablie
echo.

REM Creation du repertoire sur le Pi
echo 📁 Creation du repertoire sur le Raspberry Pi...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "mkdir -p %RASPBERRY_PATH%"

REM Envoi des fichiers
echo 📤 Envoi des fichiers...
scp -r *.py *.txt *.sh *.md *.env.example *.service .gitignore %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'envoi des fichiers
    pause
    exit /b 1
)

echo ✅ Fichiers envoyes avec succes
echo.

REM Copie du fichier .env si il existe
if exist .env (
    echo 🔧 Envoi de la configuration .env...
    scp .env %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/
    echo ✅ Configuration .env envoyee
) else (
    echo ⚠️  Fichier .env non trouve - vous devrez le configurer sur le Pi
)

echo.

REM Rendre les scripts executables
echo 🔧 Configuration des permissions...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && chmod +x *.sh"

echo ✅ Permissions configurees
echo.

REM Affichage des prochaines etapes
echo ================================================
echo               DEPLOIEMENT TERMINE
echo ================================================
echo.
echo 📋 Prochaines etapes sur votre Raspberry Pi:
echo.
echo 1. Connectez-vous en SSH:
echo    ssh %RASPBERRY_USER%@%RASPBERRY_IP%
echo.
echo 2. Allez dans le repertoire:
echo    cd %RASPBERRY_PATH%
echo.
echo 3. Configurez votre token Discord dans .env:
echo    nano .env
echo.
echo 4. Executez l'installation:
echo    ./install.sh
echo.
echo 5. Demarrez le bot:
echo    ./start.sh
echo.
echo 📝 Pour configurer en service systeme:
echo    ./setup-service.sh
echo.
echo ================================================

pause
