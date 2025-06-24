@echo off
REM Configuration personnalisee generee le 23-06-25 20:49:39,41
set RASPBERRY_IP=
set RASPBERRY_USER=trn
set RASPBERRY_PATH=/home/trn/OpiozenMusic
set DISCORD_TOKEN=

echo ================================================
echo   OpiozenMusic - Deploiement Personnalise
echo ================================================
echo.
echo Configuration:
echo - IP: %RASPBERRY_IP%
echo - Utilisateur: %RASPBERRY_USER%
echo - Repertoire: %RASPBERRY_PATH%
echo.

REM Test de connexion
echo 🔍 Test de connexion...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "echo 'Connexion OK'"
if %errorlevel% neq 0 (
    echo ❌ Erreur de connexion
    pause
    exit /b 1
)

echo ✅ Connexion etablie
echo.

REM Deploiement
echo 📤 Deploiement en cours...
ssh %RASPBERRY_USER%@%RASPBERRY_IP% "mkdir -p %RASPBERRY_PATH%"
scp -r *.py *.txt *.sh *.md *.service .gitignore %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/

if exist .env (
    scp .env %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/
) else (
    scp .env %RASPBERRY_USER%@%RASPBERRY_IP%:%RASPBERRY_PATH%/
)

REM Configuration du token si fourni
if not "%DISCORD_TOKEN%"=="" (
    ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && sed -i 's/YOUR_BOT_TOKEN_HERE/%DISCORD_TOKEN%/g' .env"
)

ssh %RASPBERRY_USER%@%RASPBERRY_IP% "cd %RASPBERRY_PATH% && chmod +x *.sh"

echo ✅ Deploiement termine
echo.
echo 📋 Commandes pour finaliser l'installation:
echo    ssh %RASPBERRY_USER%@%RASPBERRY_IP%
echo    cd %RASPBERRY_PATH%
echo    ./install.sh
echo    ./start.sh
echo.
pause
