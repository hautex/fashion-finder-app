/**
 * Service de recherche directe de produits avec extraction d'URLs spécifiques
 * Ce service permet d'obtenir des liens directs vers les pages de produits
 * similaire à Google Lens
 */

const axios = require('axios');

// Structure des URLs de produits par domaine
const PRODUCT_URL_PATTERNS = {
  // Zalando
  'zalando.fr': {
    pattern: /\/([\w-]+)-([A-Z0-9]+).html$/i,
    directUrlTemplate: 'https://www.zalando.fr/article/$2',
    idPosition: 2
  },
  // H&M
  'hm.com': {
    pattern: /\/productpage\.([0-9]+)\.html/i,
    directUrlTemplate: 'https://www2.hm.com/fr_fr/productpage.$1.html',
    idPosition: 1
  },
  // Asos
  'asos.com': {
    pattern: /\/([0-9]+)$/i,
    directUrlTemplate: 'https://www.asos.com/fr/prd/$1',
    idPosition: 1
  },
  // La Redoute
  'laredoute.fr': {
    pattern: /\/([\w-]+)\.html/i,
    directUrlTemplate: 'https://www.laredoute.fr/ppdp/$1.html',
    idPosition: 1
  },
  // Zara
  'zara.com': {
    pattern: /\/([0-9]+)\.html/i,
    directUrlTemplate: 'https://www.zara.com/fr/fr/article/$1.html',
    idPosition: 1
  },
  // Sarenza
  'sarenza.com': {
    pattern: /\/([^\/]+)\/([^\/]+)-s([0-9]+)\.aspx/i,
    directUrlTemplate: 'https://www.sarenza.com/produit/$3',
    idPosition: 3
  },
  // Spartoo
  'spartoo.com': {
    pattern: /\/([0-9]+)-([^\/]+)\.php/i,
    directUrlTemplate: 'https://www.spartoo.com/article/$1',
    idPosition: 1
  }
};

/**
 * Extrait l'ID de produit d'une URL et génère une URL directe vers le produit
 * @param {String} url - URL de la page à analyser
 * @returns {String} - URL directe vers le produit, ou l'URL originale si non trouvée
 */
function extractDirectProductUrl(url) {
  try {
    // Extraire le nom de domaine
    const domain = extractDomain(url);
    
    // Vérifier si nous avons un pattern pour ce domaine
    if (PRODUCT_URL_PATTERNS[domain]) {
      const { pattern, directUrlTemplate, idPosition } = PRODUCT_URL_PATTERNS[domain];
      
      // Tester si l'URL correspond au pattern
      const match = url.match(pattern);
      
      if (match && match[idPosition]) {
        // Remplacer les placeholders dans le template
        return directUrlTemplate.replace(`$${idPosition}`, match[idPosition]);
      }
    }
    
    // Si aucun pattern ne correspond, retourner l'URL originale
    return url;
  } catch (error) {
    console.error('Erreur lors de l\'extraction de l\'URL directe:', error);
    return url; // En cas d'erreur, retourner l'URL originale
  }
}

/**
 * Extrait le nom de domaine d'une URL
 * @param {String} url - URL complète
 * @returns {String} - Nom de domaine (ex: zalando.fr)
 */
function extractDomain(url) {
  try {
    // Utiliser URL API pour extraire le hostname
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Supprimer le "www." si présent
    return hostname.replace(/^www\./, '');
  } catch (error) {
    // En cas d'erreur de parsing, essayer une méthode alternative
    const domainMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return domainMatch ? domainMatch[1] : '';
  }
}

/**
 * Vérifie si une URL est une URL de produit (et non une page de catégorie)
 * @param {String} url - URL à vérifier
 * @returns {Boolean} - True si c'est probablement une URL de produit
 */
function isProductUrl(url) {
  // Caractéristiques communes des URLs de produits
  const productUrlPatterns = [
    /\/p\//, // Format commun pour les pages produits
    /\/product\//, // Format commun pour les pages produits
    /\/article\//, // Format commun pour les pages produits
    /[0-9]{5,}/, // ID produit numérique long
    /\.html$/ // Extension commune pour les pages produits
  ];
  
  // Caractéristiques des pages à éviter
  const nonProductUrlPatterns = [
    /\/search\//, // Pages de recherche
    /\/category\//, // Pages de catégorie
    /\/collection\//, // Pages de collection
    /\/(homme|femme|enfant)\//, // Pages de catégorie par genre
    /\/(nouveautes|soldes)\//, // Pages de nouveautés ou soldes
  ];
  
  // Vérifier d'abord si c'est une URL à éviter
  for (const pattern of nonProductUrlPatterns) {
    if (pattern.test(url)) {
      return false;
    }
  }
  
  // Ensuite vérifier si c'est une URL de produit
  for (const pattern of productUrlPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }
  
  // Par défaut, considérer comme non-produit pour être prudent
  return false;
}

/**
 * Extrait les données de produit à partir d'une page web (titre, image, prix)
 * @param {String} url - URL du produit à scraper
 * @returns {Object} - Données enrichies du produit
 */
async function enrichProductData(url) {
  try {
    // Créer un objet de données enrichies par défaut
    const enrichedData = {
      directUrl: extractDirectProductUrl(url),
      originalUrl: url,
      scrapedTitle: null,
      scrapedImage: null,
      scrapedPrice: null,
      scrapedDescription: null
    };
    
    // Tenter de faire une requête HEAD pour vérifier si l'URL est accessible
    const headResponse = await axios.head(url, { timeout: 3000 });
    
    // Si l'URL est inaccessible, retourner les données par défaut
    if (headResponse.status !== 200) {
      return enrichedData;
    }
    
    // Ici on pourrait ajouter du scraping pour enrichir les données
    // mais cela nécessiterait des packages comme cheerio et plus de temps de traitement
    
    return enrichedData;
  } catch (error) {
    console.error(`Erreur lors de l'enrichissement des données pour ${url}:`, error.message);
    return {
      directUrl: extractDirectProductUrl(url),
      originalUrl: url,
      scrapedTitle: null,
      scrapedImage: null,
      scrapedPrice: null,
      scrapedDescription: null
    };
  }
}

module.exports = {
  extractDirectProductUrl,
  isProductUrl,
  enrichProductData
};
