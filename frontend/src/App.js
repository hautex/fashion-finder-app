import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaSearch, FaShoppingBag, FaTag, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { RiShirtLine } from 'react-icons/ri';
import { BiLoaderAlt } from 'react-icons/bi';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState({ checking: false, vision: null, search: null });
  const [tips, setTips] = useState([]);
  const fileInputRef = useRef(null);

  // Vérifier l'état des APIs au chargement
  useEffect(() => {
    checkApiStatus();
    
    // Conseils pour l'utilisateur
    const allTips = [
      "Choisissez une image où le vêtement est bien visible et occupe la majorité de l'image.",
      "Les photos avec un fond simple fonctionnent mieux pour l'analyse.",
      "Évitez les images avec plusieurs vêtements ou personnes pour de meilleurs résultats.",
      "Les images bien éclairées et nettes donnent de meilleurs résultats.",
      "Si vous ne voyez pas de résultats, essayez une autre image ou une autre catégorie de vêtement."
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
      const response = await fetch('http://localhost:5000/api/check-apis');
      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          checking: false,
          vision: data.vision,
          search: data.search
        });
      } else {
        const errorData = await response.json();
        setApiStatus({
          checking: false,
          vision: errorData.vision || { available: false, message: 'Impossible de vérifier l\'API Vision' },
          search: errorData.search || { available: false, message: 'Impossible de vérifier l\'API Search' }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des APIs:', error);
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

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || `Erreur HTTP! statut: ${response.status}`);
      }

      setResults(data);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setError(`${error.message || 'Une erreur est survenue lors de l\'analyse.'}
      
Conseils de dépannage:
- Vérifiez que l'image est de bonne qualité et clairement visible
- Assurez-vous que le vêtement est au premier plan
- Vérifiez votre connexion internet
- Réessayez avec une autre image`);
    } finally {
      setLoading(false);
    }
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
              <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus.vision?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="mr-2 font-medium">API Vision:</span>
              {apiStatus.checking ? (
                <BiLoaderAlt className="animate-spin text-blue-600" />
              ) : apiStatus.vision?.available ? (
                <span className="text-green-600">Disponible</span>
              ) : (
                <span className="text-red-600">Indisponible</span>
              )}
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus.search?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="mr-2 font-medium">API Recherche:</span>
              {apiStatus.checking ? (
                <BiLoaderAlt className="animate-spin text-blue-600" />
              ) : apiStatus.search?.available ? (
                <span className="text-green-600">Disponible</span>
              ) : (
                <span className="text-red-600">Indisponible</span>
              )}
            </div>
          </div>
          {(!apiStatus.vision?.available || !apiStatus.search?.available) && (
            <div className="mt-3 text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
              <FaExclamationTriangle className="inline-block mr-1" /> 
              Certaines API sont indisponibles. L'application pourrait ne pas fonctionner correctement.
              Vérifiez que les clés API Google sont activées dans la Console Google Cloud.
              <button 
                onClick={checkApiStatus} 
                className="ml-2 text-blue-600 underline hover:text-blue-800"
              >
                Vérifier à nouveau
              </button>
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
                  className={`w-full py-2 px-4 rounded-lg shadow transition flex items-center justify-center ${
                    (!apiStatus.vision?.available || !apiStatus.search?.available) 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={handleAnalyze}
                  disabled={loading || !apiStatus.vision?.available || !apiStatus.search?.available}
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
                
                {(!apiStatus.vision?.available || !apiStatus.search?.available) && (
                  <p className="text-xs text-red-600 mt-1">
                    Impossible d'analyser: APIs indisponibles
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
                      {results.analysis.labels.map((label, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {label.description}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Couleurs */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Couleurs dominantes:</p>
                    <div className="flex gap-2">
                      {results.analysis.colors.map((color, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-8 h-8 rounded-full border border-gray-300" 
                            style={{ backgroundColor: color.rgb }}
                          ></div>
                          <span className="text-xs mt-1">{color.rgb}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Objets détectés */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Objets détectés:</p>
                    <div className="flex flex-wrap gap-2">
                      {results.analysis.objects.map((object, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {object.name} ({Math.round(object.confidence * 100)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Requête de recherche */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Recherche effectuée: <span className="font-medium">{results.searchQuery}</span>
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
                              src={product.image} 
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
