import React, { useState, useRef } from 'react';
import { FaUpload, FaSearch, FaShoppingBag, FaTag } from 'react-icons/fa';
import { RiShirtLine } from 'react-icons/ri';
import { BiLoaderAlt } from 'react-icons/bi';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
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
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
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
                  
                  {results.similarProducts.length > 0 ? (
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
                    <p className="text-gray-600 text-center py-8">
                      Aucun produit similaire trouvé.
                    </p>
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
        </div>
      </footer>
    </div>
  );
}

export default App;
