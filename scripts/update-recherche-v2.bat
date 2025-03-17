@echo off
echo Fashion Finder - Installation des ameliorations de recherche v2.0
echo ===============================================================
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
if not exist "%~dp0..\backend\services" (
    echo Creation du dossier services pour le backend...
    mkdir "%~dp0..\backend\services"
)

echo [2/5] Verification que les nouveaux fichiers sont presents...
cd "%~dp0.."

set MISSING_FILES=0

if not exist "backend\services\colorDetection.js" (
    echo ERREUR: Fichier manquant: backend\services\colorDetection.js
    set MISSING_FILES=1
)

if not exist "backend\services\fashionTerms.js" (
    echo ERREUR: Fichier manquant: backend\services\fashionTerms.js
    set MISSING_FILES=1
)

if not exist "backend\services\objectColorExtractor.js" (
    echo ERREUR: Fichier manquant: backend\services\objectColorExtractor.js
    set MISSING_FILES=1
)

if not exist "backend\services\productSearch.js" (
    echo ERREUR: Fichier manquant: backend\services\productSearch.js
    set MISSING_FILES=1
)

if %MISSING_FILES% == 1 (
    echo.
    echo Des fichiers sont manquants. Veuillez re-synchroniser votre projet.
    echo Commande: git pull
    pause
    exit /b 1
)

echo [3/5] Installation des dependances du backend...
cd "%~dp0..\backend"
call npm install axios cors dotenv express multer
if %ERRORLEVEL% neq 0 (
    echo ATTENTION: Installation des dependances echouee, mais on continue.
)

echo [4/5] Redemarrage des serveurs...
echo Arret des serveurs en cours...
taskkill /im node.exe /f 2>nul

echo Attendre que les serveurs soient completement arretes...
timeout /t 3 /nobreak > nul

echo Demarrage du backend...
start cmd /k "cd %~dp0..\backend && node index.js"

echo Attendre que le backend demarre...
timeout /t 5 /nobreak > nul

echo Demarrage du frontend...
start cmd /k "cd %~dp0..\frontend && npm start"

echo [5/5] Test des API...
echo.
echo =====================================================================
echo INFORMATIONS IMPORTANTES
echo =====================================================================
echo.
echo Les ameliorations de recherche v2.0 ont ete installees avec succes!
echo.
echo Nouvelles fonctionnalites:
echo - Extraction des couleurs specifiques a l'objet principal
echo - Recherche avancee sur des sites specialises par categorie
echo - Garantie d'avoir 5 resultats pertinents avec images
echo - Nouvelle API de recherche manuelle
echo.
echo Consultez AMELIORATIONS_RECHERCHE_V2.md pour plus de details.
echo.
echo L'application va s'ouvrir dans votre navigateur...
echo.
echo Appuyez sur une touche pour continuer...
pause > nul

start http://localhost:3000

exit /b 0
