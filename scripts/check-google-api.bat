@echo off
echo Verification des APIs Google
echo ===========================
echo.

echo Recuperation des informations sur l'API Google Vision...
curl -s "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ" -d "{}" > nul

if %ERRORLEVEL% equ 0 (
    echo [OK] L'API Google Vision est accessible.
) else (
    echo [ERREUR] L'API Google Vision semble inaccessible.
    echo Veuillez verifier que l'API est activee dans la Google Cloud Console:
    echo https://console.cloud.google.com/apis/library/vision.googleapis.com
)

echo.
echo Recuperation des informations sur l'API Google Custom Search...
curl -s "https://www.googleapis.com/customsearch/v1?key=AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ&cx=233b9e048806d4add&q=test" > nul

if %ERRORLEVEL% equ 0 (
    echo [OK] L'API Google Custom Search est accessible.
) else (
    echo [ERREUR] L'API Google Custom Search semble inaccessible.
    echo Veuillez verifier que l'API est activee dans la Google Cloud Console:
    echo https://console.cloud.google.com/apis/library/customsearch.googleapis.com
)

echo.
echo Pour activer les APIs Google:
echo 1. Rendez-vous sur https://console.cloud.google.com/
echo 2. Selectionnez votre projet ou creez-en un nouveau
echo 3. Accedez a "APIs et services" &gt; "Bibliotheque"
echo 4. Recherchez "Vision API" et "Custom Search API"
echo 5. Activez ces deux APIs
echo.
echo Appuyez sur une touche pour continuer...
pause > nul
