@echo off
echo ================================================
echo   Configuration initiale pour Raspberry Pi
echo ================================================
echo.

echo Ce script va vous aider a configurer la connexion
echo avec votre Raspberry Pi pour le deploiement.
echo.

REM Demande des informations de connexion
set /p RASPBERRY_IP="Entrez l'adresse IP de votre Raspberry Pi (ex: 192.168.1.100): "
set /p RASPBERRY_USER="Entrez le nom d'utilisateur (par defaut 'pi'): "
if "%RASPBERRY_USER%"=="" set RASPBERRY_USER=pi

set /p RASPBERRY_PATH="Entrez le chemin d'installation (par defaut '/home/pi/OpiozenMusic'): "
if "%RASPBERRY_PATH%"=="" set RASPBERRY_PATH=/home/pi/OpiozenMusic

set /p DISCORD_TOKEN="Entrez votre token Discord (optionnel, laissez vide pour configurer plus tard): "

echo.
echo 📝 Creation du fichier de configuration personnalise...

REM Creation d'un script personnalise
(
echo @echo off
echo REM Configuration personnalisee generee le %date% %time%
echo set RASPBERRY_IP=%RASPBERRY_IP%
echo set RASPBERRY_USER=%RASPBERRY_USER%
echo set RASPBERRY_PATH=%RASPBERRY_PATH%
echo set DISCORD_TOKEN=%DISCORD_TOKEN%
echo.
echo echo ================================================
echo echo   OpiozenMusic - Deploiement Personnalise
echo echo ================================================
echo echo.
echo echo Configuration:
echo echo - IP: %%RASPBERRY_IP%%
echo echo - Utilisateur: %%RASPBERRY_USER%%
echo echo - Repertoire: %%RASPBERRY_PATH%%
echo echo.
echo.
echo REM Test de connexion
echo echo 🔍 Test de connexion...
echo ssh %%RASPBERRY_USER%%@%%RASPBERRY_IP%% "echo 'Connexion OK'"
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Erreur de connexion
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo ✅ Connexion etablie
echo echo.
echo.
echo REM Deploiement
echo echo 📤 Deploiement en cours...
echo ssh %%RASPBERRY_USER%%@%%RASPBERRY_IP%% "mkdir -p %%RASPBERRY_PATH%%"
echo scp -r *.py *.txt *.sh *.md *.service .gitignore %%RASPBERRY_USER%%@%%RASPBERRY_IP%%:%%RASPBERRY_PATH%%/
echo.
echo if exist .env ^(
echo     scp .env %%RASPBERRY_USER%%@%%RASPBERRY_IP%%:%%RASPBERRY_PATH%%/
echo ^) else ^(
echo     scp .env %%RASPBERRY_USER%%@%%RASPBERRY_IP%%:%%RASPBERRY_PATH%%/
echo ^)
echo.
echo REM Configuration du token si fourni
echo if not "%%DISCORD_TOKEN%%"=="" ^(
echo     ssh %%RASPBERRY_USER%%@%%RASPBERRY_IP%% "cd %%RASPBERRY_PATH%% && sed -i 's/YOUR_BOT_TOKEN_HERE/%%DISCORD_TOKEN%%/g' .env"
echo ^)
echo.
echo ssh %%RASPBERRY_USER%%@%%RASPBERRY_IP%% "cd %%RASPBERRY_PATH%% && chmod +x *.sh"
echo.
echo echo ✅ Deploiement termine
echo echo.
echo echo 📋 Commandes pour finaliser l'installation:
echo echo    ssh %%RASPBERRY_USER%%@%%RASPBERRY_IP%%
echo echo    cd %%RASPBERRY_PATH%%
echo echo    ./install.sh
echo echo    ./start.sh
echo echo.
echo pause
) > deploy-custom.bat

echo ✅ Script personnalise cree: deploy-custom.bat
echo.

REM Test de connexion SSH
echo 🔍 Test de connexion avec votre Raspberry Pi...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "echo 'Test de connexion reussi'"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Impossible de se connecter au Raspberry Pi
    echo.
    echo 🔧 Verifications necessaires:
    echo - Le SSH est-il active sur votre Raspberry Pi?
    echo   sudo systemctl enable ssh
    echo   sudo systemctl start ssh
    echo.
    echo - L'adresse IP est-elle correcte?
    echo   Sur le Pi: hostname -I
    echo.
    echo - Avez-vous configure l'authentification SSH?
    echo   Mot de passe ou cle SSH
    echo.
    echo - Le pare-feu bloque-t-il la connexion?
    echo.
    pause
    exit /b 1
)

echo ✅ Connexion SSH etablie avec succes!
echo.

echo ================================================
echo           CONFIGURATION TERMINEE
echo ================================================
echo.
echo 🚀 Vous pouvez maintenant utiliser:
echo    deploy-custom.bat    - Votre script personnalise
echo    deploy-to-pi.bat     - Script de base
echo    deploy-auto.bat      - Deploiement automatique
echo.
echo 💡 Conseil: Utilisez deploy-custom.bat pour vos futurs deploiements
echo.

pause
