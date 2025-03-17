/**
 * Service de recherche directe de produits avec extraction d'URLs spécifiques
 * Ce service permet d'obtenir des liens directs vers les pages de produits
 * similaire à Google Lens
 */

const axios = require('axios');

// Structure des URLs de produits par domaine
const PRODUCT_URL_PATTERNS = {
  // Zalando - Plusieurs formats possibles
  'zalando.fr': [
    {
      pattern: /\/([a-zA-Z0-9-]+)-([a-zA-Z0-9-]{10,})\./i,
      directUrlTemplate: 'https://www.zalando.fr/article/$2',
      idPosition: 2
    },
    {
      pattern: /\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)-([a-zA-Z0-9-]{10,})\./i,
      directUrlTemplate: 'https://www.zalando.fr/article/$3',
      idPosition: 3
    },
    {
      pattern: /\/p\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)-([a-zA-Z0-9-]{10,})/i,
      directUrlTemplate: 'https://www.zalando.fr/article/$3',
      idPosition: 3
    }
  ],
  // Zalando BE
  'zalando.be': [
    {
      pattern: /\/([a-zA-Z0-9-]+)-([a-zA-Z0-9-]{10,})\./i,
      directUrlTemplate: 'https://www.zalando.be/fr/article/$2',
      idPosition: 2
    }
  ],
  // H&M
  'hm.com': [
    {
      pattern: /\/productpage\.([0-9]+)\.html/i,
      directUrlTemplate: 'https://www2.hm.com/fr_fr/productpage.$1.html',
      idPosition: 1
    },
    {
      pattern: /\/productpage\/([0-9]+)/i,
      directUrlTemplate: 'https://www2.hm.com/fr_fr/productpage/$1.html',
      idPosition: 1
    }
  ],
  // Asos
  'asos.com': [
    {
      pattern: /\/prd\/([0-9]+)/i,
      directUrlTemplate: 'https://www.asos.com/fr/prd/$1',
      idPosition: 1
    },
    {
      pattern: /\/([0-9]{8,})$/i,
      directUrlTemplate: 'https://www.asos.com/fr/prd/$1',
      idPosition: 1
    }
  ],
  // La Redoute
  'laredoute.fr': [
    {
      pattern: /\/ppdp\/([0-9]+)\.html/i,
      directUrlTemplate: 'https://www.laredoute.fr/ppdp/$1.html',
      idPosition: 1
    },
    {
      pattern: /prod-([0-9]+)\.aspx/i,
      directUrlTemplate: 'https://www.laredoute.fr/ppdp/$1.html',
      idPosition: 1
    }
  ],
  // Zara
  'zara.com': [
    {
      pattern: /\/p\/([0-9]+)\/([0-9]+)/i,
      directUrlTemplate: 'https://www.zara.com/fr/fr/article/$1.html',
      idPosition: 1
    },
    {
      pattern: /\/article\/([0-9]+)\.html/i,
      directUrlTemplate: 'https://www.zara.com/fr/fr/article/$1.html',
      idPosition: 1
    }
  ],
  // Sarenza
  'sarenza.com': [
    {
      pattern: /\/s([0-9]+)\.aspx/i,
      directUrlTemplate: 'https://www.sarenza.com/produit/$1',
      idPosition: 1
    },
    {
      pattern: /\/produit\/([0-9]+)/i,
      directUrlTemplate: 'https://www.sarenza.com/produit/$1',
      idPosition: 1
    }
  ],
  // Spartoo
  'spartoo.com': [
    {
      pattern: /\/([0-9]+)-([^\/]+)\.php/i,
      directUrlTemplate: 'https://www.spartoo.com/article/$1',
      idPosition: 1
    }
  ],
  // Mango
  'mango.com': [
    {
      pattern: /\/p\/([0-9]+)$/i,
      directUrlTemplate: 'https://shop.mango.com/fr/femme/article/$1',
      idPosition: 1
    }
  ],
  // CelioStore
  'celio.com': [
    {
      pattern: /\/p\/([^\/]+)\_([0-9]+)\.html/i,
      directUrlTemplate: 'https://www.celio.com/p/$1_$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Bershka
  'bershka.com': [
    {
      pattern: /\/product\/([0-9]+)\/([0-9]+)/i,
      directUrlTemplate: 'https://www.bershka.com/fr/product/$1/$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Galeries Lafayette
  'galerieslafayette.com': [
    {
      pattern: /\/p\/([^\/]+)\/([0-9]+)/i,
      directUrlTemplate: 'https://www.galerieslafayette.com/p/$1/$2',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Jules
  'jules.com': [
    {
      pattern: /\/p\/([^\/]+)-([0-9]+)\.html/i,
      directUrlTemplate: 'https://www.jules.com/fr-fr/p/$1-$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Timberland
  'timberland.fr': [
    {
      pattern: /\/shop\/fr\/tbl-fr\/([^\/]+)$/i,
      directUrlTemplate: 'https://www.timberland.fr/shop/fr/tbl-fr/$1',
      idPosition: 1
    }
  ],
  // Courir
  'courir.com': [
    {
      pattern: /\/p\/([^\/]+)\.html/i,
      directUrlTemplate: 'https://www.courir.com/fr/p/$1.html',
      idPosition: 1
    }
  ],
  // Nike
  'nike.com': [
    {
      pattern: /\/t\/([^\/]+)\/([^\/]+)/i,
      directUrlTemplate: 'https://www.nike.com/fr/t/$1/$2',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Adidas
  'adidas.fr': [
    {
      pattern: /\/([^\/]+)\/([A-Z0-9]{6})\.html/i,
      directUrlTemplate: 'https://www.adidas.fr/fr/$1/$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Uniqlo
  'uniqlo.com': [
    {
      pattern: /\/products\/([^\/]+)\/([0-9]+)/i,
      directUrlTemplate: 'https://www.uniqlo.com/fr/fr/products/$1/$2',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Clarks
  'clarks.fr': [
    {
      pattern: /\/c\/([^\/]+)\/([0-9]+)\.html/i,
      directUrlTemplate: 'https://www.clarks.fr/c/$1/$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Dr Martens
  'drmartens.com': [
    {
      pattern: /\/fr\/fr\/([^\/]+)\/p\/([0-9]+)/i,
      directUrlTemplate: 'https://www.drmartens.com/fr/fr/$1/p/$2',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // JD Sports
  'jdsports.fr': [
    {
      pattern: /\/product\/([^\/]+)\/([^\/]+)/i,
      directUrlTemplate: 'https://www.jdsports.fr/product/$1/$2/',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Foot Locker
  'footlocker.fr': [
    {
      pattern: /\/product\/([^\/]+)\/([^\/]+)\.html/i,
      directUrlTemplate: 'https://www.footlocker.fr/product/$1/$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Geox
  'geox.com': [
    {
      pattern: /\/([^\/]+)-p-([A-Z0-9]+)/i,
      directUrlTemplate: 'https://www.geox.com/fr-FR/$1-p-$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ],
  // Amazon
  'amazon.fr': [
    {
      pattern: /\/dp\/([A-Z0-9]{10})/i,
      directUrlTemplate: 'https://www.amazon.fr/dp/$1',
      idPosition: 1
    },
    {
      pattern: /\/gp\/product\/([A-Z0-9]{10})/i,
      directUrlTemplate: 'https://www.amazon.fr/dp/$1',
      idPosition: 1
    }
  ],
  // The Boot Man
  'thebootman.fr': [
    {
      pattern: /\/([^\/]+)\/([^\/]+)\.html/i,
      directUrlTemplate: 'https://www.thebootman.fr/$1/$2.html',
      idPosition: 0,
      fullMatch: true
    }
  ]
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
      const patterns = Array.isArray(PRODUCT_URL_PATTERNS[domain]) 
        ? PRODUCT_URL_PATTERNS[domain] 
        : [PRODUCT_URL_PATTERNS[domain]];
      
      // Tester tous les patterns pour ce domaine
      for (const { pattern, directUrlTemplate, idPosition, fullMatch } of patterns) {
        const match = url.match(pattern);
        
        if (match) {
          if (fullMatch) {
            // Cas spécial où on a besoin de plusieurs groupes
            let resultUrl = directUrlTemplate;
            for (let i = 1; i < match.length; i++) {
              resultUrl = resultUrl.replace(`$${i}`, match[i]);
            }
            return resultUrl;
          } else if (match[idPosition]) {
            // Cas standard avec un seul ID à remplacer
            return directUrlTemplate.replace(`$${idPosition}`, match[idPosition]);
          }
        }
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
    /\/produit\//, // Format commun pour les pages produits
    /\/item\//, // Format commun pour les pages produits
    /ppdp/, // Format La Redoute
    /[0-9]{5,}/, // ID produit numérique long
    /[A-Z0-9]{6,}\.html$/, // Format Adidas/Nike
    /\/dp\/[A-Z0-9]{10}/, // Format Amazon
    /\.html$/ // Extension commune pour les pages produits
  ];
  
  // Caractéristiques des pages à éviter
  const nonProductUrlPatterns = [
    /\/search\//i, // Pages de recherche
    /\/recherche\//i, // Pages de recherche en français
    /\/category\//i, // Pages de catégorie
    /\/categorie\//i, // Pages de catégorie en français
    /\/collection\//i, // Pages de collection
    /\/selections\//i, // Pages de sélections
    /\/(homme|femme|enfant)\/$/i, // Pages de catégorie par genre (fin d'URL)
    /\/(nouveautes|soldes|promotions)\/$/i, // Pages de nouveautés ou soldes (fin d'URL)
    /\/brand\//i, // Pages de marque
    /\/marque\//i, // Pages de marque en français
    /\/accueil\//i, // Pages d'accueil
    /\/home\//i, // Pages d'accueil en anglais
    /\/panier\//i, // Pages de panier
    /\/cart\//i, // Pages de panier en anglais
    /\/wishlist\//i, // Pages de liste de souhaits
    /\/compte\//i, // Pages de compte
    /\/account\//i // Pages de compte en anglais
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
  
  // Vérifier si l'URL correspond à un pattern spécifique de produit
  const domain = extractDomain(url);
  if (PRODUCT_URL_PATTERNS[domain]) {
    const patterns = Array.isArray(PRODUCT_URL_PATTERNS[domain]) 
      ? PRODUCT_URL_PATTERNS[domain] 
      : [PRODUCT_URL_PATTERNS[domain]];
    
    for (const { pattern } of patterns) {
      if (pattern.test(url)) {
        return true;
      }
    }
  }
  
  // Patterns spécifiques pour les sites de chaussures
  const shoeStorePatterns = [
    // Sites spécialisés dans les chaussures
    /sarenza\.com/i,
    /spartoo\.com/i,
    /courir\.com/i,
    /jdsports\.fr/i,
    /footlocker\.fr/i,
    /clarks\.fr/i,
    /drmartens\.com/i,
    /geox\.com/i,
    /thebootman\.fr/i,
    /andrelepepe\.com/i,
    /bocage\.fr/i,
    /minelli\.fr/i,
    /aigle\.com/i,
    /nike\.com/i,
    /adidas\.fr/i,
    /puma\.com/i,
    /newbalance\.fr/i,
    /converse\.com/i,
    /asics\.com/i,
    /fila\.com/i,
    /reebok\.fr/i,
    /vans\.fr/i,
    /timberland\.fr/i
  ];
  
  // Si l'URL provient d'un site spécialisé dans les chaussures,
  // et n'est pas explicitement une non-URL de produit,
  // on présume qu'il s'agit d'une page de produit
  if (shoeStorePatterns.some(pattern => pattern.test(url))) {
    // Vérifier que l'URL ne contient pas de termes qui indiquent clairement que ce n'est pas un produit
    const definitelyNotProductPatterns = [
      /\/politique-de-confidentialit/i,
      /\/contact/i,
      /\/faq/i,
      /\/aide/i,
      /\/livraison/i,
      /\/retour/i,
      /\/condition/i,
      /\/a-propos/i,
      /\/blog/i,
      /\/magasin/i,
      /\/boutique/i,
      /\/presse/i
    ];
    
    if (!definitelyNotProductPatterns.some(pattern => pattern.test(url))) {
      return true;
    }
  }
  
  // Par défaut, considérer comme non-produit pour être prudent
  return false;
}

/**
 * Vérifie l'URL d'un site e-commerce via une requête HEAD 
 * pour s'assurer qu'elle est accessible
 * @param {String} url - URL à vérifier
 * @returns {Promise<Boolean>} - True si l'URL est accessible
 */
async function verifyProductUrl(url) {
  try {
    const response = await axios.head(url, { 
      timeout: 3000,
      validateStatus: status => status < 400, // Accepter les redirections
      maxRedirects: 5
    });
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    console.warn(`URL inaccessible: ${url}`, error.message);
    return false;
  }
}

/**
 * Extrait les données de produit à partir d'une page web (titre, image, prix)
 * @param {String} url - URL du produit à scraper
 * @returns {Object} - Données enrichies du produit
 */
async function enrichProductData(url) {
  try {
    // Créer un objet de données enrichies par défaut
    const directUrl = extractDirectProductUrl(url);
    const enrichedData = {
      directUrl: directUrl,
      originalUrl: url,
      isAccessible: false,
      scrapedTitle: null,
      scrapedImage: null,
      scrapedPrice: null,
      scrapedDescription: null
    };
    
    // Vérifier si l'URL directe est accessible
    enrichedData.isAccessible = await verifyProductUrl(directUrl);
    
    return enrichedData;
  } catch (error) {
    console.error(`Erreur lors de l'enrichissement des données pour ${url}:`, error.message);
    return {
      directUrl: extractDirectProductUrl(url),
      originalUrl: url,
      isAccessible: false,
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
  enrichProductData,
  verifyProductUrl,
  PRODUCT_URL_PATTERNS
};
