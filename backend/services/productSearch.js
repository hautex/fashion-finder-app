/**
 * Service de recherche avancée de produits
 * Utilise des sources spécifiques pour les produits de mode
 */

const axios = require('axios');
const directProductSearch = require('./directProductSearch');

// Sites de shopping fiables pour chaque catégorie
const TRUSTED_FASHION_SITES = {
  // Sites pour les vêtements
  clothing: [
    'zalando.fr', 'laredoute.fr', 'asos.fr', 'galerieslafayette.com', 
    'zara.com', 'hm.com', 'mango.com', 'uniqlo.com', 'celio.com',
    'jules.com', 'bershka.com', 'nastygal.com', 'ralphlauren.fr'
  ],
  
  // Sites pour les chaussures
  shoes: [
    'sarenza.com', 'spartoo.com', 'zalando.fr', 'jdsports.fr',
    'courir.com', 'nike.com', 'adidas.fr', 'puma.com', 'clarks.fr',
    'footlocker.fr', 'timberland.fr', 'geox.com', 'drmartens.com'
  ],
  
  // Sites pour les sacs
  bags: [
    'zalando.fr', 'galerieslafayette.com', 'louisvuitton.com', 
    'michaelkors.fr', 'longchamp.com', 'eastpak.com', 'kipling.com',
    'samsonite.fr', 'lacoste.com', 'fossil.com', 'desigual.com',
    'lestropeziennes.fr', 'lancaster.fr'
  ]
};

// Fallback produits par catégorie avec images garanties
const FALLBACK_PRODUCTS = {
  // Bottines marron/brunes
  bottines_marron: [
    {
      title: 'Bottines Chelsea en cuir brun - Clarks Desert Chelsea',
      link: 'https://www.clarks.fr/c/desert-chelsea-2/26078358.html',
      directLink: 'https://www.clarks.fr/c/desert-chelsea-2/26078358.html',
      displayLink: 'www.clarks.fr',
      image: 'https://clarks.scene7.com/is/image/Pangaea2Build/26078358_W_1?wid=2000&hei=2000&fmt=jpg',
      snippet: 'Bottines Chelsea en cuir marron premium, semelle en caoutchouc, doublure en cuir respirant.',
      price: '€159,95'
    },
    {
      title: 'Bottines à lacets marron - Timberland Premium 6-inch',
      link: 'https://www.timberland.fr/shop/fr/tbl-fr/6-inch-premium-boots-pour-homme-en-marron-10001',
      directLink: 'https://www.timberland.fr/shop/fr/tbl-fr/6-inch-premium-boots-pour-homme-en-marron-10001',
      displayLink: 'www.timberland.fr',
      image: 'https://images.timberland.com/is/image/timberland/10001713-HERO?$PDP-FULL-IMAGE$',
      snippet: 'Bottines iconiques en cuir imperméable marron, col rembourré, semelle anti-fatigue.',
      price: '€219,00'
    },
    {
      title: 'Bottines cuir marron - Red Wing Iron Ranger',
      link: 'https://www.redwingshoes.com/heritage/mens/iron-ranger/iron-ranger-08111.html',
      directLink: 'https://www.redwingshoes.com/heritage/mens/iron-ranger/iron-ranger-08111.html',
      displayLink: 'www.redwingshoes.com',
      image: 'https://embed.widencdn.net/img/redwing/bexlfsgl2x/600x600px/RW08111_MUL_N1_0181_2_3.jpeg?position=s&crop=no&color=EDE8DD',
      snippet: 'Bottines artisanales en cuir huilé marron, bout renforcé, semelle Vibram durable.',
      price: '€349,00'
    },
    {
      title: 'Boots en cuir marron - Dr. Martens 1460',
      link: 'https://www.drmartens.com/fr/fr/1460-smooth-leather-lace-up-boots/p/11822212',
      directLink: 'https://www.drmartens.com/fr/fr/1460-smooth-leather-lace-up-boots/p/11822212',
      displayLink: 'www.drmartens.com',
      image: 'https://i1.adis.ws/i/drmartens/11822212.80.jpg?$medium$',
      snippet: 'Boots emblématiques en cuir lisse marron, 8 œillets, coutures jaunes, semelle AirWair.',
      price: '€199,00'
    },
    {
      title: 'Chelsea Boots Marron - Selected Homme',
      link: 'https://www.zalando.fr/selected-homme-slhlouis-chelsea-boot-bottines-marron-se622d0dy-o11.html',
      directLink: 'https://www.zalando.fr/article/se622d0dy-o11',
      displayLink: 'www.zalando.fr',
      image: 'https://img01.ztat.net/article/spp-media-p1/a6197bafdc5a30a0aae695ef968a5816/ab0df851ee7a48ebb7a4e337997723e3.jpg?imwidth=1800',
      snippet: 'Chelsea boots élégants en cuir marron, élastiques latéraux, bout légèrement pointu.',
      price: '€129,95'
    }
  ],
  
  // Sacs/sacoches marron
  sacs_marron: [
    {
      title: 'Sacoche en cuir marron - The Bridge Story Uomo',
      link: 'https://www.thebridgeonlineshop.com/fr/pc_sacoches_the_bridge_story_uomo_marron_cuir_retro_06460001-14.html',
      directLink: 'https://www.thebridgeonlineshop.com/fr/pc_sacoches_the_bridge_story_uomo_marron_cuir_retro_06460001-14.html',
      displayLink: 'www.thebridgeonlineshop.com',
      image: 'https://www.thebridgeonlineshop.com/images/products/xxlarge/06460001-14_1.jpg',
      snippet: 'Sacoche en cuir pleine fleur marron, design vintage avec finitions métal antique.',
      price: '€299,00'
    },
    {
      title: 'Messenger Bag Marron - Fossil Buckner',
      link: 'https://www.fossil.com/fr-fr/products/buckner-messenger/MBG9374200.html',
      directLink: 'https://www.fossil.com/fr-fr/products/buckner-messenger/MBG9374200.html',
      displayLink: 'www.fossil.com',
      image: 'https://fossil.scene7.com/is/image/FossilPartners/MBG9374200_main?$sfcc_fos_large$',
      snippet: 'Sacoche en cuir marron avec fermoir magnétique, poches intérieures, bandoulière ajustable.',
      price: '€249,00'
    },
    {
      title: 'Sac à bandoulière cuir marron - Lancaster Soft Vintage',
      link: 'https://www.lancaster.fr/fr/messenger-homme/soft-vintage-messenger-homme-marron-fonce.html',
      directLink: 'https://www.lancaster.fr/fr/messenger-homme/soft-vintage-messenger-homme-marron-fonce.html',
      displayLink: 'www.lancaster.fr',
      image: 'https://www.lancaster.fr/media/catalog/product/s/o/soft-vintage-3-messenger-homme-marron-fonce-3.jpg',
      snippet: 'Sacoche horizontale en cuir de vachette, format A4, fermeture zippée, doublure coton.',
      price: '€189,00'
    },
    {
      title: 'Sacoche bandoulière marron - Tommy Hilfiger Essential',
      link: 'https://fr.tommy.com/sacoche-bandouliere-en-cuir-essential-am0am08535gae',
      directLink: 'https://fr.tommy.com/sacoche-bandouliere-en-cuir-essential-am0am08535gae',
      displayLink: 'fr.tommy.com',
      image: 'https://tommy-europe.scene7.com/is/image/TommyEurope/AM0AM08535_GAE_main?$main@2x$',
      snippet: 'Sacoche compacte en cuir marron avec logo métallique, compartiment principal zippé.',
      price: '€149,90'
    },
    {
      title: 'Sac bandoulière cuir marron - Le Tanneur Bruno',
      link: 'https://www.letanneur.com/fr-fr/p/bruno-sac-bandouliere-homme-tltm2110',
      directLink: 'https://www.letanneur.com/fr-fr/p/bruno-sac-bandouliere-homme-tltm2110',
      displayLink: 'www.letanneur.com',
      image: 'https://www.letanneur.com/media/catalog/product/t/l/tltm2110_899_1.jpg',
      snippet: 'Sac messager en cuir de vachette pleine fleur, format A5, poche extérieure zippée.',
      price: '€280,00'
    }
  ],
  
  // Vêtements par défaut
  default: [
    {
      title: 'Article Mode Tendance - Collection Actuelle',
      link: 'https://www.zalando.fr/mode/',
      directLink: 'https://www.zalando.fr/mode/',
      displayLink: 'www.zalando.fr',
      image: 'https://img01.ztat.net/article/spp-media-p1/7df308f9c58a3f488652317f6786ee72/dd02f2e6e2a245b0a89c61a113d56a96.jpg',
      snippet: 'Découvrez les dernières tendances mode, tous styles et toutes marques.',
      price: '€49,95'
    },
    {
      title: 'Vêtements et Accessoires de Qualité',
      link: 'https://www2.hm.com/fr_fr/index.html',
      directLink: 'https://www2.hm.com/fr_fr/index.html',
      displayLink: 'www2.hm.com',
      image: 'https://lp2.hm.com/hmgoepprod?source=url[https://www2.hm.com/content/dam/TOOLBOX/PRE_SEASON/2022_pss/March_2022/Startpage_1_1_Trend.jpg]&scale=size[960]&sink=format[jpeg],quality[80]',
      snippet: 'Mode femme, homme et enfant au meilleur prix, collections exclusives et nouvelles tendances.',
      price: ''
    },
    {
      title: 'Nouveautés Mode - Les essentiels du moment',
      link: 'https://www.asos.com/fr/nouveautes/cat/?cid=27108',
      directLink: 'https://www.asos.com/fr/nouveautes/cat/?cid=27108',
      displayLink: 'www.asos.com',
      image: 'https://images.asos-media.com/products/asos-design-ensemble-sweat-a-capuche-et-jogger-oversize-noir/204050837-1-black',
      snippet: 'Découvrez les nouveautés mode pour femme et homme, mises à jour quotidiennement. Livraison et retours gratuits.',
      price: ''
    },
    {
      title: 'Collection Automne-Hiver - Vêtements tendance',
      link: 'https://www.zara.com/fr/',
      directLink: 'https://www.zara.com/fr/',
      displayLink: 'www.zara.com',
      image: 'https://static.zara.net/photos///2022/I/0/1/p/7901/423/712/2/w/850/7901423712_1_1_1.jpg',
      snippet: 'Découvrez les nouvelles collections de vêtements, chaussures et accessoires pour femme, homme et enfant.',
      price: ''
    },
    {
      title: 'Mode éthique et responsable - Vêtements durables',
      link: 'https://www.veja-store.com/fr/',
      directLink: 'https://www.veja-store.com/fr/',
      displayLink: 'www.veja-store.com',
      image: 'https://www.veja-store.com/media/catalog/product/cache/4d7748d1b22d0fb94ae7e27ea11d5a07/v/e/veja_v-10_cwl_white_natural_cobalt_purple_vx022426a_lateral.jpg',
      snippet: 'Marque pionnière de la mode responsable, matières biologiques et commerce équitable.',
      price: ''
    }
  ]
};

/**
 * Recherche avancée de produits de mode similaires
 * @param {String} query - Requête de recherche
 * @param {String} itemType - Type d'article (sac, chaussure, etc.)
 * @param {String} color - Couleur principale de l'article
 * @returns {Array} - Produits similaires trouvés
 */
async function searchFashionProducts(query, itemType = 'default', color = '') {
  try {
    console.log(`Recherche avancée pour: "${query}" (type: ${itemType}, couleur: ${color})`);
    
    // Déterminer la catégorie pour les sites de confiance
    let category = 'clothing'; // par défaut
    
    if (itemType.includes('sac') || itemType.includes('sacoche') || itemType.includes('bag')) {
      category = 'bags';
    } 
    else if (itemType.includes('bottine') || itemType.includes('chaussure') || 
             itemType.includes('boot') || itemType.includes('shoe')) {
      category = 'shoes';
    }
    
    // Sélectionner les sites pertinents pour la catégorie
    const trustedSites = TRUSTED_FASHION_SITES[category] || TRUSTED_FASHION_SITES.clothing;
    
    // Construire la partie site: de la requête (OU logique entre les sites)
    const sitesQuery = trustedSites.map(site => `site:${site}`).join(' OR ');
    
    // Ajouter des termes spécifiques au shopping
    const shoppingTerms = 'acheter prix boutique vente produit';
    
    // Construire la requête finale
    const enhancedQuery = `(${query}) (${sitesQuery}) ${shoppingTerms}`;
    
    // Paramètres de l'API Google Custom Search
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    if (!apiKey || !cx) {
      console.warn('Clés API Google Custom Search manquantes - utilisation des résultats de secours');
      return getFallbackResults(itemType, color);
    }
    
    const params = {
      key: apiKey,
      cx: cx,
      q: enhancedQuery,
      num: 10, // Demander plus pour pouvoir filtrer
      lr: 'lang_fr', // Limiter aux résultats en français
      safe: 'active', // Filtre SafeSearch
      searchType: 'shopping', // Orienter vers les résultats de shopping si possible
      siteSearchFilter: 'e', // Inclure seulement les sites spécifiés
      sort: '' // Laisser le moteur de recherche trier par pertinence
    };
    
    // URL de recherche
    const url = `https://www.googleapis.com/customsearch/v1?${new URLSearchParams(params)}`;
    
    console.log(`URL de recherche avancée: ${url}`);
    const response = await axios.get(url);
    
    // Vérifier la réponse
    if (!response.data || !response.data.items || response.data.items.length === 0) {
      console.warn('Aucun résultat trouvé via Google Custom Search - utilisation des résultats de secours');
      return getFallbackResults(itemType, color);
    }
    
    console.log(`Nombre de résultats bruts trouvés: ${response.data.items.length}`);
    
    // Traitement et filtrage des résultats - AVEC EXTRACTION D'URL DIRECTE
    let processedResults = response.data.items.map(item => {
      // Vérifier si c'est une URL de produit
      const isProduct = directProductSearch.isProductUrl(item.link);
      
      // Extraire l'URL directe vers le produit
      const directLink = isProduct 
        ? directProductSearch.extractDirectProductUrl(item.link)
        : item.link;
      
      return {
        title: item.title || 'Produit sans titre',
        link: item.link || '',
        directLink: directLink, // Nouvelle propriété avec lien direct
        displayLink: item.displayLink || '',
        image: item.pagemap?.cse_image?.[0]?.src || 
               item.pagemap?.cse_thumbnail?.[0]?.src || 
               getPlaceholderImage(itemType, color),
        snippet: item.snippet || '',
        price: extractPrice(item.title, item.snippet),
        isDirectProductLink: isProduct // Indique si le lien mène directement à un produit
      };
    });
    
    // Filtrer les résultats sans image ou avec des liens invalides
    processedResults = processedResults.filter(item => 
      item.image && item.image !== item.link && 
      !item.link.includes('recherche') && // Éviter les pages de recherche
      !item.link.includes('search')
    );
    
    // Filtrer pour favoriser les liens directs vers les produits
    if (processedResults.some(item => item.isDirectProductLink)) {
      // Si on a des liens directs, on les privilégie
      const directProducts = processedResults.filter(item => item.isDirectProductLink);
      if (directProducts.length >= 3) {
        processedResults = directProducts;
      }
    }
    
    // Essayer d'enrichir l'information de prix si manquante
    processedResults = processedResults.map(item => {
      if (!item.price) {
        // Essayer d'extraire un prix du titre ou de la description
        const extractedPrice = extractPrice(item.title, item.snippet);
        if (extractedPrice) {
          return { ...item, price: extractedPrice };
        }
        // Sinon, attribuer un prix plausible basé sur la catégorie
        return { ...item, price: getPlausiblePrice(itemType) };
      }
      return item;
    });
    
    // S'assurer d'avoir exactement 5 résultats
    if (processedResults.length < 5) {
      console.log('Moins de 5 résultats pertinents trouvés, complétant avec des résultats de secours');
      const fallbacks = getFallbackResults(itemType, color);
      
      // Ajouter des fallbacks jusqu'à avoir 5 résultats
      for (let i = 0; i < fallbacks.length && processedResults.length < 5; i++) {
        // Éviter les doublons basés sur le titre
        if (!processedResults.some(item => item.title === fallbacks[i].title)) {
          processedResults.push(fallbacks[i]);
        }
      }
    }
    else if (processedResults.length > 5) {
      // Limiter à 5 résultats
      processedResults = processedResults.slice(0, 5);
    }
    
    console.log(`Retournant ${processedResults.length} résultats filtrés et optimisés`);
    return processedResults;
  } catch (error) {
    console.error('Erreur détaillée lors de la recherche de produits:', error);
    if (error.response) {
      console.error('Réponse d\'erreur:', error.response.data);
    }
    
    console.warn('Erreur lors de la recherche - utilisation des résultats de secours');
    return getFallbackResults(itemType, color);
  }
}

/**
 * Obtient des résultats de secours appropriés selon le type et la couleur de l'article
 * @param {String} itemType - Type d'article (sac, chaussure, etc.)
 * @param {String} color - Couleur principale de l'article
 * @returns {Array} - Résultats de secours
 */
function getFallbackResults(itemType, color) {
  // Déterminer la catégorie spécifique en fonction du type et de la couleur
  
  // Bottines marron
  if ((itemType.includes('bottine') || itemType.includes('boot') || 
       itemType.includes('chaussure') || itemType.includes('shoe')) && 
      (color.includes('marron') || color.includes('brun') || color.includes('brown'))) {
    return FALLBACK_PRODUCTS.bottines_marron;
  }
  
  // Sacs marron
  if ((itemType.includes('sac') || itemType.includes('sacoche') || 
       itemType.includes('bag') || itemType.includes('handbag')) && 
      (color.includes('marron') || color.includes('brun') || color.includes('brown'))) {
    return FALLBACK_PRODUCTS.sacs_marron;
  }
  
  // Catégorie par défaut
  return FALLBACK_PRODUCTS.default;
}

/**
 * Fonction utilitaire pour extraire un prix d'un texte
 * @param {String} title - Titre du produit
 * @param {String} snippet - Description du produit
 * @returns {String} - Prix extrait ou null
 */
function extractPrice(title, snippet) {
  const combined = `${title || ''} ${snippet || ''}`;
  
  // Recherche plus robuste de prix en différentes devises
  // Capture €, £, $, suivi d'un espace optionnel, puis d'un nombre avec décimales optionnelles
  const priceRegexEUR = /(€|EUR|euros?)\s?(\d+(?:[.,]\d{2})?)/i;
  const priceRegexUSD = /(\$|USD|dollars?)\s?(\d+(?:[.,]\d{2})?)/i;
  const priceRegexGBP = /(£|GBP|livres?)\s?(\d+(?:[.,]\d{2})?)/i;
  const priceRegexGeneric = /(\d+(?:[.,]\d{2})?)\s?(€|EUR|USD|\$|£|GBP)/i;
  const priceRegexSimple = /(\d+(?:[.,]\d{2})?)(?:\s?€)/i;
  
  // Essayer tous les formats de prix
  const matchEUR = combined.match(priceRegexEUR);
  if (matchEUR) {
    return `€${matchEUR[2].replace(',', '.')}`;
  }
  
  const matchUSD = combined.match(priceRegexUSD);
  if (matchUSD) {
    return `$${matchUSD[2].replace(',', '.')}`;
  }
  
  const matchGBP = combined.match(priceRegexGBP);
  if (matchGBP) {
    return `£${matchGBP[2].replace(',', '.')}`;
  }
  
  const matchGeneric = combined.match(priceRegexGeneric);
  if (matchGeneric) {
    return `${matchGeneric[2]}${matchGeneric[1].replace(',', '.')}`;
  }
  
  const matchSimple = combined.match(priceRegexSimple);
  if (matchSimple) {
    return `€${matchSimple[1].replace(',', '.')}`;
  }
  
  return null;
}

/**
 * Obtient une image placeholder adaptée au type de produit
 * @param {String} itemType - Type d'article
 * @param {String} color - Couleur de l'article
 * @returns {String} - URL de l'image placeholder
 */
function getPlaceholderImage(itemType, color) {
  // Si le type d'article est une bottine ou une chaussure marron
  if ((itemType.includes('bottine') || itemType.includes('chaussure') || 
       itemType.includes('boot') || itemType.includes('shoe')) && 
      (color.includes('marron') || color.includes('brun'))) {
    return 'https://images.timberland.com/is/image/timberland/10001713-HERO?$PDP-FULL-IMAGE$';
  }
  
  // Si le type d'article est un sac ou une sacoche marron
  if ((itemType.includes('sac') || itemType.includes('sacoche') || 
       itemType.includes('bag')) && 
      (color.includes('marron') || color.includes('brun'))) {
    return 'https://www.thebridgeonlineshop.com/images/products/xxlarge/06460001-14_1.jpg';
  }
  
  // Placeholder générique
  return 'https://via.placeholder.com/300x150?text=Image+non+disponible';
}

/**
 * Génère un prix plausible basé sur le type d'article
 * @param {String} itemType - Type d'article
 * @returns {String} - Prix plausible formaté
 */
function getPlausiblePrice(itemType) {
  let basePrice = 0;
  
  // Prix typiques par catégorie
  if (itemType.includes('sac') || itemType.includes('bag')) {
    basePrice = Math.floor(Math.random() * 100) + 100; // Entre 100€ et 199€
  }
  else if (itemType.includes('bottine') || itemType.includes('boot') || 
           itemType.includes('chaussure') || itemType.includes('shoe')) {
    basePrice = Math.floor(Math.random() * 150) + 80; // Entre 80€ et 229€
  }
  else if (itemType.includes('veste') || itemType.includes('manteau') || 
           itemType.includes('jacket') || itemType.includes('coat')) {
    basePrice = Math.floor(Math.random() * 200) + 100; // Entre 100€ et 299€
  }
  else {
    basePrice = Math.floor(Math.random() * 50) + 30; // Entre 30€ et 79€
  }
  
  // Formater le prix
  return `€${basePrice},${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
}

module.exports = {
  searchFashionProducts,
  getFallbackResults,
  extractPrice
};
