@echo off
echo Fashion Finder - Script de demarrage
echo =====================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js n'est pas installe ou n'est pas dans le PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Installation des dependances du backend...
cd "%~dp0..\backend"
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: L'installation des dependances du backend a echoue.
    pause
    exit /b 1
)

echo [2/6] Installation des dependances du frontend...
cd "%~dp0..\frontend"
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: L'installation des dependances du frontend a echoue.
    pause
    exit /b 1
)

echo [3/6] Installation des plugins Tailwind CSS...
call npm install --save @tailwindcss/aspect-ratio @tailwindcss/line-clamp
if %ERRORLEVEL% neq 0 (
    echo ATTENTION: L'installation des plugins Tailwind a echoue, mais l'application peut fonctionner sans.
)

echo [4/6] Demarrage du serveur backend...
start cmd /k "cd %~dp0..\backend && npm start"

echo Patientez 5 secondes pour laisser le backend demarrer...
timeout /t 5 /nobreak >nul

echo [5/6] Verification des APIs Google...
echo.
echo =====================================
echo IMPORTANT: Même si les APIs ne sont pas disponibles, l'application fonctionnera 
echo avec des résultats pré-définis pour vous permettre de la tester.
echo =====================================
echo.
curl -s "http://localhost:5000/api/check-apis" > nul

echo [6/6] Demarrage de l'application frontend...
start cmd /k "cd %~dp0..\frontend && npm start"

echo.
echo L'application est en cours de demarrage!
echo Le frontend sera accessible a l'adresse: http://localhost:3000
echo Le backend est accessible a l'adresse: http://localhost:5000
echo.
echo Appuyez sur une touche pour ouvrir l'application dans votre navigateur...
pause >nul

start http://localhost:3000

echo Vous pouvez fermer cette fenetre. Pour arreter l'application, fermez les fenetres de terminal du backend et du frontend.
exit /b 0
