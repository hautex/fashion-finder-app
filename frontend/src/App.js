import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaSearch, FaShoppingBag, FaTag, FaCheck, FaExclamationTriangle, FaInfoCircle, FaExternalLinkAlt, FaBug, FaTerminal } from 'react-icons/fa';
import { RiShirtLine } from 'react-icons/ri';
import { BiLoaderAlt } from 'react-icons/bi';
import './App.css';

// Résultats de secours pour garantir que l'application fonctionne même sans API
const fallbackResults = {
  success: true,
  analysis: {
    labels: [
      { description: "Dress", score: 0.97 },
      { description: "Clothing", score: 0.96 },
      { description: "Cocktail dress", score: 0.93 },
      { description: "Navy blue", score: 0.92 },
      { description: "Cape", score: 0.91 },
      { description: "Robe", score: 0.90 }
    ],
    colors: [
      { rgb: 'rgb(24, 32, 53)', score: 0.8, pixelFraction: 0.2 },
      { rgb: 'rgb(232, 231, 230)', score: 0.1, pixelFraction: 0.7 }
    ],
    objects: [
      { name: "Dress", confidence: 0.95 },
      { name: "Person", confidence: 0.92 }
    ],
    webEntities: [
      { description: "Cocktail dress", score: 0.92 },
      { description: "Ralph Lauren", score: 0.85 },
      { description: "Fashion", score: 0.8 }
    ]
  },
  searchQuery: "robe cape soirée bleu marine Ralph Lauren",
  similarProducts: [
    {
      title: 'Robe de cocktail à cape en georgette - Ralph Lauren',
      link: 'https://www.ralphlauren.fr/fr/robe-de-cocktail-a-cape-en-georgette-3616533815713.html',
      displayLink: 'www.ralphlauren.fr',
      image: 'https://www.ralphlauren.fr/dw/image/v2/BFQN_PRD/on/demandware.static/-/Sites-rl-products/default/dwe38c9683/images/524867/524867_3001399_pdl.jpg',
      snippet: 'Robe élégante à cape, idéale pour les événements formels et cocktails.',
      price: '€299,00'
    },
    {
      title: 'Robe de Cocktail Cape - Bleu Marine',
      link: 'https://fr.shein.com/Cape-Sleeve-Belted-Navy-Pencil-Dress-p-10351290-cat-1727.html',
      displayLink: 'fr.shein.com',
      image: 'https://img.ltwebstatic.com/images3_pi/2022/12/29/1672297837a31ec85513e2397c9eb0e6c21e3c86a2_thumbnail_600x.jpg',
      snippet: 'Robe fourreau élégante avec cape et ceinture, parfaite pour les occasions spéciales.',
      price: '€22,00'
    },
    {
      title: 'Robe Élégante Midi avec Cape - Collection Soirée',
      link: 'https://www.asos.com/fr/asos-design/asos-design-robe-mi-longue-avec-cape-en-crepe/prd/203080653',
      displayLink: 'www.asos.com',
      image: 'https://images.asos-media.com/products/asos-design-robe-mi-longue-avec-cape-en-crepe/203080653-1-navy',
      snippet: 'Robe midi élégante avec cape intégrée, coupe fluide et ceinture fine.',
      price: '€69,99'
    },
    {
      title: 'Robe Cape Chic - Bleu Nuit',
      link: 'https://www2.hm.com/fr_fr/productpage.1115237001.html',
      displayLink: 'www2.hm.com',
      image: 'https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F15%2F55%2F15551f6f6719e23707eea5dd232d8333adb2318b.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BLOOKBOOK%5D%2Cres%5Bm%5D%2Chmver%5B1%5D&call=url[file:/product/main]',
      snippet: 'Robe élégante avec effet cape, silhouette structurée et coupe mi-longue.',
      price: '€49,99'
    },
    {
      title: 'Cape-Effect Midi Dress - Navy Blue',
      link: 'https://www.zara.com/fr/fr/robe-mi-longue-effet-cape-p02731168.html',
      displayLink: 'www.zara.com',
      image: 'https://static.zara.net/photos///2023/I/0/1/p/2731/168/401/2/w/563/2731168401_1_1_1.jpg?ts=1693305323400',
      snippet: 'Robe mi-longue avec effet cape élégant, en tissu fluide et coupe structurée.',
      price: '€59,95'
    }
  ]
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ checking: false, vision: null, search: null });
  const [tips, setTips] = useState([]);
  const [logs, setLogs] = useState([]);
  const fileInputRef = useRef(null);
  const logsEndRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  const [showLogs, setShowLogs] = useState(true);

  // Fonction pour ajouter des logs
  const addLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type // info, success, error, warning
    };
    setLogs(prevLogs => [...prevLogs, logEntry]);
  };

  // Fonction pour effacer les logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Scroll vers le bas des logs quand ils sont mis à jour
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Vérifier l'état des APIs au chargement
  useEffect(() => {
    addLog('Application démarrée');
    checkApiStatus();
    
    // Conseils pour l'utilisateur
    const allTips = [
      "Choisissez une image où le vêtement est bien visible et occupe la majorité de l'image.",
      "Les photos avec un fond simple fonctionnent mieux pour l'analyse.",
      "Évitez les images avec plusieurs vêtements ou personnes pour de meilleurs résultats.",
      "Les images bien éclairées et nettes donnent de meilleurs résultats.",
      "Si vous rencontrez des erreurs, activez le mode démonstration pour voir comment l'application devrait fonctionner."
    ];
    
    // Sélectionner 3 conseils aléatoires
    const selectedTips = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * allTips.length);
      selectedTips.push(allTips[randomIndex]);
      allTips.splice(randomIndex, 1);
    }
    
    setTips(selectedTips);
  }, []);

  const checkApiStatus = async () => {
    setApiStatus(prev => ({ ...prev, checking: true }));
    addLog('Vérification de la connexion au serveur...', 'info');
    
    try {
      const response = await fetch('http://localhost:5000/api/test');
      
      if (response.ok) {
        addLog('Serveur backend connecté avec succès', 'success');
        setApiStatus({
          checking: false,
          vision: { available: true, message: 'API Google Vision disponible' },
          search: { available: true, message: 'API Google Custom Search disponible' }
        });
      } else {
        addLog('Impossible de se connecter au serveur - Erreur ' + response.status, 'error');
        setUseFallback(true);
        setApiStatus({
          checking: false,
          vision: { available: false, message: 'Serveur indisponible' },
          search: { available: false, message: 'Serveur indisponible' }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des APIs:', error);
      addLog('Erreur de connexion: ' + error.message, 'error');
      setUseFallback(true);
      setApiStatus({
        checking: false,
        vision: { available: false, message: 'Serveur indisponible' },
        search: { available: false, message: 'Serveur indisponible' }
      });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      addLog(`Image sélectionnée: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
      
      // Créer une URL pour la prévisualisation
      setPreviewUrl(URL.createObjectURL(file));
      // Réinitialiser les résultats précédents
      setResults(null);
      setError('');
      setDetailedError(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      addLog(`Image déposée: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError('');
      setDetailedError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner une image à analyser.');
      addLog('Erreur: Aucune image sélectionnée', 'error');
      return;
    }

    setLoading(true);
    setError('');
    setDetailedError(null);
    clearLogs();
    addLog('Début de l\'analyse de l\'image...', 'info');

    // Si on utilise la version de secours, ne pas faire d'appel API
    if (useFallback) {
      addLog('Mode démonstration activé: utilisation des données prédéfinies', 'warning');
      
      // Simulation des étapes d'analyse pour montrer comment ça fonctionne
      setTimeout(() => { addLog('Préparation de l\'image...', 'info'); }, 300);
      setTimeout(() => { addLog('Détection du vêtement: Robe de cocktail trouvée', 'success'); }, 800);
      setTimeout(() => { addLog('Analyse des couleurs: bleu marine dominant', 'success'); }, 1300);
      setTimeout(() => { addLog('Détection des caractéristiques: cape, élégant', 'success'); }, 1800);
      setTimeout(() => { addLog('Construction de la requête de recherche: "robe cape soirée bleu marine Ralph Lauren"', 'info'); }, 2300);
      setTimeout(() => { addLog('Recherche de produits similaires...', 'info'); }, 2800);
      setTimeout(() => { addLog('5 produits similaires trouvés', 'success'); }, 3500);
      setTimeout(() => { 
        setResults(fallbackResults);
        setLoading(false);
        addLog('Analyse terminée avec succès', 'success');
      }, 4000);
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    addLog('Image préparée pour l\'envoi au serveur', 'info');

    try {
      addLog('Envoi de l\'image au serveur backend...', 'info');
      
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      addLog(`Réponse reçue du serveur: statut ${response.status}`, response.ok ? 'success' : 'error');
      
      let data;
      let responseText;
      
      try {
        // Essayer d'obtenir le texte brut de la réponse d'abord
        responseText = await response.text();
        addLog('Réponse reçue', 'info');
        
        // Puis essayer de parser en JSON
        try {
          data = JSON.parse(responseText);
          addLog('Données parsées avec succès', 'success');
          
          // Afficher les étapes d'analyse
          if (data.analysis) {
            if (data.analysis.labels && data.analysis.labels.length) {
              addLog(`Détection: ${data.analysis.labels.map(l => l.description).join(', ')}`, 'success');
            }
            
            if (data.analysis.colors && data.analysis.colors.length) {
              addLog(`Couleurs identifiées: ${data.analysis.colors.length} couleurs dominantes`, 'success');
            }
            
            if (data.analysis.objects && data.analysis.objects.length) {
              addLog(`Objets détectés: ${data.analysis.objects.map(o => o.name).join(', ')}`, 'success');
            }
          }
          
          if (data.searchQuery) {
            addLog(`Requête de recherche: "${data.searchQuery}"`, 'info');
          }
          
          if (data.similarProducts) {
            addLog(`${data.similarProducts.length} produits similaires trouvés`, data.similarProducts.length > 0 ? 'success' : 'warning');
          }
          
        } catch (parseError) {
          // Si le parsing échoue, stocker le texte brut comme erreur détaillée
          addLog('Erreur: Impossible de parser la réponse JSON', 'error');
          addLog(`Erreur détaillée: ${parseError.message}`, 'error');
          
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            responseText: responseText,
            parseError: parseError.toString()
          };
          
          setDetailedError(errorDetails);
          setError(`Erreur de parsing de la réponse. Voir les détails ci-dessous.`);
          throw new Error('Erreur de parsing JSON: ' + parseError.message);
        }
      } catch (textError) {
        // Si l'extraction du texte échoue
        addLog('Erreur: Impossible de lire la réponse', 'error');
        
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          error: textError.toString()
        };
        
        setDetailedError(errorDetails);
        setError(`Erreur lors de la lecture de la réponse: ${textError.message}`);
        throw new Error('Erreur lors de la lecture de la réponse: ' + textError.message);
      }

      if (!data || !data.success) {
        addLog('Erreur: Données invalides ou erreur signalée par le serveur', 'error');
        
        const errorDetails = {
          status: response.status,
          data: data,
          info: 'La réponse ne contient pas de données valides ou success=false'
        };
        
        setDetailedError(errorDetails);
        setError('Les données reçues sont invalides ou indiquent une erreur.');
        console.warn('Données invalides reçues, utilisation du fallback');
        
        addLog('Utilisation des résultats de secours', 'warning');
        setResults(fallbackResults);
      } else {
        addLog('Analyse complétée avec succès', 'success');
        setResults(data);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      addLog(`Erreur critique: ${error.message}`, 'error');
      
      // Stocker tous les détails de l'erreur
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        info: 'Erreur pendant l\'envoi de la requête au serveur'
      };
      
      setDetailedError(errorDetails);
      setError(`Une erreur de communication est survenue: ${error.message}`);
      
      // En cas d'erreur frontale, utiliser les résultats de secours
      addLog('Utilisation des résultats de secours après erreur', 'warning');
      setResults(fallbackResults);
    } finally {
      setLoading(false);
      addLog('Processus d\'analyse terminé', 'info');
    }
  };

  // Fonction pour basculer en mode fallback
  const toggleFallbackMode = () => {
    setUseFallback(!useFallback);
    setDetailedError(null);
    setError('');
    addLog(useFallback 
      ? 'Passage en mode analyse réelle' 
      : 'Passage en mode démonstration', 'info');
  };

  // Fonction utilitaire pour corriger les liens manquants
  const fixImageUrl = (url) => {
    if (!url || url === '') {
      return 'https://via.placeholder.com/300x150?text=Image+non+disponible';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return 'https://' + url;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RiShirtLine className="text-2xl" />
            <h1 className="text-2xl font-bold">Fashion Finder</h1>
          </div>
          <div className="text-sm hidden sm:block">
            <button 
              onClick={toggleFallbackMode} 
              className={`px-4 py-2 rounded-lg font-medium ${useFallback 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-blue-700 text-white hover:bg-blue-800'}`}
            >
              {useFallback ? '🔄 Mode démonstration actif' : '🔍 Mode analyse réelle'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Bannière mode démonstration */}
        {useFallback && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Mode démonstration activé</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Dans ce mode, l'application affichera toujours les mêmes résultats prédéfinis, quelle que soit l'image téléchargée.
                    Ceci permet de voir comment l'application fonctionne sans dépendre des APIs Google.
                  </p>
                  <p className="mt-1">
                    <button
                      onClick={toggleFallbackMode}
                      className="font-medium text-yellow-800 hover:text-yellow-900 underline"
                    >
                      Cliquez ici pour passer en mode d'analyse réelle
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conseils pour de meilleurs résultats */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-md font-medium text-blue-800 mb-2">Conseils pour de meilleurs résultats :</h3>
          <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Statut des APIs */}
        <div className="mb-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">
              État des services
            </h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Google Vision API:</span>
              <div className="flex items-center">
                {apiStatus.checking ? (
                  <BiLoaderAlt className="animate-spin text-blue-500 mr-2" />
                ) : apiStatus.vision?.available ? (
                  <FaCheck className="text-green-500 mr-2" />
                ) : (
                  <FaExclamationTriangle className="text-yellow-500 mr-2" />
                )}
                <span className={`text-sm ${apiStatus.vision?.available ? 'text-green-600' : 'text-yellow-600'}`}>
                  {apiStatus.checking ? 'Vérification...' : apiStatus.vision?.message || 'Non vérifié'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Google Custom Search:</span>
              <div className="flex items-center">
                {apiStatus.checking ? (
                  <BiLoaderAlt className="animate-spin text-blue-500 mr-2" />
                ) : apiStatus.search?.available ? (
                  <FaCheck className="text-green-500 mr-2" />
                ) : (
                  <FaExclamationTriangle className="text-yellow-500 mr-2" />
                )}
                <span className={`text-sm ${apiStatus.search?.available ? 'text-green-600' : 'text-yellow-600'}`}>
                  {apiStatus.checking ? 'Vérification...' : apiStatus.search?.message || 'Non vérifié'}
                </span>
              </div>
            </div>
            {!apiStatus.vision?.available && !apiStatus.checking && (
              <div className="mt-3 text-sm text-gray-500">
                <p className="flex items-center">
                  <FaInfoCircle className="mr-1 text-blue-500" />
                  Les APIs ne sont pas accessibles, mais vous pouvez utiliser le mode démonstration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section de téléchargement d'image */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">
              Télécharger une image
            </h2>
          </div>
          <div className="p-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <FaUpload className="text-blue-500 text-3xl mb-2" />
              <p className="mb-2 text-sm text-gray-700">
                Glissez-déposez une image ici ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF • Max 10 MB
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu de l'image:</p>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Aperçu" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <BiLoaderAlt className="animate-spin -ml-1 mr-2" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <FaSearch className="-ml-1 mr-2" />
                        Analyser l'image
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Journal d'activité (logs) */}
        {logs.length > 0 && showLogs && (
          <div className="mb-6 bg-white rounded-lg shadow">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <FaTerminal className="mr-2" />
                Journal d'activité
              </h2>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  onClick={clearLogs}
                >
                  Effacer
                </button>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  onClick={() => setShowLogs(false)}
                >
                  Masquer
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-900 text-white font-mono text-sm max-h-40 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className={
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }>
                    {log.type.toUpperCase()}
                  </span>:{' '}
                  <span>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaBug className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Une erreur est survenue</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                {detailedError && (
                  <div className="mt-2">
                    <details className="text-xs text-red-800">
                      <summary className="cursor-pointer hover:underline">Détails techniques</summary>
                      <pre className="mt-2 p-2 bg-red-100 overflow-x-auto">
                        {JSON.stringify(detailedError, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Résultats d'analyse */}
        {results && (
          <div className="mb-6 bg-white rounded-lg shadow">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-700">
                Analyse de l'image
              </h2>
            </div>
            <div className="p-4 divide-y divide-gray-200">
              <div className="py-3">
                <h3 className="font-medium text-gray-800 mb-2">Caractéristiques détectées:</h3>
                <div className="flex flex-wrap gap-2">
                  {results.analysis.labels.map((label, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      title={`Confiance: ${Math.round(label.score * 100)}%`}
                    >
                      {label.description}
                    </span>
                  ))}
                </div>
              </div>
              <div className="py-3">
                <h3 className="font-medium text-gray-800 mb-2">Couleurs dominantes:</h3>
                <div className="flex gap-2">
                  {results.analysis.colors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-10 h-10 rounded-full border border-gray-300" 
                        style={{ backgroundColor: color.rgb }}
                        title={`${color.rgb} - ${Math.round(color.score * 100)}%`}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">
                        {Math.round(color.pixelFraction * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="py-3">
                <h3 className="font-medium text-gray-800 mb-2">Requête de recherche:</h3>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                  {results.searchQuery}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Produits similaires */}
        {results && results.similarProducts && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <FaShoppingBag className="mr-2" />
                Produits similaires ({results.similarProducts.length})
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.similarProducts.map((product, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={fixImageUrl(product.image)} 
                        alt={product.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x150?text=Image+non+disponible';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {product.displayLink}
                      </p>
                      {product.price && (
                        <p className="text-green-600 font-bold mb-2">{product.price}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.snippet}
                      </p>
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Voir le produit <FaExternalLinkAlt className="ml-1" size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-6 mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Fashion Finder utilise les APIs Google Vision et Custom Search pour trouver des vêtements similaires à partir d'images.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
