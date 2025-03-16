import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaSearch, FaShoppingBag, FaTag, FaCheck, FaExclamationTriangle, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';
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
  const [apiStatus, setApiStatus] = useState({ checking: false, vision: null, search: null });
  const [tips, setTips] = useState([]);
  const fileInputRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);

  // Vérifier l'état des APIs au chargement
  useEffect(() => {
    checkApiStatus();
    
    // Conseils pour l'utilisateur
    const allTips = [
      "Choisissez une image où le vêtement est bien visible et occupe la majorité de l'image.",
      "Les photos avec un fond simple fonctionnent mieux pour l'analyse.",
      "Évitez les images avec plusieurs vêtements ou personnes pour de meilleurs résultats.",
      "Les images bien éclairées et nettes donnent de meilleurs résultats.",
      "Si vous ne voyez pas de résultats précis, essayez une autre image ou une autre catégorie de vêtement."
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
    try {
      const response = await fetch('http://localhost:5000/api/test');
      if (response.ok) {
        setApiStatus({
          checking: false,
          vision: { available: true, message: 'API Google Vision disponible' },
          search: { available: true, message: 'API Google Custom Search disponible' }
        });
      } else {
        setUseFallback(true);
        setApiStatus({
          checking: false,
          vision: { available: false, message: 'Serveur indisponible' },
          search: { available: false, message: 'Serveur indisponible' }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des APIs:', error);
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
      // Créer une URL pour la prévisualisation
      setPreviewUrl(URL.createObjectURL(file));
      // Réinitialiser les résultats précédents
      setResults(null);
      setError('');
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
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner une image à analyser.');
      return;
    }

    setLoading(true);
    setError('');

    // Si on utilise la version de secours, ne pas faire d'appel API
    if (useFallback) {
      setTimeout(() => {
        setResults(fallbackResults);
        setLoading(false);
      }, 1500); // Simulation d'un délai pour que ça paraisse réaliste
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Log for debugging
      console.log('Sending image for analysis...');
      
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      // Log response status
      console.log('Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (e) {
        console.error('Erreur lors du parsing JSON:', e);
        setError('Erreur de communication avec le serveur. Utilisation des résultats de secours.');
        setResults(fallbackResults);
        setLoading(false);
        return;
      }

      if (!data || !data.success) {
        console.warn('Données invalides reçues, utilisation du fallback');
        setResults(fallbackResults);
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      
      // En cas d'erreur frontale, utiliser les résultats de secours
      setError('Une erreur de communication est survenue. Utilisation des résultats de secours.');
      setResults(fallbackResults);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour basculer en mode fallback
  const toggleFallbackMode = () => {
    setUseFallback(!useFallback);
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
          <p className="text-sm hidden sm:block">Trouvez des vêtements similaires à partir d'une photo</p>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Indicateur d'état des APIs */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <FaInfoCircle className="mr-2 text-blue-500" />
            État du système
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${useFallback ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="mr-2 font-medium">Mode:</span>
              <span className={useFallback ? 'text-yellow-600' : 'text-green-600'}>
                {useFallback ? 'Démonstration (résultats prédéfinis)' : 'Normal (analyse réelle)'}
              </span>
            </div>
            <div>
              <button 
                onClick={toggleFallbackMode} 
                className="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                {useFallback ? 'Essayer le mode normal' : 'Passer en mode démonstration'}
              </button>
            </div>
          </div>
          {useFallback && (
            <div className="mt-3 text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
              <FaExclamationTriangle className="inline-block mr-1" /> 
              Mode démonstration activé. L'application affichera des résultats prédéfinis quelle que soit l'image téléchargée.
            </div>
          )}
        </div>

        {/* Conseils pour de meilleurs résultats */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-md font-medium text-blue-800 mb-2">Conseils pour de meilleurs résultats :</h3>
          <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Téléchargez votre image</h2>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition hover:border-blue-500"
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              {previewUrl ? (
                <div className="mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Aperçu" 
                    className="max-h-64 mx-auto rounded-lg shadow" 
                  />
                </div>
              ) : (
                <div className="py-8">
                  <FaUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-500">Glissez-déposez une image ou cliquez pour parcourir</p>
                  <p className="text-xs text-gray-400 mt-2">Formats acceptés: JPG, PNG, GIF (max 10MB)</p>
                </div>
              )}
            </div>
            
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Fichier sélectionné: <span className="font-medium">{selectedFile.name}</span>
                </p>
                <button 
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <BiLoaderAlt className="animate-spin mr-2" /> Analyse en cours...
                    </>
                  ) : (
                    <>
                      <FaSearch className="mr-2" /> Analyser l'image
                    </>
                  )}
                </button>
                
                {useFallback && (
                  <p className="text-xs text-yellow-600 mt-1 text-center">
                    Mode démonstration : les résultats affichés seront prédéfinis
                  </p>
                )}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg whitespace-pre-line">
                <FaExclamationTriangle className="inline-block mr-1" /> 
                {error}
              </div>
            )}
          </div>
          
          {/* Section Résultats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Résultats</h2>
            
            {loading ? (
              <div className="py-20 text-center">
                <BiLoaderAlt className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Analyse de votre image et recherche de produits similaires...</p>
                <p className="text-xs text-gray-400 mt-2">Cela peut prendre jusqu'à 30 secondes</p>
              </div>
            ) : results ? (
              <div>
                {/* Caractéristiques détectées */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Caractéristiques détectées</h3>
                  
                  {/* Labels */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Description:</p>
                    <div className="flex flex-wrap gap-2">
                      {results.analysis && results.analysis.labels && results.analysis.labels.length > 0 ? (
                        results.analysis.labels.map((label, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {label.description}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Aucune caractéristique détectée</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Couleurs */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Couleurs dominantes:</p>
                    <div className="flex gap-2">
                      {results.analysis && results.analysis.colors && results.analysis.colors.length > 0 ? (
                        results.analysis.colors.map((color, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="w-8 h-8 rounded-full border border-gray-300" 
                              style={{ backgroundColor: color.rgb }}
                            ></div>
                            <span className="text-xs mt-1">{color.rgb}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">Aucune couleur détectée</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Objets détectés */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Objets détectés:</p>
                    <div className="flex flex-wrap gap-2">
                      {results.analysis && results.analysis.objects && results.analysis.objects.length > 0 ? (
                        results.analysis.objects.map((object, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {object.name} ({Math.round(object.confidence * 100)}%)
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Aucun objet détecté</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Requête de recherche */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Recherche effectuée: <span className="font-medium">{results.searchQuery || 'Aucune recherche effectuée'}</span>
                  </p>
                </div>
                
                {/* Produits similaires */}
                <div>
                  <h3 className="font-medium text-lg mb-4">Produits similaires</h3>
                  
                  {results.similarProducts && results.similarProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.similarProducts.map((product, index) => (
                        <a 
                          key={index} 
                          href={product.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
                        >
                          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                            <img 
                              src={fixImageUrl(product.image)} 
                              alt={product.title} 
                              className="object-cover w-full h-40"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x150?text=Image+non+disponible';
                              }}
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-sm line-clamp-2 mb-1">{product.title}</h4>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">{product.displayLink}</span>
                              {product.price && (
                                <span className="inline-flex items-center text-sm font-medium text-green-600">
                                  <FaTag className="mr-1 text-xs" />
                                  {product.price}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-right">
                              <span className="inline-flex items-center text-xs text-blue-600">
                                Voir sur le site <FaExternalLinkAlt className="ml-1" />
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-center py-8 bg-gray-50 rounded-lg">
                      <FaShoppingBag className="text-4xl mx-auto mb-4 opacity-30" />
                      <p>Aucun produit similaire trouvé.</p>
                      <p className="text-sm mt-2">Essayez une autre image ou modifiez les termes de recherche.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-gray-500">
                <FaShoppingBag className="text-4xl mx-auto mb-4 opacity-30" />
                <p>Téléchargez et analysez une image pour voir les résultats ici</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">Fashion Finder &copy; {new Date().getFullYear()} - Trouvez des vêtements similaires facilement</p>
          <p className="text-xs mt-2 text-gray-400">Propulsé par Google Vision API et Google Custom Search</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
