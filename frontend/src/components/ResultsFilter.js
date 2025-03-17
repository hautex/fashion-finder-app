import React, { useState, useEffect } from 'react';
import { FaFilter, FaSortAmountDown, FaSortAmountUp, FaEuroSign, FaTag } from 'react-icons/fa';

/**
 * Composant de filtrage et tri des résultats de recherche
 * Permet de filtrer par prix, couleur, et de trier les résultats
 */
const ResultsFilter = ({ products, onFilteredProductsChange }) => {
  // États pour les filtres
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // Options de couleurs prédéfinies avec leur code hexadécimal
  const colorOptions = [
    { name: 'Noir', hex: '#000000' },
    { name: 'Blanc', hex: '#FFFFFF' },
    { name: 'Rouge', hex: '#FF0000' },
    { name: 'Bleu', hex: '#0000FF' },
    { name: 'Bleu Marine', hex: '#000080' },
    { name: 'Vert', hex: '#008000' },
    { name: 'Jaune', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Rose', hex: '#FFC0CB' },
    { name: 'Violet', hex: '#800080' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Marron', hex: '#A52A2A' }
  ];

  // Extraire et calculer les valeurs initiales en fonction des produits
  useEffect(() => {
    if (products && products.length > 0) {
      // Extraire les marchands disponibles
      const merchants = [...new Set(products.map(product => 
        product.displayLink || 'Inconnu'
      ))];
      
      // Extraire et calculer la plage de prix
      const prices = products
        .map(product => extractPrice(product.price))
        .filter(price => price !== null);
      
      if (prices.length > 0) {
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange({ min: minPrice, max: maxPrice });
      }
      
      // Réinitialiser les filtres
      setSelectedMerchants([]);
      setSelectedColors([]);
      setSortOption('default');
      
      // Appliquer les filtres actuels aux nouveaux produits
      applyFilters(products);
    }
  }, [products]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters(products);
  }, [priceRange, selectedColors, selectedMerchants, sortOption]);

  // Fonction pour extraire le prix numérique d'une chaîne de caractères
  const extractPrice = (priceString) => {
    if (!priceString) return null;
    
    // Extraire un nombre de la chaîne de prix
    const priceMatch = priceString.match(/(\d+[.,]\d+|\d+)/);
    if (priceMatch) {
      return parseFloat(priceMatch[0].replace(',', '.'));
    }
    return null;
  };

  // Fonction pour déterminer si un produit contient une couleur spécifique
  const productHasColor = (product, colorName) => {
    const productInfo = `${product.title} ${product.snippet || ''}`.toLowerCase();
    return colorName.toLowerCase().split(' ').some(word => 
      productInfo.includes(word) && word.length > 2 // Éviter les mots trop courts
    );
  };

  // Fonction principale pour appliquer tous les filtres
  const applyFilters = (products) => {
    if (!products) return;
    
    let filtered = [...products];
    
    // Filtrer par fourchette de prix
    if (priceRange.min > 0 || priceRange.max < 1000) {
      filtered = filtered.filter(product => {
        const price = extractPrice(product.price);
        if (price === null) return true; // Garder les produits sans prix
        return price >= priceRange.min && price <= priceRange.max;
      });
    }
    
    // Filtrer par couleurs sélectionnées
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => 
        selectedColors.some(color => productHasColor(product, color))
      );
    }
    
    // Filtrer par marchands sélectionnés
    if (selectedMerchants.length > 0) {
      filtered = filtered.filter(product => 
        selectedMerchants.includes(product.displayLink || 'Inconnu')
      );
    }
    
    // Appliquer le tri
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = extractPrice(a.price) || 9999;
          const priceB = extractPrice(b.price) || 9999;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = extractPrice(a.price) || 0;
          const priceB = extractPrice(b.price) || 0;
          return priceB - priceA;
        });
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Ne pas trier (ordre par défaut)
        break;
    }
    
    setFilteredProducts(filtered);
    onFilteredProductsChange(filtered);
  };

  // Gestionnaires d'événements pour les filtres
  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: Number(value)
    }));
  };

  const handleColorToggle = (colorName) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  };

  const handleMerchantToggle = (merchant) => {
    setSelectedMerchants(prev => {
      if (prev.includes(merchant)) {
        return prev.filter(m => m !== merchant);
      } else {
        return [...prev, merchant];
      }
    });
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setPriceRange({ min: 0, max: 1000 });
    setSelectedColors([]);
    setSelectedMerchants([]);
    setSortOption('default');
  };

  // Extraire la liste unique des marchands présents dans les produits
  const availableMerchants = products ? 
    [...new Set(products.map(product => product.displayLink || 'Inconnu'))] : [];

  return (
    <div className="mb-6">
      {/* Bouton pour afficher/masquer les filtres */}
      <button
        className={`flex items-center space-x-2 px-4 py-2 mb-4 rounded-lg ${
          showFilters ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
        }`}
        onClick={() => setShowFilters(!showFilters)}
      >
        <FaFilter />
        <span>
          Filtres et tri {filteredProducts && products && products.length !== filteredProducts.length && 
            `(${filteredProducts.length}/${products.length})`}
        </span>
      </button>

      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-indigo-700">Options de filtrage</h3>
            <button
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              onClick={resetFilters}
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Filtre de prix */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium flex items-center mb-2 text-sm">
                <FaEuroSign className="mr-1" /> Fourchette de prix
              </h4>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max={priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Min"
                />
                <span>à</span>
                <input
                  type="number"
                  min={priceRange.min}
                  max="10000"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full mt-2"
              />
            </div>

            {/* Filtre de couleurs */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Couleurs</h4>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    className={`px-2 py-1 rounded-full text-xs flex items-center ${
                      selectedColors.includes(color.name)
                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-400'
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={() => handleColorToggle(color.name)}
                    style={{ borderLeftColor: color.hex, borderLeftWidth: '4px' }}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre de marchands */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium flex items-center mb-2 text-sm">
                <FaTag className="mr-1" /> Marchands
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableMerchants.map((merchant) => (
                  <button
                    key={merchant}
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedMerchants.includes(merchant)
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-400'
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={() => handleMerchantToggle(merchant)}
                  >
                    {merchant}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options de tri */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Trier par</h4>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                  sortOption === 'default' ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSortOption('default')}
              >
                Pertinence
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                  sortOption === 'price-asc' ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSortOption('price-asc')}
              >
                <FaSortAmountUp className="mr-1" /> Prix croissant
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                  sortOption === 'price-desc' ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSortOption('price-desc')}
              >
                <FaSortAmountDown className="mr-1" /> Prix décroissant
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                  sortOption === 'name-asc' ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSortOption('name-asc')}
              >
                A-Z
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                  sortOption === 'name-desc' ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSortOption('name-desc')}
              >
                Z-A
              </button>
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          <div className="mt-4 pt-3 border-t text-sm text-gray-600">
            <p>
              {filteredProducts && products ? (
                <>
                  Affichage de {filteredProducts.length} sur {products.length} produits
                  {(selectedColors.length > 0 || selectedMerchants.length > 0 || 
                    priceRange.min > 0 || priceRange.max < 1000) && ' (filtrés)'}
                </>
              ) : (
                'Aucun résultat'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsFilter;
