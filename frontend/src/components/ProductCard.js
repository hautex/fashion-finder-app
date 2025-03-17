import React from 'react';
import { FaStore, FaRegHeart, FaShareAlt, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Composant de carte produit style Google Lens
 * @param {Object} product - Données du produit à afficher
 * @param {String} viewMode - Mode d'affichage ('grid' ou 'lens')
 */
const ProductCard = ({ product, viewMode }) => {
  // Fonction utilitaire pour corriger les liens d'images manquants
  const fixImageUrl = (url) => {
    if (!url || url === '') {
      return 'https://via.placeholder.com/300x150?text=Image+non+disponible';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return 'https://' + url;
  };

  // Extraire le nom du site à partir du lien
  const extractSiteName = (displayLink) => {
    if (!displayLink) return '';
    
    // Supprimer www. si présent
    let siteName = displayLink.replace(/^www\./, '');
    
    // Extraire le nom de base (avant le premier point)
    siteName = siteName.split('.')[0];
    
    // Mettre la première lettre en majuscule
    return siteName.charAt(0).toUpperCase() + siteName.slice(1);
  };
  
  // Formater le prix pour l'affichage
  const formatPrice = (price) => {
    if (!price) return '';
    
    // Vérifier si c'est déjà formaté
    if (price.startsWith('€') || price.startsWith('$') || price.startsWith('£')) {
      return price;
    }
    
    return `€${price}`;
  };

  // Déterminer le lien à utiliser (direct si disponible, sinon lien original)
  const productLink = product.directLink || product.link;

  // Mode d'affichage grille traditionnelle
  if (viewMode === 'grid') {
    return (
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
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
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 flex-grow">
            {product.title}
          </h3>
          <div className="mt-auto">
            <p className="text-sm text-gray-500 mb-2 flex items-center">
              <FaStore className="mr-1 text-gray-400" size={12} />
              {product.displayLink}
            </p>
            {product.price && (
              <p className="text-green-600 font-bold mb-2">{formatPrice(product.price)}</p>
            )}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.snippet}
            </p>
            <a 
              href={productLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir le produit <FaExternalLinkAlt className="ml-1" size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Mode d'affichage Google Lens
  return (
    <a 
      href={productLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start bg-white rounded-lg overflow-hidden border hover:shadow-md transition-shadow p-2 no-underline"
    >
      {/* Image du produit */}
      <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden">
        <img 
          src={fixImageUrl(product.image)} 
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/100x100?text=Image+non+disponible';
          }}
        />
      </div>
      
      {/* Informations du produit */}
      <div className="ml-4 flex-grow">
        <p className="text-sm font-medium text-blue-600 mb-1 line-clamp-2 hover:underline">{product.title}</p>
        <div className="flex items-center mb-1">
          <FaStore className="text-gray-400 mr-1 text-xs" />
          <span className="text-xs text-gray-500">{extractSiteName(product.displayLink)}</span>
        </div>
        {product.price && (
          <p className="text-sm font-bold text-green-600">{formatPrice(product.price)}</p>
        )}
        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.snippet}</p>
      </div>
      
      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 ml-2">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
          <FaRegHeart size={14} />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer">
          <FaShareAlt size={14} />
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
