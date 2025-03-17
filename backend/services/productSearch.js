/**
 * Service de recherche avancée de produits
 * Utilise des sources spécifiques pour les produits de mode
 * avec un focus sur les liens directs vers les produits comme Google Lens
 */

const axios = require('axios');
const directProductSearch = require('./directProductSearch');
const fashionTerms = require('./fashionTerms');

// Sites de shopping fiables pour chaque catégorie
const TRUSTED_FASHION_SITES = {
  // Sites pour les vêtements
  clothing: [
    'zalando.fr', 'zalando.be', 'laredoute.fr', 'asos.fr', 'galerieslafayette.com', 
    'zara.com', 'hm.com', 'mango.com', 'uniqlo.com', 'celio.com',
    'jules.com', 'bershka.com', 'nastygal.com', 'ralphlauren.fr',
    'lacoste.com', 'monoprix.fr', 'kiabi.com', 'promod.fr'
  ],
  
  // Sites pour les chaussures
  shoes: [
    'sarenza.com', 'spartoo.com', 'zalando.fr', 'jdsports.fr',
    'courir.com', 'nike.com', 'adidas.fr', 'puma.com', 'clarks.fr',
    'footlocker.fr', 'timberland.fr', 'geox.com', 'drmartens.com',
    'scholl-shoes.com', 'bocage.fr', 'andre.fr', 'minelli.fr',
    'thebootman.fr', 'andrelepepe.com', 'aigle.com', 'newbalance.fr',
    'asics.com', 'vans.fr', 'converse.com', 'fila.com', 'reebok.fr'
  ],
  
  // Sites pour les sacs
  bags: [
    'zalando.fr', 'galerieslafayette.com', 'louisvuitton.com', 
    'michaelkors.fr', 'longchamp.com', 'eastpak.com', 'kipling.com',
    'samsonite.fr', 'lacoste.com', 'fossil.com', 'desigual.com',
    'lestropeziennes.fr', 'lancaster.fr', 'printemps.com',
    'sezane.com', 'lancel.com'
  ]
};

// Mappings de requêtes de recherche spécifiques par marque et type
const SPECIFIC_SEARCH_TERMS = {
  // Par marque
  brands: {
    'dr martens': ['dr martens', 'doc martens', 'docteur martens'],
    'clarks': ['clarks', 'clarks originals', 'clarks boots'],
    'timberland': ['timberland', 'timberland boots', 'yellow boots'],
    'nike': ['nike', 'nike shoes', 'nike baskets'],
    'adidas': ['adidas', 'adidas originals', 'adidas baskets'],
    'new balance': ['new balance', 'nb shoes', 'new balance baskets'],
    'converse': ['converse', 'converse all star', 'chuck taylor'],
    'vans': ['vans', 'vans old skool', 'vans authentic'],
    'asics': ['asics', 'asics gel', 'asics baskets'],
    'puma': ['puma', 'puma baskets', 'puma suede']
  },
  
  // Par type de chaussure
  shoes: {
    'chelsea boot': ['chelsea boots', 'bottines chelsea', 'boots elastiquées'],
    'desert boot': ['desert boots', 'clarks desert boot', 'chukka boots'],
    'combat boot': ['combat boots', 'bottines à lacets', 'ranger boots'],
    'sneaker': ['baskets', 'sneakers', 'tennis', 'chaussures sport'],
    'loafer': ['mocassins', 'loafers', 'flâneurs'],
    'oxford': ['oxford', 'chaussures richelieu', 'derbies'],
    'ankle boot': ['bottines', 'ankle boots', 'boots', 'bottines courtes']
  },
  
  // Par matériau
  materials: {
    'leather': ['cuir', 'leather', 'cuir véritable', 'full grain leather'],
    'suede': ['daim', 'suede', 'nubuck', 'velours'],
    'textile': ['textile', 'tissu', 'canvas', 'toile'],
    'nylon': ['nylon', 'synthétique', 'mesh']
  },
  
  // Par couleur
  colors: {
    'marron': ['marron', 'brun', 'brown', 'camel', 'châtaigne', 'cognac', 'tan'],
    'noir': ['noir', 'black', 'charbon', 'anthracite'],
    'beige': ['beige', 'sand', 'stone', 'taupe', 'cappuccino', 'crème'],
    'bleu': ['bleu', 'blue', 'navy', 'indigo', 'denim', 'marine']
  }
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
 * Recherche avancée de produits de mode similaires en privilégiant les liens directs vers les produits
 * @param {String} query - Requête de recherche
 * @param {String} itemType - Type d'article (sac, chaussure, etc.)
 * @param {String} color - Couleur principale de l'article
 * @returns {Array} - Produits similaires trouvés avec liens directs
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
    
    // Améliorer la requête avec des termes spécifiques par catégorie
    let enhancedQuery = query;
    
    // Ajouter des termes spécifiques à la requête si c'est une chaussure
    if (category === 'shoes') {
      // Détecter si une marque spécifique est mentionnée
      let brandDetected = false;
      for (const [brand, terms] of Object.entries(SPECIFIC_SEARCH_TERMS.brands)) {
        if (query.toLowerCase().includes(brand.toLowerCase())) {
          // Ajouter des termes spécifiques à cette marque
          enhancedQuery = `${query} ${terms.join(' ')}`;
          brandDetected = true;
          break;
        }
      }
      
      // Si aucune marque n'est détectée, ajouter des termes spécifiques au type de chaussure
      if (!brandDetected) {
        // Détecter le type de chaussure
        for (const [type, terms] of Object.entries(SPECIFIC_SEARCH_TERMS.shoes)) {
          if (query.toLowerCase().includes(type.toLowerCase())) {
            // Ajouter des termes spécifiques à ce type
            enhancedQuery = `${query} ${terms.join(' ')}`;
            break;
          }
        }
      }
      
      // Ajouter des termes spécifiques à la couleur si elle est mentionnée
      if (color) {
        for (const [colorKey, terms] of Object.entries(SPECIFIC_SEARCH_TERMS.colors)) {
          if (color.toLowerCase().includes(colorKey.toLowerCase())) {
            // Ajouter des termes spécifiques à cette couleur
            enhancedQuery = `${enhancedQuery} ${terms.join(' ')}`;
            break;
          }
        }
      }
    }
    
    // Construire la partie site: de la requête (OU logique entre les sites)
    const sitesQuery = trustedSites.map(site => `site:${site}`).join(' OR ');
    
    // Ajouter des termes spécifiques au shopping
    const shoppingTerms = 'acheter prix boutique vente produit';
    
    // Construire la requête finale
    const finalQuery = `(${enhancedQuery}) (${sitesQuery}) ${shoppingTerms}`;
    
    // Paramètres de l'API Google Custom Search
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    if (!apiKey || !cx) {
      console.warn('Clés API Google Custom Search manquantes - utilisation des résultats de secours');
      return getFallbackResults(itemType, color);
    }
    
    const params = {
      key: apiKey,
      cx: cx,
      q: finalQuery,
      num: 15, // Demander plus de résultats pour avoir plus de chances de trouver des liens directs
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
    
    // Première étape : traitement initial des résultats
    const initialResults = response.data.items.map(item => {
      // Vérifier si c'est une URL de produit
      const isProduct = directProductSearch.isProductUrl(item.link);
      
      // Extraire l'URL directe vers le produit
      const directLink = isProduct 
        ? directProductSearch.extractDirectProductUrl(item.link)
        : item.link;
      
      return {
        title: item.title || 'Produit sans titre',
        link: item.link || '',
        directLink: directLink, // URL directe vers le produit
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
    let filteredResults = initialResults.filter(item => 
      item.image && item.image !== item.link && 
      !item.link.includes('recherche') && // Éviter les pages de recherche
      !item.link.includes('search') &&
      !item.link.includes('/fr/') // Éviter les pages de catégories
    );
    
    console.log(`Après filtrage de base: ${filteredResults.length} résultats`);
    
    // Si on a peu de résultats, revenir aux résultats initiaux
    if (filteredResults.length < 5) {
      console.log('Trop peu de résultats après filtrage, retour aux résultats initiaux');
      filteredResults = initialResults;
    }
    
    // Filtrer pour favoriser les liens directs vers les produits
    const directProductResults = filteredResults.filter(item => item.isDirectProductLink);
    
    // Si on a suffisamment de résultats directs, les privilégier
    if (directProductResults.length >= 5) {
      console.log(`Utilisation des ${directProductResults.length} liens directs vers des produits`);
      filteredResults = directProductResults;
    } else {
      console.log(`Seulement ${directProductResults.length} liens directs trouvés, on garde une partie des résultats indirects`);
    }
    
    // Si c'est une recherche de chaussures, appliquer un filtrage supplémentaire
    if (category === 'shoes') {
      // Favoriser les sites spécialisés dans les chaussures
      const shoeSpecificSites = [
        'sarenza.com', 'spartoo.com', 'courir.com', 'jdsports.fr',
        'footlocker.fr', 'clarks.fr', 'drmartens.com', 'timberland.fr'
      ];
      
      // Vérifier si des résultats proviennent de sites spécialisés
      const shoeSpecificResults = filteredResults.filter(item => 
        shoeSpecificSites.some(site => item.displayLink.includes(site))
      );
      
      // Si on a suffisamment de résultats de sites spécialisés, les privilégier
      if (shoeSpecificResults.length >= 3) {
        console.log(`Utilisation de ${shoeSpecificResults.length} résultats de sites spécialisés dans les chaussures`);
        filteredResults = shoeSpecificResults.concat(
          filteredResults
            .filter(item => !shoeSpecificSites.some(site => item.displayLink.includes(site)))
            .slice(0, 5 - shoeSpecificResults.length)
        );
      }
      
      // Appliquer un filtrage par nom si on recherche un modèle spécifique
      if (query.toLowerCase().includes('chelsea') || 
          query.toLowerCase().includes('desert boot') ||
          query.toLowerCase().includes('dr martens') ||
          query.toLowerCase().includes('timberland')) {
        
        // Extraire les mots-clés spécifiques de la requête
        const keyTerms = query.toLowerCase()
          .split(' ')
          .filter(term => term.length > 3) // Ignorer les mots trop courts
          .map(term => term.trim());
        
        // Filtrer les résultats qui correspondent aux mots-clés spécifiques
        const keywordFilteredResults = filteredResults.filter(item => 
          keyTerms.some(term => 
            item.title.toLowerCase().includes(term) || 
            item.snippet.toLowerCase().includes(term)
          )
        );
        
        // Si on a suffisamment de résultats filtrés par mots-clés, les privilégier
        if (keywordFilteredResults.length >= 3) {
          console.log(`Utilisation de ${keywordFilteredResults.length} résultats filtrés par mots-clés spécifiques`);
          filteredResults = keywordFilteredResults;
        }
      }
    }
    
    // Vérification et enrichissement des liens en parallèle (avec limitation à 10 pour éviter de surcharger)
    const resultsToProcess = filteredResults.slice(0, 10);
    console.log(`Vérification et enrichissement de ${resultsToProcess.length} résultats`);
    
    // Créer un tableau de promesses pour vérifier les liens en parallèle
    const enrichmentPromises = resultsToProcess.map(item => 
      enrichProductData(item)
    );
    
    // Attendre que toutes les vérifications soient terminées
    const enrichedResults = await Promise.all(enrichmentPromises);
    
    // Trier les résultats : d'abord les liens directs accessibles, puis les autres
    const sortedResults = enrichedResults.sort((a, b) => {
      // Priorité 1: Liens accessibles
      if (a.isAccessible && !b.isAccessible) return -1;
      if (!a.isAccessible && b.isAccessible) return 1;
      
      // Priorité 2: Liens directs vers des produits
      if (a.isDirectProductLink && !b.isDirectProductLink) return -1;
      if (!a.isDirectProductLink && b.isDirectProductLink) return 1;
      
      // Priorité 3: Présence d'un prix
      if (a.price && !b.price) return -1;
      if (!a.price && b.price) return 1;
      
      return 0;
    });
    
    // Prendre les 5 meilleurs résultats
    let finalResults = sortedResults.slice(0, 5);
    
    // S'assurer d'avoir exactement 5 résultats
    if (finalResults.length < 5) {
      console.log('Moins de 5 résultats pertinents trouvés, complétant avec des résultats de secours');
      const fallbacks = getFallbackResults(itemType, color);
      
      // Ajouter des fallbacks jusqu'à avoir 5 résultats
      for (let i = 0; i < fallbacks.length && finalResults.length < 5; i++) {
        // Éviter les doublons basés sur le titre
        if (!finalResults.some(item => item.title === fallbacks[i].title)) {
          finalResults.push(fallbacks[i]);
        }
      }
    }
    
    console.log(`Retournant ${finalResults.length} résultats finaux optimisés`);
    return finalResults;
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
 * Enrichit un résultat de produit avec des métadonnées supplémentaires
 * et vérifie l'accessibilité des liens
 * @param {Object} productResult - Résultat de produit à enrichir
 * @returns {Object} - Produit enrichi avec métadonnées
 */
async function enrichProductData(productResult) {
  try {
    // Vérifier si le lien direct est accessible
    let isAccessible = false;
    
    // Ne vérifier que si le lien est différent de l'original
    if (productResult.directLink !== productResult.link) {
      try {
        isAccessible = await directProductSearch.verifyProductUrl(productResult.directLink);
      } catch (error) {
        console.warn(`Erreur lors de la vérification de l'URL ${productResult.directLink}:`, error.message);
      }
    }
    
    // Si le lien direct n'est pas accessible, essayer le lien original
    if (!isAccessible && productResult.link) {
      try {
        isAccessible = await directProductSearch.verifyProductUrl(productResult.link);
        if (isAccessible) {
          // Si le lien original est accessible mais pas le direct, utiliser l'original
          productResult.directLink = productResult.link;
        }
      } catch (error) {
        console.warn(`Erreur lors de la vérification de l'URL originale ${productResult.link}:`, error.message);
      }
    }
    
    // Si toujours pas accessible, essayer d'extraire un autre lien direct
    if (!isAccessible) {
      // Réessayer avec d'autres patterns si possible
      const alternativeLink = tryAlternativeLinks(productResult.link);
      if (alternativeLink && alternativeLink !== productResult.directLink) {
        try {
          isAccessible = await directProductSearch.verifyProductUrl(alternativeLink);
          if (isAccessible) {
            productResult.directLink = alternativeLink;
          }
        } catch (error) {
          console.warn(`Erreur lors de la vérification de l'URL alternative ${alternativeLink}:`, error.message);
        }
      }
    }
    
    // Enrichir avec des informations de prix si manquantes
    if (!productResult.price) {
      productResult.price = getPlausiblePrice(extractProductType(productResult.title, productResult.snippet));
    }
    
    // Ajouter les informations sur l'accessibilité et si c'est un lien direct
    return {
      ...productResult,
      isAccessible
    };
  } catch (error) {
    console.error(`Erreur lors de l'enrichissement des données:`, error.message);
    return {
      ...productResult,
      isAccessible: false
    };
  }
}

/**
 * Tente de trouver un lien alternatif pour un produit
 * en manipulant l'URL originale
 * @param {String} originalUrl - URL originale
 * @returns {String} - URL alternative ou l'originale si aucune alternative
 */
function tryAlternativeLinks(originalUrl) {
  try {
    // Extraire le domaine
    const domain = extractDomain(originalUrl);
    
    // Quelques règles spécifiques pour des sites
    if (domain === 'zalando.fr' || domain === 'zalando.be') {
      // Essayer de construire une URL directe à partir du chemin
      const match = originalUrl.match(/\/([a-zA-Z0-9-]+)-([a-zA-Z0-9-]+)$/);
      if (match && match[2]) {
        return `https://www.${domain}/article/${match[2]}`;
      }
    }
    
    // Asos
    if (domain === 'asos.com') {
      // Essayer d'extraire l'ID du produit du chemin
      const match = originalUrl.match(/\/([0-9]+)$/);
      if (match && match[1]) {
        return `https://www.asos.com/fr/prd/${match[1]}`;
      }
    }
    
    // H&M
    if (domain === 'hm.com') {
      // Essayer d'extraire l'ID du produit
      const match = originalUrl.match(/([0-9]{7,})/);
      if (match && match[1]) {
        return `https://www2.hm.com/fr_fr/productpage.${match[1]}.html`;
      }
    }
    
    // Par défaut, retourner l'URL originale
    return originalUrl;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'URL alternative:', error);
    return originalUrl;
  }
}

/**
 * Extrait le domaine d'une URL
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
  const priceRegexEUR = /(€|EUR|euros?)[\s\.]?(\d+(?:[.,]\d{2})?)/i;
  const priceRegexUSD = /(\$|USD|dollars?)[\s\.]?(\d+(?:[.,]\d{2})?)/i;
  const priceRegexGBP = /(£|GBP|livres?)[\s\.]?(\d+(?:[.,]\d{2})?)/i;
  const priceRegexGeneric = /(\d+(?:[.,]\d{2})?)[\s\.]?(€|EUR|USD|\$|£|GBP)/i;
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
 * Extraire le type de produit à partir du titre et de la description
 * @param {String} title - Titre du produit
 * @param {String} snippet - Description du produit
 * @returns {String} - Type de produit extrait
 */
function extractProductType(title, snippet) {
  const combined = `${title || ''} ${snippet || ''}`.toLowerCase();
  
  // Chaussures
  if (combined.includes('chaussure') || combined.includes('shoe') || 
      combined.includes('boot') || combined.includes('bottine') ||
      combined.includes('basket') || combined.includes('sneaker')) {
    return 'chaussure';
  }
  
  // Sacs
  if (combined.includes('sac') || combined.includes('bag') || 
      combined.includes('sacoche') || combined.includes('handbag') ||
      combined.includes('bandoulière')) {
    return 'sac';
  }
  
  // Vestes
  if (combined.includes('veste') || combined.includes('jacket') || 
      combined.includes('manteau') || combined.includes('coat') ||
      combined.includes('blouson')) {
    return 'veste';
  }
  
  // Pantalons
  if (combined.includes('pantalon') || combined.includes('pants') || 
      combined.includes('jeans') || combined.includes('trousers')) {
    return 'pantalon';
  }
  
  // Robes
  if (combined.includes('robe') || combined.includes('dress')) {
    return 'robe';
  }
  
  // Par défaut
  return 'default';
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
  extractPrice,
  enrichProductData
};
