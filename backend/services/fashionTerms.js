/**
 * Service d'analyse des termes de mode et de génération de requêtes optimisées
 * Extrait les termes relatifs à la mode et aux vêtements à partir d'une analyse d'image
 */

// Catégories de termes de mode pour classification
const FASHION_CATEGORIES = {
  // Types de vêtements
  clothing: [
    // Hauts
    'shirt', 't-shirt', 'tee', 'chemise', 'chemisier', 'blouse', 'top', 'polo', 'débardeur', 'tank top',
    'sweatshirt', 'hoodie', 'pull', 'pullover', 'sweater', 'cardigan', 'gilet', 'vest',
    'jacket', 'veste', 'blazer', 'manteau', 'coat', 'blouson', 'bomber', 'cape',
    'suit', 'costume', 'tuxedo', 'smoking',
    
    // Bas
    'pants', 'pantalon', 'jeans', 'jean', 'shorts', 'short', 'bermuda', 'chino', 'cargo',
    'skirt', 'jupe', 'legging', 'jegging', 'culotte', 'jogger', 'jogging',
    'trousers', 'pants',
    
    // Robes et combinaisons
    'dress', 'robe', 'overall', 'salopette', 'jumpsuit', 'combinaison', 'romper', 'playsuit', 'combishort',
    
    // Sous-vêtements
    'underwear', 'sous-vêtement', 'lingerie', 'bra', 'soutien-gorge', 'brief', 'boxer', 'caleçon', 'slip',
    'undershirt', 'maillot',
    
    // Vêtements de nuit
    'pyjamas', 'pajamas', 'pyjama', 'pajama', 'nightgown', 'chemise de nuit', 'nightshirt',
    
    // Maillots de bain
    'swimwear', 'swimsuit', 'maillot de bain', 'bikini', 'trunks', 'swimming trunks',
    
    // Vêtements d'extérieur
    'outerwear', 'raincoat', 'imperméable', 'trench', 'trench coat', 'coat', 'manteau', 'parka',
    'anorak', 'windbreaker', 'coupe-vent', 'doudoune', 'puffer jacket', 'down jacket',
    
    // Tailles et coupes
    'slim fit', 'coupe slim', 'regular fit', 'coupe droite', 'loose fit', 'coupe ample',
    'skinny', 'bootcut', 'straight', 'flare', 'oversized', 'taille haute', 'high waisted',
    'taille basse', 'low waisted'
  ],
  
  // Types de chaussures
  shoes: [
    // Chaussures générales
    'shoe', 'chaussure', 'footwear', 'sneaker', 'basket', 'trainer', 'tennis',
    
    // Chaussures formelles
    'dress shoe', 'richelieu', 'oxford', 'derby', 'brogue', 'loafer', 'mocassin',
    'formal shoe', 'chaussure habillée', 'monk shoe',
    
    // Bottes
    'boot', 'botte', 'bottine', 'ankle boot', 'chelsea boot', 'combat boot', 'ranger',
    'riding boot', 'botte d\'équitation', 'cowboy boot', 'botte de cowboy',
    'wellington', 'rain boot', 'botte de pluie', 'snow boot', 'après-ski',
    'chelsea', 'desert boot', 'chukka boot',
    
    // Sandales et chaussures d'été
    'sandal', 'sandale', 'flip flop', 'tong', 'slide', 'mule', 'espadrille',
    
    // Chaussures de sport
    'running shoe', 'chaussure de course', 'training shoe', 'chaussure d\'entraînement',
    'basketball shoe', 'chaussure de basket', 'football boot', 'crampons',
    'golf shoe', 'chaussure de golf', 'hiking boot', 'chaussure de randonnée',
    'trail shoe', 'chaussure de trail', 'climbing shoe', 'chaussure d\'escalade',
    
    // Chaussures spécifiques pour femmes
    'heel', 'talon', 'high heel', 'haut talon', 'stiletto', 'escarpin', 'pump',
    'platform', 'plateforme', 'wedge', 'compensé', 'ballerina', 'ballerine', 'flat',
    
    // Chaussures diverses
    'slipper', 'pantoufle', 'clog', 'sabot', 'moccasin', 'moccasin', 'deck shoe', 'bateau',
    
    // Marques populaires
    'nike', 'adidas', 'puma', 'converse', 'vans', 'new balance', 'asics', 'reebok',
    'timberland', 'dr martens', 'clarks', 'birkenstock',
    
    // Caractéristiques des chaussures
    'lace-up', 'à lacets', 'slip-on', 'velcro', 'strap', 'à sangle', 'zipper', 'à fermeture éclair',
    'buckle', 'à boucle', 'elasticated', 'élastique',
    
    // Matériaux spécifiques aux chaussures
    'leather shoe', 'chaussure en cuir', 'suede shoe', 'chaussure en daim', 'canvas shoe', 'chaussure en toile',
    'patent leather', 'cuir verni', 'mesh', 'maille'
  ],
  
  // Types de sacs
  bags: [
    // Sacs généraux
    'bag', 'sac', 'handbag', 'sac à main', 'purse', 'sacoche',
    
    // Types spécifiques de sacs
    'tote', 'cabas', 'backpack', 'sac à dos', 'shoulder bag', 'sac à bandoulière',
    'clutch', 'pochette', 'messenger bag', 'besace', 'crossbody', 'sac croisé',
    'hobo bag', 'bucket bag', 'sac seau', 'duffle bag', 'sac de voyage',
    'weekender', 'bumbag', 'fanny pack', 'sac banane', 'pouch', 'trousse',
    'briefcase', 'mallette', 'porte-documents', 'suitcase', 'valise',
    'shopping bag', 'sac de courses', 'gym bag', 'sac de sport',
    
    // Marques populaires
    'louis vuitton', 'chanel', 'hermes', 'birkin', 'kelly', 'gucci', 'prada', 'dior',
    'balenciaga', 'celine', 'coach', 'michael kors', 'longchamp', 'eastpak',
    
    // Caractéristiques de sacs
    'handle', 'anse', 'strap', 'bandoulière', 'zipper', 'fermeture éclair',
    'clasp', 'fermoir', 'buckle', 'boucle', 'chain', 'chaîne', 'pocket', 'poche',
    'compartment', 'compartiment', 'adjustable', 'ajustable',
    
    // Matériaux spécifiques aux sacs
    'leather bag', 'sac en cuir', 'canvas bag', 'sac en toile', 'nylon bag', 'sac en nylon',
    'suede bag', 'sac en daim', 'fabric bag', 'sac en tissu'
  ],
  
  // Accessoires de mode
  accessories: [
    // Accessoires pour la tête
    'hat', 'chapeau', 'cap', 'casquette', 'beret', 'béret', 'beanie', 'bonnet',
    'fedora', 'panama', 'sun hat', 'chapeau de soleil', 'bucket hat', 'bob',
    'headband', 'bandeau', 'hair clip', 'barrette', 'hair band', 'élastique',
    'scrunchie', 'chouchou', 'hair pin', 'épingle à cheveux',

    // Accessoires pour le cou
    'scarf', 'écharpe', 'shawl', 'châle', 'snood', 'circle scarf', 'tour de cou',
    'necktie', 'cravate', 'bow tie', 'nœud papillon', 'pocket square', 'pochette',
    'ascot', 'lavallière', 'choker', 'collier ras-du-cou',
    
    // Bijoux
    'jewelry', 'bijou', 'necklace', 'collier', 'bracelet', 'bangle', 'cuff',
    'earring', 'boucle d\'oreille', 'ring', 'bague', 'watch', 'montre',
    'brooch', 'broche', 'anklet', 'bracelet de cheville', 'pendant', 'pendentif',
    'chain', 'chaîne', 'amulet', 'charm', 'breloque',
    
    // Lunettes
    'glasses', 'lunettes', 'sunglasses', 'lunettes de soleil', 'eyeglasses',
    'eyewear', 'spectacles', 'shades',
    
    // Ceintures et bretelles
    'belt', 'ceinture', 'suspenders', 'bretelles',
    
    // Gants et mitaines
    'glove', 'gant', 'mitten', 'mitaine', 'fingerless glove', 'gant sans doigts',
    
    // Autres accessoires
    'tie clip', 'pince à cravate', 'cufflink', 'bouton de manchette',
    'wallet', 'portefeuille', 'card holder', 'porte-cartes', 'keyring', 'porte-clés',
    'umbrella', 'parapluie', 'fan', 'éventail'
  ],
  
  // Matériaux 
  materials: [
    // Tissus naturels
    'cotton', 'coton', 'wool', 'laine', 'silk', 'soie', 'linen', 'lin',
    'leather', 'cuir', 'suede', 'daim', 'nubuck', 'sheepskin', 'peau de mouton',
    'cashmere', 'cachemire', 'mohair', 'angora', 'alpaca', 'alpaga',
    'fur', 'fourrure', 'felt', 'feutre', 'down', 'duvet',
    
    // Tissus synthétiques
    'polyester', 'nylon', 'acrylic', 'acrylique', 'viscose', 'rayon', 'spandex', 'elastane', 'élasthanne',
    'lycra', 'microfiber', 'microfibre', 'pleather', 'simili-cuir', 'faux leather', 'faux cuir',
    'faux fur', 'fausse fourrure', 'vinyl', 'vinyle', 'pu leather', 'cuir PU',
    
    // Motifs et textures
    'denim', 'jean', 'velvet', 'velours', 'corduroy', 'velours côtelé', 'tweed',
    'satin', 'chiffon', 'taffeta', 'taffetas', 'lace', 'dentelle',
    'mesh', 'filet', 'tulle', 'knit', 'maille', 'quilted', 'matelassé',
    'canvas', 'toile', 'jersey', 'fleece', 'polaire', 'twill', 'sergé',
    
    // Traitements
    'washed', 'lavé', 'distressed', 'usé', 'embroidered', 'brodé',
    'printed', 'imprimé', 'perforated', 'perforé', 'studded', 'clouté',
    'frayed', 'effiloché', 'ripped', 'déchiré', 'stained', 'délavé',
    'waxed', 'ciré', 'coated', 'enduit', 'waterproof', 'imperméable'
  ],
  
  // Marques et designers
  brands: [
    // Luxe et haute couture
    'chanel', 'dior', 'louis vuitton', 'gucci', 'prada', 'hermès', 'hermes', 'yves saint laurent', 'saint laurent',
    'balenciaga', 'valentino', 'armani', 'versace', 'fendi', 'burberry', 'givenchy',
    'celine', 'céline', 'loewe', 'bottega veneta', 'balmain', 'alexander mcqueen', 'stella mccartney',
    
    // Fast-fashion et grand public
    'zara', 'h&m', 'mango', 'uniqlo', 'topshop', 'asos', 'gap', 'banana republic',
    'forever 21', 'primark', 'pull & bear', 'bershka', 'stradivarius', 'massimo dutti',
    
    // Sportswear
    'nike', 'adidas', 'puma', 'reebok', 'under armour', 'new balance', 'asics',
    'fila', 'lacoste', 'converse', 'vans', 'jordan', 'lululemon', 'the north face',
    
    // Denim et casual
    'levi\'s', 'levis', 'diesel', 'g-star raw', 'true religion', 'wrangler', 'lee',
    'tommy hilfiger', 'calvin klein', 'ralph lauren', 'polo ralph lauren', 'superdry',
    
    // Chaussures spécifiques
    'dr martens', 'clarks', 'timberland', 'ugg', 'birkenstock', 'havaianas', 'crocs',
    'christian louboutin', 'manolo blahnik', 'jimmy choo', 'stuart weitzman',
    
    // Marques françaises
    'sandro', 'maje', 'zadig & voltaire', 'the kooples', 'isabel marant', 'jacquemus',
    'agnès b', 'agnes b', 'comptoir des cotonniers', 'petit bateau'
  ],
  
  // Styles et occasions
  styles: [
    // Styles généraux
    'casual', 'formel', 'formal', 'elegant', 'élégant', 'chic', 'smart casual',
    'business', 'bohème', 'bohemian', 'classique', 'classic', 'vintage', 'retro', 'rétro',
    'modern', 'moderne', 'contemporary', 'contemporain', 'trendy', 'tendance',
    'minimalist', 'minimaliste', 'maximalist', 'maximaliste', 'edgy', 'streetwear',
    
    // Styles plus spécifiques
    'preppy', 'athleisure', 'sportswear', 'urban', 'urbain', 'grunge', 'punk',
    'rock', 'goth', 'gothic', 'lolita', 'kawaii', 'hip hop', 'skater', 'surf',
    'normcore', 'y2k', 'cottagecore', 'dark academia', 'light academia',
    
    // Occasions
    'wedding', 'mariage', 'cocktail', 'party', 'soirée', 'evening', 'black tie',
    'office', 'bureau', 'work', 'travail', 'weekend', 'vacation', 'vacances',
    'beach', 'plage', 'resort', 'winter', 'hiver', 'summer', 'été',
    'spring', 'printemps', 'fall', 'automne', 'festival', 'gym', 'workout',
    'sport', 'hiking', 'randonnée', 'outdoor', 'extérieur'
  ]
};

// Types de vêtements communs avec leurs caractéristiques typiques
const FASHION_ITEM_MAPPINGS = {
  // Chaussures
  'chelsea boot': ['boot', 'bottine', 'chelsea', 'ankle boot', 'bottine chelsea', 'elastic', 'élastique'],
  'combat boot': ['boot', 'bottine', 'combat', 'military', 'militaire', 'lace-up', 'à lacets'],
  'ankle boot': ['boot', 'bottine', 'ankle', 'cheville', 'short boot', 'bottine courte'],
  'desert boot': ['boot', 'bottine', 'desert', 'chukka', 'suede', 'daim'],
  'hiking boot': ['boot', 'bottine', 'hiking', 'randonnée', 'outdoor', 'trail'],
  'riding boot': ['boot', 'botte', 'riding', 'équitation', 'knee-high', 'haute'],
  'wellington boot': ['boot', 'botte', 'wellington', 'rain', 'pluie', 'rubber', 'caoutchouc'],
  'cowboy boot': ['boot', 'botte', 'cowboy', 'western', 'pointed toe', 'bout pointu'],
  'sneaker': ['shoe', 'chaussure', 'sneaker', 'basket', 'trainer', 'tennis', 'casual'],
  'loafer': ['shoe', 'chaussure', 'loafer', 'mocassin', 'slip-on', 'casual', 'formal'],
  'oxford': ['shoe', 'chaussure', 'oxford', 'formal', 'formel', 'lace-up', 'à lacets'],
  'derby': ['shoe', 'chaussure', 'derby', 'formal', 'formel', 'lace-up', 'à lacets'],
  'brogue': ['shoe', 'chaussure', 'brogue', 'perforated', 'perforé', 'formal', 'formel'],
  'sandal': ['shoe', 'chaussure', 'sandal', 'sandale', 'summer', 'été', 'open toe', 'bout ouvert'],
  'high heel': ['shoe', 'chaussure', 'heel', 'talon', 'high heel', 'haut talon', 'stiletto', 'escarpin'],
  'flat': ['shoe', 'chaussure', 'flat', 'ballet flat', 'ballerine', 'no heel', 'sans talon'],
  'espadrille': ['shoe', 'chaussure', 'espadrille', 'summer', 'été', 'rope sole', 'semelle en corde'],
  
  // Sacs
  'tote bag': ['bag', 'sac', 'tote', 'cabas', 'shopping bag', 'sac de courses'],
  'crossbody bag': ['bag', 'sac', 'crossbody', 'cross-body', 'sac bandoulière', 'shoulder bag'],
  'shoulder bag': ['bag', 'sac', 'shoulder', 'épaule', 'sac à bandoulière'],
  'backpack': ['bag', 'sac', 'backpack', 'sac à dos', 'rucksack'],
  'clutch': ['bag', 'sac', 'clutch', 'pochette', 'evening bag', 'sac de soirée'],
  'messenger bag': ['bag', 'sac', 'messenger', 'besace', 'satchel', 'sacoche'],
  'briefcase': ['bag', 'sac', 'briefcase', 'porte-documents', 'mallette', 'business', 'travail'],
  'hobo bag': ['bag', 'sac', 'hobo', 'crescent', 'croissant', 'slouchy', 'décontracté'],
  'bucket bag': ['bag', 'sac', 'bucket', 'seau', 'drawstring', 'cordon'],
  'fanny pack': ['bag', 'sac', 'fanny pack', 'belt bag', 'sac banane', 'waist bag'],
  
  // Hauts
  't-shirt': ['top', 'hauts', 't-shirt', 'tee', 'short sleeve', 'manche courte', 'casual'],
  'shirt': ['top', 'hauts', 'shirt', 'chemise', 'button-up', 'button-down', 'formal', 'formel'],
  'blouse': ['top', 'hauts', 'blouse', 'chemisier', 'feminine', 'féminin', 'dressy'],
  'sweater': ['top', 'hauts', 'sweater', 'pull', 'pullover', 'jumper', 'knit', 'tricot'],
  'hoodie': ['top', 'hauts', 'hoodie', 'sweatshirt à capuche', 'casual', 'hood', 'capuche'],
  'sweatshirt': ['top', 'hauts', 'sweatshirt', 'sweat', 'casual', 'cotton', 'coton'],
  'vest': ['top', 'hauts', 'vest', 'gilet', 'sleeveless', 'sans manches', 'layering'],
  'cardigan': ['top', 'hauts', 'cardigan', 'button-up sweater', 'gilet boutonné', 'knit', 'tricot'],
  'tank top': ['top', 'hauts', 'tank top', 'débardeur', 'sleeveless', 'sans manches', 'casual'],
  'jacket': ['outerwear', 'vêtement d\'extérieur', 'jacket', 'veste', 'casual', 'lightweight'],
  'blazer': ['outerwear', 'vêtement d\'extérieur', 'blazer', 'veste de costume', 'formal', 'formel'],
  'coat': ['outerwear', 'vêtement d\'extérieur', 'coat', 'manteau', 'winter', 'hiver', 'warm'],
  
  // Bas
  'jeans': ['bottom', 'bas', 'jeans', 'jean', 'denim', 'casual', 'everyday', 'quotidien'],
  'chinos': ['bottom', 'bas', 'chinos', 'chino pants', 'pantalon chino', 'casual', 'cotton', 'coton'],
  'shorts': ['bottom', 'bas', 'shorts', 'short', 'summer', 'été', 'casual'],
  'skirt': ['bottom', 'bas', 'skirt', 'jupe', 'feminine', 'féminin'],
  'leggings': ['bottom', 'bas', 'leggings', 'stretch', 'tight', 'moulant', 'casual'],
  'trousers': ['bottom', 'bas', 'trousers', 'pantalon', 'formal', 'formel', 'dressy'],
  'joggers': ['bottom', 'bas', 'joggers', 'jogging', 'sweatpants', 'casual', 'athleisure'],
  
  // Robes
  'dress': ['full garment', 'vêtement complet', 'dress', 'robe', 'feminine', 'féminin'],
  'maxi dress': ['full garment', 'vêtement complet', 'maxi dress', 'robe longue', 'ankle length', 'longueur cheville'],
  'midi dress': ['full garment', 'vêtement complet', 'midi dress', 'robe mi-longue', 'mid-calf', 'mi-mollet'],
  'mini dress': ['full garment', 'vêtement complet', 'mini dress', 'robe courte', 'above knee', 'au-dessus du genou'],
  'cocktail dress': ['full garment', 'vêtement complet', 'cocktail dress', 'robe de cocktail', 'formal', 'formel'],
  'evening gown': ['full garment', 'vêtement complet', 'evening gown', 'robe de soirée', 'formal', 'formel'],
  'sundress': ['full garment', 'vêtement complet', 'sundress', 'robe d\'été', 'summer', 'été', 'casual'],
  
  // Combinaisons
  'jumpsuit': ['full garment', 'vêtement complet', 'jumpsuit', 'combinaison', 'one-piece', 'une pièce'],
  'romper': ['full garment', 'vêtement complet', 'romper', 'combishort', 'playsuit', 'short jumpsuit'],
  'overalls': ['full garment', 'vêtement complet', 'overalls', 'salopette', 'dungarees', 'casual']
};

/**
 * Extrait les termes de mode des labels détectés
 * @param {Array} labels - Labels détectés par l'API Vision
 * @return {Object} - Termes de mode classés par catégories
 */
function extractFashionTerms(labels) {
  // Vérification des entrées
  if (!labels || !Array.isArray(labels)) {
    console.warn('Aucun label valide fourni pour l\'extraction des termes de mode');
    return {
      clothing: [],
      shoes: [],
      bags: [],
      accessories: [],
      materials: [],
      brands: [],
      styles: [],
      colors: []
    };
  }
  
  // Normaliser les labels
  const normalizedLabels = labels.map(label => {
    // Si label est un objet avec une propriété 'description'
    if (typeof label === 'object' && label.description) {
      return {
        description: label.description.toLowerCase(),
        score: label.score || 0
      };
    }
    // Si label est une chaîne
    else if (typeof label === 'string') {
      return {
        description: label.toLowerCase(),
        score: 1.0
      };
    }
    // Invalide
    return {
      description: '',
      score: 0
    };
  }).filter(label => label.description.length > 0);
  
  // Initialiser les résultats
  const results = {
    clothing: [],
    shoes: [],
    bags: [],
    accessories: [],
    materials: [],
    brands: [],
    styles: [],
    colors: []
  };
  
  // Extraire les termes selon les catégories
  normalizedLabels.forEach(label => {
    const { description, score } = label;
    
    // Parcourir toutes les catégories
    for (const [category, terms] of Object.entries(FASHION_CATEGORIES)) {
      // Vérifier si la description correspond à un terme de la catégorie
      for (const term of terms) {
        if (description.includes(term.toLowerCase())) {
          // Ajouter à la catégorie correspondante s'il n'y est pas déjà
          const resultCategory = 
            category === 'clothing' ? 'clothing' :
            category === 'shoes' ? 'shoes' :
            category === 'bags' ? 'bags' :
            category === 'accessories' ? 'accessories' :
            category === 'materials' ? 'materials' :
            category === 'brands' ? 'brands' :
            category === 'styles' ? 'styles' : 'other';
          
          // Ajouter le terme à la catégorie s'il n'existe pas déjà
          if (!results[resultCategory].some(item => item.term === term)) {
            // L'objet complet avec le score et le terme
            results[resultCategory].push({
              term,
              score,
              match: description
            });
          }
          
          // Une fois trouvé, pas besoin de vérifier d'autres termes pour cette description
          break;
        }
      }
    }
  });
  
  // Trier les résultats par score pour chaque catégorie
  for (const category in results) {
    results[category].sort((a, b) => b.score - a.score);
  }
  
  // Diagnostic et analyse avancée pour items spécifiques
  analyzeSpecificItems(normalizedLabels, results);
  
  return results;
}

/**
 * Analyse les labels pour identifier des items spécifiques et leurs caractéristiques
 * @param {Array} labels - Labels normalisés
 * @param {Object} results - Résultats d'extraction de termes
 */
function analyzeSpecificItems(labels, results) {
  // Parcourir les mappings d'items spécifiques
  for (const [item, characteristics] of Object.entries(FASHION_ITEM_MAPPINGS)) {
    // Vérifier si un des labels contient l'item
    for (const label of labels) {
      if (label.description.includes(item.toLowerCase())) {
        // Ajouter toutes les caractéristiques associées
        characteristics.forEach(char => {
          // Déterminer dans quelle catégorie placer cette caractéristique
          let category = 'styles';
          
          if (FASHION_CATEGORIES.clothing.includes(char)) category = 'clothing';
          else if (FASHION_CATEGORIES.shoes.includes(char)) category = 'shoes';
          else if (FASHION_CATEGORIES.bags.includes(char)) category = 'bags';
          else if (FASHION_CATEGORIES.accessories.includes(char)) category = 'accessories';
          else if (FASHION_CATEGORIES.materials.includes(char)) category = 'materials';
          else if (FASHION_CATEGORIES.brands.includes(char)) category = 'brands';
          
          // Ajouter la caractéristique si elle n'existe pas déjà
          if (!results[category].some(existing => existing.term === char)) {
            results[category].push({
              term: char,
              score: label.score * 0.9, // Légèrement moins sûr que le terme original
              match: `dérivé de ${item}`,
              derived: true
            });
          }
        });
        
        // Ajouter l'item lui-même s'il n'est pas déjà présent
        const mainCategory = 
          item.includes('boot') || item.includes('shoe') || item.includes('sneaker') ? 'shoes' :
          item.includes('bag') ? 'bags' :
          'clothing';
        
        if (!results[mainCategory].some(existing => existing.term === item)) {
          results[mainCategory].push({
            term: item,
            score: label.score,
            match: label.description,
            exact: true
          });
        }
        
        break; // Sortir de la boucle des labels une fois trouvé
      }
    }
  }
  
  // Recherche avancée des termes de marques avec une pondération plus précise
  labels.forEach(label => {
    FASHION_CATEGORIES.brands.forEach(brand => {
      // Vérifier l'occurrence exacte de la marque
      if (label.description === brand.toLowerCase() || 
          label.description.includes(` ${brand.toLowerCase()} `)) {
        if (!results.brands.some(existing => existing.term === brand)) {
          results.brands.push({
            term: brand,
            score: label.score * 1.2, // Priorité plus élevée pour les correspondances exactes de marques
            match: label.description,
            exact: true
          });
        }
      }
    });
  });
}

/**
 * Génère une requête optimisée à partir des termes extraits et des couleurs
 * @param {Object} terms - Termes de mode extraits
 * @param {Array} colors - Couleurs détectées
 * @return {String} - Requête optimisée pour la recherche
 */
function generateOptimizedQuery(terms, colors) {
  // Vérification des entrées
  if (!terms) {
    console.warn('Aucun terme fourni pour la génération de requête');
    return 'vêtement mode';
  }
  
  // Accumulateurs de termes pour la requête
  const queryTerms = {
    itemType: [], // Type d'article (chaussure, sac, etc.)
    itemDetails: [], // Détails spécifiques (chelsea boot, tote bag, etc.)
    brands: [], // Marques détectées
    materials: [], // Matériaux (cuir, daim, etc.)
    styles: [], // Styles (casual, elegant, etc.)
    colors: [] // Couleurs principales
  };
  
  // Analyser les termes pour construire la requête
  
  // 1. Identifier le type principal d'article
  let mainCategory = '';
  let mainItemScore = 0;
  
  // Trouver la catégorie principale selon le score
  ['shoes', 'bags', 'clothing'].forEach(category => {
    if (terms[category] && terms[category].length > 0) {
      const topItem = terms[category][0];
      if (topItem.score > mainItemScore) {
        mainCategory = category;
        mainItemScore = topItem.score;
      }
    }
  });
  
  // 2. Ajouter les termes en fonction de la catégorie principale
  if (mainCategory) {
    // Ajouter les termes spécifiques à la catégorie principale
    terms[mainCategory].slice(0, 3).forEach(item => {
      const termFr = translateTerm(item.term);
      
      // Si c'est un terme spécifique (ex: chelsea boot), l'ajouter aux détails
      if (item.exact || item.term.includes(' ')) {
        queryTerms.itemDetails.push(termFr);
      } 
      // Sinon, l'ajouter au type d'article
      else {
        queryTerms.itemType.push(termFr);
      }
    });
    
    // Ajouter les marques pertinentes (max 1)
    if (terms.brands && terms.brands.length > 0) {
      queryTerms.brands.push(terms.brands[0].term);
    }
    
    // Ajouter les matériaux pertinents (max 2)
    if (terms.materials && terms.materials.length > 0) {
      terms.materials.slice(0, 2).forEach(material => {
        queryTerms.materials.push(translateTerm(material.term));
      });
    }
    
    // Ajouter les styles pertinents (max 2)
    if (terms.styles && terms.styles.length > 0) {
      terms.styles.slice(0, 2).forEach(style => {
        queryTerms.styles.push(translateTerm(style.term));
      });
    }
  } else {
    // Si aucune catégorie principale n'est identifiée, utiliser des termes génériques
    queryTerms.itemType.push('vêtement');
    queryTerms.styles.push('mode');
  }
  
  // 3. Ajouter les couleurs
  if (colors && colors.length > 0) {
    // Ajouter jusqu'à 2 couleurs principales
    colors.slice(0, 2).forEach(color => {
      if (color.nameFr) {
        queryTerms.colors.push(color.nameFr.toLowerCase());
      }
    });
  }
  
  // 4. Construire la requête finale
  let query = '';
  
  // Commencer par le type spécifique s'il existe
  if (queryTerms.itemDetails.length > 0) {
    query += queryTerms.itemDetails.join(' ') + ' ';
  } 
  // Sinon, utiliser le type général
  else if (queryTerms.itemType.length > 0) {
    query += queryTerms.itemType.join(' ') + ' ';
  }
  
  // Ajouter les matériaux
  if (queryTerms.materials.length > 0) {
    query += queryTerms.materials.join(' ') + ' ';
  }
  
  // Ajouter les couleurs
  if (queryTerms.colors.length > 0) {
    query += queryTerms.colors.join(' ') + ' ';
  }
  
  // Ajouter les styles
  if (queryTerms.styles.length > 0) {
    query += queryTerms.styles.join(' ') + ' ';
  }
  
  // Ajouter les marques à la fin
  if (queryTerms.brands.length > 0) {
    query += queryTerms.brands.join(' ') + ' ';
  }
  
  // Ajouter un terme commercial pour améliorer la recherche
  query += 'acheter';
  
  // Log de la requête générée
  console.log('Requête générée:', query);
  
  return query.trim();
}

/**
 * Traduit un terme de l'anglais vers le français si nécessaire
 * @param {String} term - Terme à traduire
 * @return {String} - Terme traduit
 */
function translateTerm(term) {
  // Dictionnaire de traduction pour les termes communs
  const translations = {
    // Types de vêtements
    'shoe': 'chaussure',
    'boot': 'bottine',
    'chelsea boot': 'bottine chelsea',
    'ankle boot': 'bottine',
    'combat boot': 'boots militaires',
    'hiking boot': 'chaussure de randonnée',
    'sneaker': 'basket',
    'loafer': 'mocassin',
    'sandal': 'sandale',
    'high heel': 'talon haut',
    'flat': 'ballerine',
    
    // Sacs
    'bag': 'sac',
    'backpack': 'sac à dos',
    'tote': 'cabas',
    'shoulder bag': 'sac à bandoulière',
    'crossbody': 'sac bandoulière',
    'clutch': 'pochette',
    'messenger bag': 'besace',
    'briefcase': 'porte-documents',
    'bucket bag': 'sac seau',
    'fanny pack': 'sac banane',
    
    // Matériaux
    'leather': 'cuir',
    'suede': 'daim',
    'canvas': 'toile',
    'cotton': 'coton',
    'denim': 'jean',
    'wool': 'laine',
    'silk': 'soie',
    'synthetic': 'synthétique',
    'nylon': 'nylon',
    'polyester': 'polyester',
    
    // Styles
    'casual': 'décontracté',
    'formal': 'formel',
    'elegant': 'élégant',
    'sport': 'sport',
    'vintage': 'vintage',
    'modern': 'moderne',
    'classic': 'classique',
    'trendy': 'tendance',
    'streetwear': 'streetwear',
    'business': 'business'
  };
  
  // Retourner la traduction si disponible, sinon le terme original
  return translations[term.toLowerCase()] || term;
}

module.exports = {
  extractFashionTerms,
  generateOptimizedQuery,
  FASHION_CATEGORIES,
  FASHION_ITEM_MAPPINGS
};
