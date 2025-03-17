import React, { useState } from 'react';
import { FaStore, FaRegHeart, FaShareAlt, FaTag, FaChevronDown, FaChevronUp, FaInfoCircle, FaFilter, FaSearch } from 'react-icons/fa';
import ProductCard from './ProductCard';

/**
 * Composant avancé d'affichage style Google Lens
 * Affiche l'image originale avec ses caractéristiques et les produits similaires
 */
const GoogleLensView = ({ previewUrl, results, onSaveResults }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  // Extraire les informations principales des résultats
  const { analysis, similarProducts, searchQuery } = results;
  const { labels, colors, mainObject, detectedText, detectedLogos } = analysis;

  // Générer des catégories de produits à partir des labels
  const generateCategories = () => {
    const categoriesMap = new Map();
    
    // Catégorie par défaut
    categoriesMap.set('all', {
      name: 'Tous',
      count: similarProducts.length
    });
    
    // Ajouter des catégories basées sur les labels
    if (labels && labels.length > 0) {
      const relevantLabels = labels
        .filter(label => label.score > 0.75) // Uniquement les labels avec un score élevé
        .slice(0, 3); // Limiter à 3 catégories
      
      relevantLabels.forEach(label => {
        const categoryName = label.description;
        const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        categoriesMap.set(categoryKey, {
          name: categoryName,
          count: similarProducts.length
        });
      });
    }
    
    // Si un objet principal a été détecté, l'ajouter comme catégorie prioritaire
    if (mainObject) {
      const categoryName = mainObject.name;
      const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      categoriesMap.set(categoryKey, {
        name: categoryName,
        count: similarProducts.length
      });
    }
    
    return Array.from(categoriesMap.values());
  };

  // Filtrer les produits selon différents critères
  const filterProducts = () => {
    // Par défaut, pas de filtrage
    if (activeFilter === 'all' && activeCategory === 'all') {
      return similarProducts;
    }
    
    return similarProducts.filter(product => {
      // Filtrer par catégorie si nécessaire
      if (activeCategory !== 'all') {
        const categoryName = Array.from(generateCategories())
          .find(cat => cat.key === activeCategory)?.name || '';
        
        // Vérifie si le produit contient le nom de la catégorie
        // Dans son titre ou sa description
        if (!product.title.toLowerCase().includes(categoryName.toLowerCase()) &&
            !product.snippet.toLowerCase().includes(categoryName.toLowerCase())) {
          return false;
        }
      }
      
      // Filtrer par prix si nécessaire
      if (activeFilter === 'low-price') {
        // Extraire le prix (si disponible)
        const price = extractPrice(product.price);
        return price < 50; // Moins de 50€
      } else if (activeFilter === 'mid-price') {
        const price = extractPrice(product.price);
        return price >= 50 && price <= 100; // Entre 50€ et 100€
      } else if (activeFilter === 'high-price') {
        const price = extractPrice(product.price);
        return price > 100; // Plus de 100€
      }
      
      return true;
    });
  };

  // Extraire le prix numérique d'une chaîne (ex: "€49,95" -> 49.95)
  const extractPrice = (priceString) => {
    if (!priceString) return 0;
    
    // Extraire les chiffres
    const matches = priceString.match(/(\d+)[,.]?(\d+)?/);
    if (!matches) return 0;
    
    // Convertir en nombre
    if (matches[2]) {
      return parseFloat(`${matches[1]}.${matches[2]}`);
    } else {
      return parseFloat(matches[1]);
    }
  };

  // Fonction pour formatter les details de l'analyse
  const formatAnalysisDetails = () => {
    return (
      <div className="space-y-3 text-sm">
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Objet détecté :</h4>
          <p className="text-gray-600">{mainObject ? mainObject.name : 'Aucun objet principal détecté'}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Requête générée :</h4>
          <p className="text-gray-600 break-words">{searchQuery}</p>
        </div>
        
        {detectedLogos && detectedLogos.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Logos détectés :</h4>
            <div className="flex flex-wrap gap-1">
              {detectedLogos.map((logo, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {logo.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {detectedText && detectedText.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Texte détecté :</h4>
            <div className="flex flex-wrap gap-1">
              {detectedText.slice(0, 5).map((text, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {text.text}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <FaSearch className="mr-2" />
          Résultats similaires ({similarProducts.length})
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
            title="Filtrer les résultats"
          >
            <FaFilter className="text-gray-500" />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => onSaveResults()}
            title="Enregistrer ces résultats"
          >
            <FaRegHeart className="text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Filtres */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Prix</label>
              <div className="flex space-x-1">
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${activeFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setActiveFilter('all')}
                >
                  Tous
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${activeFilter === 'low-price' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setActiveFilter('low-price')}
                >
                  &lt; 50€
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${activeFilter === 'mid-price' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setActiveFilter('mid-price')}
                >
                  50-100€
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${activeFilter === 'high-price' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setActiveFilter('high-price')}
                >
                  &gt; 100€
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 md:flex">
        {/* Image originale à gauche */}
        <div className="md:w-1/3 pr-4 mb-4 md:mb-0">
          <div className="bg-gray-100 rounded-lg overflow-hidden h-72">
            <img 
              src={previewUrl} 
              alt="Image analysée"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Détails de l'analyse */}
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Analyse de l'image</h3>
              <button 
                className="text-sm text-blue-600 flex items-center"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Moins' : 'Plus'} de détails
                {showDetails ? <FaChevronUp className="ml-1" size={12} /> : <FaChevronDown className="ml-1" size={12} />}
              </button>
            </div>
            
            {/* Caractéristiques */}
            <div className="flex flex-wrap gap-1 mb-2">
              {labels.slice(0, 5).map((label, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  {label.description}
                </span>
              ))}
            </div>
            
            {/* Couleurs */}
            <div className="flex flex-wrap gap-1 mb-2">
              {colors.slice(0, 3).map((color, index) => (
                <div 
                  key={index} 
                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center tooltip"
                  style={{ backgroundColor: color.rgb }}
                  title={color.nameFr}
                >
                  {index === 0 && (
                    <span className="absolute w-2 h-2 bg-white rounded-full"></span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Détails supplémentaires */}
            {showDetails && formatAnalysisDetails()}
          </div>
        </div>
        
        {/* Liste des produits à droite */}
        <div className="md:w-2/3 md:pl-4">
          <div className="bg-gray-50 p-2 rounded mb-4 text-sm text-gray-600 flex items-center">
            <FaInfoCircle className="text-blue-500 mr-2" /> 
            {filterProducts().length} articles visuellement similaires trouvés
          </div>
          
          <div className="space-y-4">
            {filterProducts().map((product, index) => (
              <ProductCard 
                key={index} 
                product={product} 
                viewMode="lens" 
              />
            ))}
            
            {filterProducts().length === 0 && (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                Aucun résultat ne correspond aux filtres. Essayez de modifier vos critères.
              </div>
            )}
          </div>
          
          {/* Actions globales */}
          <div className="mt-6 flex justify-center">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              onClick={onSaveResults}
            >
              <FaRegHeart className="mr-2" /> Enregistrer ces résultats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLensView;
