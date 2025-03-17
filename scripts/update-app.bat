@echo off
echo Fashion Finder - Script d'integration des nouvelles fonctionnalites
echo ============================================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js n'est pas installe ou n'est pas dans le PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Verification des dossiers...
if not exist "%~dp0..\frontend\src\components" (
    echo Creation du dossier components...
    mkdir "%~dp0..\frontend\src\components"
)

if not exist "%~dp0..\backend\services" (
    echo Creation du dossier services...
    mkdir "%~dp0..\backend\services"
)

echo [2/5] Installation des dependances pour les nouvelles fonctionnalites...
cd "%~dp0..\frontend"
echo Installation de react-icons...
call npm install --save react-icons
if %ERRORLEVEL% neq 0 (
    echo ATTENTION: Installation de react-icons echouee, certaines fonctionnalites pourraient ne pas fonctionner correctement.
)

echo [3/5] Mise a jour du fichier App.js...
echo Ce script n'effectue pas la modification automatique de App.js.
echo Veuillez suivre les instructions dans NOUVEAUTES.md pour integrer manuellement les composants.
echo.
echo Instructions rapides:
echo 1. Importer les nouveaux composants au debut du fichier App.js
echo 2. Ajouter les etats et gestionnaires d'evenements necessaires
echo 3. Integrer les composants dans la section des resultats
echo.
echo Pour plus de details, consultez le fichier NOUVEAUTES.md

echo [4/5] Verification des API Google...
cd "%~dp0"
call check-google-api.bat

echo [5/5] Integration terminee!
echo.
echo Nouveaux composants ajoutes:
echo - Systeme de favoris et historique des recherches
echo - Filtrage avance des resultats
echo - Comparaison de produits
echo - Detection amelioree des couleurs
echo.
echo Consultez le fichier NOUVEAUTES.md pour des instructions detaillees.
echo.

echo Voulez-vous demarrer l'application maintenant? (O/N)
choice /c ON /n /m "Votre choix: "
if %ERRORLEVEL% equ 1 (
    call start-app.bat
) else (
    echo.
    echo Pour demarrer l'application plus tard, executez:
    echo scripts\start-app.bat
)

exit /b 0
