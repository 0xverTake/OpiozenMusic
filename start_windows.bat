@echo off
echo ===========================================
echo    OpiozenMusic Bot - Demarrage Windows
echo ===========================================
echo.

:: Verification de Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou pas dans le PATH
    echo Installez Python depuis https://python.org
    pause
    exit /b 1
)

:: Verification du fichier .env
if not exist ".env" (
    echo ATTENTION: Fichier .env manquant
    echo Copiez .env.example vers .env et configurez votre DISCORD_TOKEN
    if exist ".env.example" (
        echo Copie automatique de .env.example...
        copy ".env.example" ".env" >nul
        echo Editez maintenant le fichier .env avec votre token Discord
        pause
    )
    exit /b 1
)

:: Verification des dependances
echo Verification des dependances...
python -c "import discord, yt_dlp" >nul 2>&1
if errorlevel 1 (
    echo Installation des dependances manquantes...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo ERREUR: Installation des dependances echouee
        pause
        exit /b 1
    )
)

echo Dependances OK!
echo.
echo Demarrage du bot...
echo Appuyez sur Ctrl+C pour arreter le bot
echo.

:: Demarrage du bot
python music_bot.py

echo.
echo Bot arrete.
pause
