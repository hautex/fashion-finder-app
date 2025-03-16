@echo off
echo Verification des APIs Google
echo ===========================
echo.

echo [1/3] Test de connexion au serveur backend...
curl -s "http://localhost:5000/api/test" > temp_response.json 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Le serveur backend n'est pas accessible.
    echo Veuillez demarrer le serveur avec la commande :
    echo    cd backend ^&^& npm start
    goto cleanup
)

echo    [OK] Le serveur backend est accessible.
echo.

echo [2/3] Verification de l'API Google Vision...
curl -s "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ" -d "{}" > temp_vision.json 2>nul

if %ERRORLEVEL% equ 0 (
    echo    [OK] L'API Google Vision est accessible.
) else (
    echo    [ERREUR] L'API Google Vision semble inaccessible.
    echo    Veuillez verifier que :
    echo      1. L'API est activee dans la Google Cloud Console:
    echo         https://console.cloud.google.com/apis/library/vision.googleapis.com
    echo      2. La cle API est valide et sans restrictions
    echo      3. Vous avez une connexion internet active
)

echo.
echo [3/3] Verification de l'API Google Custom Search...
curl -s "https://www.googleapis.com/customsearch/v1?key=AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ&cx=233b9e048806d4add&q=test" > temp_search.json 2>nul

if %ERRORLEVEL% equ 0 (
    echo    [OK] L'API Google Custom Search est accessible.
) else (
    echo    [ERREUR] L'API Google Custom Search semble inaccessible.
    echo    Veuillez verifier que :
    echo      1. L'API est activee dans la Google Cloud Console:
    echo         https://console.cloud.google.com/apis/library/customsearch.googleapis.com
    echo      2. Le moteur de recherche personnalise (CX) est correctement configure
    echo      3. La cle API est valide et sans restrictions
)

echo.
echo ----------------------------------------
echo Guide pour activer les APIs Google:
echo ----------------------------------------
echo 1. Accedez a https://console.cloud.google.com/
echo 2. Creez un projet s'il n'en existe pas deja un
echo 3. Dans le menu lateral, allez a "APIs et services" ^> "Bibliotheque"
echo 4. Recherchez et activez les APIs suivantes:
echo    - "Cloud Vision API"
echo    - "Custom Search API"
echo 5. Creez une cle API: "APIs et services" ^> "Identifiants" ^> "Creer des identifiants" ^> "Cle API"
echo 6. Pour le moteur de recherche personnalise:
echo    - Allez sur https://programmablesearchengine.google.com/
echo    - Creez un nouveau moteur de recherche
echo    - Configurez-le pour chercher sur le web
echo    - Notez l'ID du moteur (CX)
echo.
echo Appuyez sur une touche pour lancer le script de demarrage...
pause > nul

echo Lancement de l'application...
call "%~dp0start-app.bat"

:cleanup
if exist temp_response.json del temp_response.json
if exist temp_vision.json del temp_vision.json
if exist temp_search.json del temp_search.json
