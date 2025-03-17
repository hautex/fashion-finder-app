@echo off
echo Fashion Finder - Script d'integration du systeme de recherche ameliore
echo ==================================================================
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

if not exist "%~dp0..\frontend\src\components" (
    echo Creation du dossier components pour le frontend...
    mkdir "%~dp0..\frontend\src\components"
)

echo [2/5] Mise a jour des dependances du projet...
cd "%~dp0..\frontend"
echo Installation de react-icons si pas deja installe...
call npm install --save react-icons
if %ERRORLEVEL% neq 0 (
    echo ATTENTION: Installation des dependances echouee, mais on continue.
)

echo [3/5] Verification que les nouveaux fichiers sont presents...
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

if not exist "frontend\src\components\SearchQueryEditor.js" (
    echo ERREUR: Fichier manquant: frontend\src\components\SearchQueryEditor.js
    set MISSING_FILES=1
)

if %MISSING_FILES% == 1 (
    echo.
    echo Des fichiers sont manquants. Veuillez re-synchroniser votre projet.
    echo Commande: git pull
    pause
    exit /b 1
)

echo [4/5] Ajout de l'editeur de requete dans App.js...
echo.
echo Pour integrer completement l'editeur de requete, vous devez modifier App.js:
echo.
echo 1. Ajouter l'import au debut de App.js:
echo    import SearchQueryEditor from './components/SearchQueryEditor';
echo.
echo 2. Ajouter une fonction manuelle de recherche dans le composant App:
echo    const handleManualSearch = (query) => {
echo      setLoading(true);
echo      setError('');
echo      clearLogs();
echo      addLog('Recherche personnalisee: ' + query, 'info');
echo.      
echo      // Simuler l'analyse avec des donnees de base
echo      setTimeout(() => {
echo        searchSimilarProducts(query)
echo          .then(products => {
echo            setResults(prev => ({
echo              ...prev,
echo              searchQuery: query,
echo              similarProducts: products
echo            }));
echo            setLoading(false);
echo            addLog('Recherche personnalisee terminee', 'success');
echo          })
echo          .catch(err => {
echo            setError('Erreur lors de la recherche personnalisee');
echo            setLoading(false);
echo          });
echo      }, 500);
echo    };
echo.
echo 3. Placer le composant SearchQueryEditor avant la section des resultats:
echo    {results && (
echo      <SearchQueryEditor
echo        initialQuery={results.searchQuery}
echo        onSearch={handleManualSearch}
echo        isSearching={loading}
echo      />
echo    )}
echo.
echo Appuyez sur une touche pour continuer...
pause > nul

echo [5/5] Redemarrage du serveur avec les ameliorations...
cd "%~dp0"
call check-google-api.bat

echo.
echo Les ameliorations du systeme de recherche ont ete integrees.
echo Lisez RECHERCHE_AMELIOREE.md pour plus d'informations.
echo.

exit /b 0
