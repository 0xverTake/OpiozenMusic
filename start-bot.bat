@echo off
echo ZenBeat - Script de démarrage avec PM2

REM Vérifier si PM2 est installé
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 n'est pas installé. Installation en cours...
    call npm install -g pm2
)

REM Vérifier si le dossier logs existe
if not exist logs (
    echo Création du dossier logs...
    mkdir logs
)

REM Vérifier si les dépendances sont installées
if not exist node_modules (
    echo Installation des dépendances...
    call npm install
)

REM Vérifier si le fichier config.json existe
if not exist config.json (
    if exist config.json.example (
        echo ATTENTION: config.json n'existe pas. Veuillez copier config.json.example vers config.json et le configurer.
        echo Exemple: copy config.json.example config.json
    )
)

REM Vérifier si le fichier .env existe
if not exist .env (
    if exist .env.example (
        echo ATTENTION: .env n'existe pas. Veuillez copier .env.example vers .env et le configurer.
        echo Exemple: copy .env.example .env
    )
)

REM Démarrer le bot avec PM2
echo Démarrage du bot ZenBeat avec PM2...
call pm2 start ecosystem.config.js

REM Afficher le statut
echo Statut du bot:
call pm2 status zenbeat

echo.
echo Le bot ZenBeat est maintenant géré par PM2!
echo Pour voir les logs en temps réel: pm2 logs zenbeat
echo Pour plus d'informations, consultez le fichier PM2_GUIDE.md

pause
