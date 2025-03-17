import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaTrash, FaHistory, FaShare } from 'react-icons/fa';

/**
 * Composant de gestion des favoris et de l'historique des recherches
 * Permet à l'utilisateur de sauvegarder des produits et des recherches précédentes
 */
const FavoritesManager = ({ similarProducts, currentImage, searchQuery }) => {
  // État pour stocker les favoris et l'historique
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Charger les favoris et l'historique depuis le localStorage au chargement du composant
  useEffect(() => {
    const storedFavorites = localStorage.getItem('fashion-finder-favorites');
    const storedHistory = localStorage.getItem('fashion-finder-search-history');
    
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error('Erreur lors du chargement des favoris:', e);
        setFavorites([]);
      }
    }
    
    if (storedHistory) {
      try {
        setSearchHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Erreur lors du chargement de l\'historique:', e);
        setSearchHistory([]);
      }
    }
  }, []);

  // Sauvegarder les favoris dans localStorage quand ils changent
  useEffect(() => {
    localStorage.setItem('fashion-finder-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sauvegarder l'historique dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('fashion-finder-search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Ajouter une recherche à l'historique quand une nouvelle recherche est effectuée
  useEffect(() => {
    if (searchQuery && similarProducts && currentImage) {
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        query: searchQuery,
        imagePreview: currentImage,
        resultCount: similarProducts.length
      };
      
      // Éviter les doublons en vérifiant si une recherche similaire existe déjà
      setSearchHistory(prevHistory => {
        const isDuplicate = prevHistory.some(item => item.query === searchQuery);
        if (isDuplicate) return prevHistory;
        
        // Garder seulement les 10 dernières recherches
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 10);
        return updatedHistory;
      });
    }
  }, [searchQuery, similarProducts, currentImage]);

  // Vérifier si un produit est dans les favoris
  const isProductInFavorites = (product) => {
    return favorites.some(fav => fav.link === product.link);
  };

  // Ajouter ou supprimer un produit des favoris
  const toggleFavorite = (product) => {
    if (isProductInFavorites(product)) {
      setFavorites(favorites.filter(fav => fav.link !== product.link));
    } else {
      const productWithTimestamp = {
        ...product,
        addedAt: new Date().toISOString()
      };
      setFavorites([...favorites, productWithTimestamp]);
    }
  };

  // Supprimer un élément de l'historique
  const removeFromHistory = (historyItemId) => {
    setSearchHistory(searchHistory.filter(item => item.id !== historyItemId));
  };

  // Supprimer tous les favoris
  const clearAllFavorites = () => {
    if (window.confirm('Voulez-vous vraiment supprimer tous vos favoris ?')) {
      setFavorites([]);
    }
  };

  // Supprimer tout l'historique
  const clearAllHistory = () => {
    if (window.confirm('Voulez-vous vraiment effacer tout votre historique de recherche ?')) {
      setSearchHistory([]);
    }
  };

  // Partager un produit via l'API Web Share si disponible
  const shareProduct = async (product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Découvrez ce produit: ${product.title}`,
          url: product.link
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
        // Fallback si l'utilisateur annule ou si une erreur se produit
        navigator.clipboard.writeText(product.link)
          .then(() => alert('Lien copié dans le presse-papier !'))
          .catch(err => console.error('Erreur de copie:', err));
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(product.link)
        .then(() => alert('Lien copié dans le presse-papier !'))
        .catch(err => console.error('Erreur de copie:', err));
    }
  };

  // Réutiliser une recherche précédente
  const rerunSearch = (historyItem) => {
    // Cette fonction devra être implémentée par le composant parent
    // Elle pourrait recharger l'image et relancer la recherche
    alert(`Fonctionnalité à implémenter: Relancer la recherche "${historyItem.query}"`);
  };

  // Formatage de la date pour l'affichage
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="mt-8 mb-4">
      {/* Boutons de contrôle */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            showFavorites ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
          }`}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          <FaHeart />
          <span>
            Favoris ({favorites.length})
          </span>
        </button>
        
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            showHistory ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
          onClick={() => setShowHistory(!showHistory)}
        >
          <FaHistory />
          <span>
            Historique ({searchHistory.length})
          </span>
        </button>
      </div>

      {/* Section Favoris */}
      {showFavorites && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-pink-700">Mes Favoris</h3>
            {favorites.length > 0 && (
              <button 
                className="text-sm flex items-center space-x-1 text-red-500 hover:text-red-700"
                onClick={clearAllFavorites}
              >
                <FaTrash />
                <span>Tout supprimer</span>
              </button>
            )}
          </div>

          {favorites.length === 0 ? (
            <p className="text-gray-500 italic">Aucun favori enregistré. Cliquez sur le cœur à côté d'un produit pour l'ajouter ici.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((product) => (
                <div key={product.link} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x150?text=Image+non+disponible';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h4>
                    {product.price && (
                      <p className="text-green-600 font-bold text-sm">{product.price}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Ajouté le {formatDate(product.addedAt)}
                    </p>
                    <div className="flex justify-between mt-2">
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => toggleFavorite(product)}
                      >
                        <FaHeart />
                      </button>
                      <a 
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaExternalLinkAlt />
                      </a>
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => shareProduct(product)}
                      >
                        <FaShare />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section Historique */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-700">Historique des recherches</h3>
            {searchHistory.length > 0 && (
              <button 
                className="text-sm flex items-center space-x-1 text-red-500 hover:text-red-700"
                onClick={clearAllHistory}
              >
                <FaTrash />
                <span>Tout effacer</span>
              </button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <p className="text-gray-500 italic">Aucune recherche dans l'historique.</p>
          ) : (
            <div className="space-y-3">
              {searchHistory.map((item) => (
                <div key={item.id} className="flex items-center p-2 border rounded-lg hover:bg-gray-50">
                  {item.imagePreview && (
                    <div className="w-16 h-16 mr-3 flex-shrink-0">
                      <img 
                        src={item.imagePreview} 
                        alt="Recherche" 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <p className="font-medium text-sm">"{item.query}"</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(item.timestamp)} • {item.resultCount} résultats
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700 p-1"
                      onClick={() => rerunSearch(item)}
                      title="Relancer cette recherche"
                    >
                      <FaSearch />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => removeFromHistory(item.id)}
                      title="Supprimer de l'historique"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesManager;
