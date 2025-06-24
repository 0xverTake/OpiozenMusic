@echo off
REM Script de compatibilité pour lancer le gestionnaire Python
echo 🚀 Lancement du Gestionnaire OpiozenMusic...
python start.py %*
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erreur lors du lancement
    echo Assurez-vous que Python est installe
    pause
)
