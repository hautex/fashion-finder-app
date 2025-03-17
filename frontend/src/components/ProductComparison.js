import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaTrash, FaExternalLinkAlt, FaHeart, FaRegHeart, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

/**
 * Composant de comparaison des produits côte à côte
 * Permet à l'utilisateur de comparer jusqu'à 4 produits simultanément
 */
const ProductComparison = ({ products, favorites = [], onToggleFavorite }) => {
  const [comparisonItems, setComparisonItems] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [features, setFeatures] = useState([]);

  // Réinitialiser l'état si les produits changent complètement
  useEffect(() => {
    if (products && products.length > 0 && comparisonItems.length > 0) {
      // Vérifier si tous les produits en comparaison sont toujours dans la liste des produits
      const stillValid = comparisonItems.every(item => 
        products.some(product => product.link === item.link)
      );
      
      if (!stillValid) {
        setComparisonItems([]);
      }
    }
  }, [products]);

  // Extraire les caractéristiques communes à comparer
  useEffect(() => {
    if (comparisonItems.length > 0) {
      // Définir les caractéristiques à comparer (propriétés et caractéristiques extraites)
      const extractedFeatures = [
        { id: 'price', name: 'Prix', type: 'price', important: true },
        { id: 'merchant', name: 'Marchand', type: 'text', important: true },
        { id: 'color', name: 'Couleur', type: 'color', important: true },
        { id: 'material', name: 'Matière', type: 'text', important: false },
        { id: 'style', name: 'Style', type: 'text', important: false },
        { id: 'occasion', name: 'Occasion', type: 'text', important: false },
        { id: 'size', name: 'Tailles disponibles', type: 'text', important: false }
      ];
      
      setFeatures(extractedFeatures);
    }
  }, [comparisonItems]);

  // Ajouter ou retirer un produit de la comparaison
  const toggleComparison = (product) => {
    const isInComparison = comparisonItems.some(item => item.link === product.link);
    
    if (isInComparison) {
      setComparisonItems(comparisonItems.filter(item => item.link !== product.link));
    } else {
      if (comparisonItems.length < 4) { // Limiter à 4 produits maximum
        setComparisonItems([...comparisonItems, product]);
        
        if (comparisonItems.length === 0) {
          // Si c'est le premier produit ajouté, ouvrir automatiquement la comparaison
          setShowComparison(true);
        }
      } else {
        alert('Vous ne pouvez pas comparer plus de 4 produits à la fois. Veuillez en retirer un d\'abord.');
      }
    }
  };

  // Vider la comparaison
  const clearComparison = () => {
    setComparisonItems([]);
    setShowComparison(false);
  };

  // Extraire le prix numérique d'une chaîne de caractères
  const extractPrice = (priceString) => {
    if (!priceString) return null;
    
    // Extraire un nombre de la chaîne de prix
    const priceMatch = priceString.match(/(\d+[.,]\d+|\d+)/);
    if (priceMatch) {
      return parseFloat(priceMatch[0].replace(',', '.'));
    }
    return null;
  };

  // Extraire la couleur à partir du titre et de la description
  const extractColor = (product) => {
    const colorKeywords = [
      'noir', 'blanc', 'rouge', 'bleu', 'vert', 'jaune', 'orange', 'rose', 
      'violet', 'gris', 'marron', 'beige', 'bleu marine', 'bordeaux'
    ];
    
    const productText = `${product.title} ${product.snippet || ''}`.toLowerCase();
    
    for (const color of colorKeywords) {
      if (productText.includes(color)) {
        return color.charAt(0).toUpperCase() + color.slice(1);
      }
    }
    
    return 'Non spécifié';
  };

  // Extraire d'autres caractéristiques à partir du texte du produit
  const extractFeature = (product, featureType) => {
    // Définir des motifs à rechercher pour chaque type de caractéristique
    const featurePatterns = {
      material: [
        'coton', 'polyester', 'laine', 'soie', 'lin', 'velours', 'cuir',
        'viscose', 'cachemire', 'denim', 'satin', 'mousseline', 'crêpe'
      ],
      style: [
        'élégant', 'décontracté', 'formel', 'vintage', 'moderne', 
        'classique', 'bohème', 'minimaliste', 'romantique', 'sportif'
      ],
      occasion: [
        'soirée', 'cocktail', 'mariage', 'bureau', 'casual', 'quotidien',
        'cérémonie', 'fête', 'travail', 'weekend', 'vacances'
      ],
      size: [
        'xs', 's', 'm', 'l', 'xl', 'xxl', '34', '36', '38', '40', '42', '44'
      ]
    };
    
    const patterns = featurePatterns[featureType] || [];
    const productText = `${product.title} ${product.snippet || ''}`.toLowerCase();
    
    const matches = patterns.filter(pattern => productText.includes(pattern));
    if (matches.length > 0) {
      // Formater les correspondances
      return matches.map(match => match.charAt(0).toUpperCase() + match.slice(1)).join(', ');
    }
    
    return 'Non spécifié';
  };

  // Obtenir la valeur d'une caractéristique spécifique pour un produit
  const getFeatureValue = (product, feature) => {
    switch (feature.id) {
      case 'price':
        return product.price || 'Non spécifié';
      case 'merchant':
        return product.displayLink || 'Non spécifié';
      case 'color':
        return extractColor(product);
      case 'material':
      case 'style':
      case 'occasion':
      case 'size':
        return extractFeature(product, feature.id);
      default:
        return 'Non spécifié';
    }
  };

  // Vérifier si un produit est dans les favoris
  const isInFavorites = (product) => {
    return favorites.some(fav => fav.link === product.link);
  };

  // Formatage conditionnel pour les valeurs
  const getValueClassName = (feature) => {
    switch (feature.type) {
      case 'price':
        return 'font-bold';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Bouton de comparaison flottant (visible si des produits sont sélectionnés) */}
      {comparisonItems.length > 0 && !showComparison && (
        <button 
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 z-50 flex items-center"
          onClick={() => setShowComparison(true)}
        >
          <FaExchangeAlt className="mr-2" />
          Comparer {comparisonItems.length} produit{comparisonItems.length > 1 ? 's' : ''}
        </button>
      )}
      
      {/* Modal de comparaison */}
      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                Comparaison de produits ({comparisonItems.length}/4)
              </h3>
              <div className="flex items-center space-x-3">
                {comparisonItems.length > 0 && (
                  <button 
                    className="text-sm bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded flex items-center"
                    onClick={clearComparison}
                  >
                    <FaTrash className="mr-1" /> Vider
                  </button>
                )}
                <button 
                  className="hover:bg-blue-500 rounded-full p-1"
                  onClick={() => setShowComparison(false)}
                >
                  <IoMdClose size={24} />
                </button>
              </div>
            </div>
            
            {/* Contenu */}
            <div className="overflow-auto p-4 flex-grow">
              {comparisonItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Aucun produit à comparer</p>
                  <p className="text-sm mt-2">
                    Cliquez sur l'icône de comparaison sur les produits pour les ajouter ici
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="w-32 p-3 text-left border-b-2"></th>
                        {comparisonItems.map((product, index) => (
                          <th key={index} className="p-3 border-b-2 min-w-[200px]">
                            <div className="flex flex-col items-center">
                              <div className="h-40 w-40 overflow-hidden rounded-lg mb-2">
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
                              <h4 className="font-medium text-sm mb-1 line-clamp-2 text-center">
                                {product.title}
                              </h4>
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="text-gray-500 hover:text-gray-700"
                                  onClick={() => toggleComparison(product)}
                                  title="Retirer de la comparaison"
                                >
                                  <FaTrash />
                                </button>
                                <a
                                  href={product.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                  title="Voir le produit"
                                >
                                  <FaExternalLinkAlt />
                                </a>
                                {onToggleFavorite && (
                                  <button
                                    className={isInFavorites(product) ? "text-red-500 hover:text-red-700" : "text-gray-400 hover:text-red-500"}
                                    onClick={() => onToggleFavorite(product)}
                                    title={isInFavorites(product) ? "Retirer des favoris" : "Ajouter aux favoris"}
                                  >
                                    {isInFavorites(product) ? <FaHeart /> : <FaRegHeart />}
                                  </button>
                                )}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature) => (
                        <tr key={feature.id} className={feature.important ? 'bg-blue-50' : ''}>
                          <td className={`p-3 font-medium border-b ${feature.important ? 'text-blue-700' : 'text-gray-700'}`}>
                            {feature.name}
                          </td>
                          {comparisonItems.map((product, index) => {
                            const value = getFeatureValue(product, feature);
                            return (
                              <td key={index} className={`p-3 text-center border-b ${getValueClassName(feature)}`}>
                                {value === 'Non spécifié' ? (
                                  <span className="text-gray-400 italic text-sm">Non spécifié</span>
                                ) : (
                                  feature.type === 'boolean' ? (
                                    value === true ? (
                                      <FaCheckCircle className="text-green-500 mx-auto" />
                                    ) : (
                                      <FaTimesCircle className="text-red-500 mx-auto" />
                                    )
                                  ) : (
                                    value
                                  )
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t px-6 py-3 bg-gray-50">
              <div className="text-sm text-gray-500">
                Les informations extraites sont basées sur l'analyse du titre et de la description des produits et peuvent ne pas être complètement précises.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Exportation de la fonction pour être utilisée par le composant parent */}
      {products && (
        <div className="hidden">
          {/* Ce composant exporte la fonction toggleComparison pour être utilisée par le parent */}
          {products.map((product, index) => (
            <span key={index} data-link={product.link} data-in-comparison={comparisonItems.some(item => item.link === product.link)} />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductComparison;
