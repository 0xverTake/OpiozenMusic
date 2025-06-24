@echo off
echo ================================================
echo   OpiozenMusic - Deploiement rapide
echo ================================================
echo.

REM Configuration rapide - MODIFIEZ CETTE LIGNE
set RASPBERRY_IP=

echo 🚀 Deploiement rapide vers %RASPBERRY_IP%...
echo.

REM Envoi rapide des fichiers
echo 📤 Envoi des fichiers...
scp -r * pi@%RASPBERRY_IP%:/home/pi/OpiozenMusic/

if %errorlevel% neq 0 (
    echo ❌ Erreur d'envoi - Verifiez l'IP et la connexion SSH
    pause
    exit /b 1
)

REM Installation et demarrage
echo 🔧 Installation sur le Raspberry Pi...
ssh pi@%RASPBERRY_IP% "cd /home/pi/OpiozenMusic && chmod +x *.sh && ./install.sh"

echo.
echo ✅ Deploiement termine!
echo.
echo 📋 Prochaines etapes:
echo 1. Connectez-vous: ssh pi@%RASPBERRY_IP%
echo 2. Configurez: cd /home/pi/OpiozenMusic && nano .env
echo 3. Demarrez: ./start.sh
echo.

pause
