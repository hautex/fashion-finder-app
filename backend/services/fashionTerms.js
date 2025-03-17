/**
 * Service contenant les termes liés à la mode et leurs traductions
 * Permet d'améliorer la qualité des requêtes de recherche et la traduction des termes détectés
 */

// Dictionnaire de vêtements et accessoires avec traductions anglais-français
const FASHION_DICTIONARY = {
  // Vêtements du haut
  'shirt': { fr: 'chemise', categories: ['haut'], gender: 'both' },
  'tshirt': { fr: 't-shirt', categories: ['haut'], gender: 'both' },
  't-shirt': { fr: 't-shirt', categories: ['haut'], gender: 'both' },
  'top': { fr: 'haut', categories: ['haut'], gender: 'women' },
  'blouse': { fr: 'chemisier', categories: ['haut'], gender: 'women' },
  'sweater': { fr: 'pull', categories: ['haut'], gender: 'both' },
  'jumper': { fr: 'pull', categories: ['haut'], gender: 'both' },
  'sweatshirt': { fr: 'sweat', categories: ['haut'], gender: 'both' },
  'hoodie': { fr: 'sweat à capuche', categories: ['haut'], gender: 'both' },
  'cardigan': { fr: 'gilet', categories: ['haut'], gender: 'both' },
  'tank top': { fr: 'débardeur', categories: ['haut'], gender: 'both' },
  'jersey': { fr: 'maillot', categories: ['haut'], gender: 'both' },
  
  // Vêtements du bas
  'pants': { fr: 'pantalon', categories: ['bas'], gender: 'both' },
  'trousers': { fr: 'pantalon', categories: ['bas'], gender: 'both' },
  'jeans': { fr: 'jean', categories: ['bas'], gender: 'both' },
  'shorts': { fr: 'short', categories: ['bas'], gender: 'both' },
  'skirt': { fr: 'jupe', categories: ['bas'], gender: 'women' },
  'leggings': { fr: 'legging', categories: ['bas'], gender: 'women' },
  
  // Robes et combinaisons
  'dress': { fr: 'robe', categories: ['complet'], gender: 'women' },
  'gown': { fr: 'robe de soirée', categories: ['complet'], gender: 'women' },
  'jumpsuit': { fr: 'combinaison', categories: ['complet'], gender: 'both' },
  'romper': { fr: 'combishort', categories: ['complet'], gender: 'women' },
  'playsuit': { fr: 'combishort', categories: ['complet'], gender: 'women' },
  
  // Vêtements d'extérieur
  'jacket': { fr: 'veste', categories: ['extérieur'], gender: 'both' },
  'coat': { fr: 'manteau', categories: ['extérieur'], gender: 'both' },
  'blazer': { fr: 'blazer', categories: ['extérieur'], gender: 'both' },
  'suit': { fr: 'costume', categories: ['extérieur'], gender: 'men' },
  'raincoat': { fr: 'imperméable', categories: ['extérieur'], gender: 'both' },
  'vest': { fr: 'gilet', categories: ['extérieur'], gender: 'both' },
  'waistcoat': { fr: 'gilet', categories: ['extérieur'], gender: 'men' },
  'poncho': { fr: 'poncho', categories: ['extérieur'], gender: 'both' },
  'cape': { fr: 'cape', categories: ['extérieur'], gender: 'both' },
  
  // Chaussures
  'shoes': { fr: 'chaussures', categories: ['chaussures'], gender: 'both' },
  'sneakers': { fr: 'baskets', categories: ['chaussures'], gender: 'both' },
  'boots': { fr: 'bottes', categories: ['chaussures'], gender: 'both' },
  'heels': { fr: 'talons', categories: ['chaussures'], gender: 'women' },
  'flats': { fr: 'ballerines', categories: ['chaussures'], gender: 'women' },
  'sandals': { fr: 'sandales', categories: ['chaussures'], gender: 'both' },
  'loafers': { fr: 'mocassins', categories: ['chaussures'], gender: 'both' },
  'slippers': { fr: 'chaussons', categories: ['chaussures'], gender: 'both' },
  'espadrilles': { fr: 'espadrilles', categories: ['chaussures'], gender: 'both' },
  
  // Sacs et accessoires
  'bag': { fr: 'sac', categories: ['accessoires'], gender: 'both' },
  'handbag': { fr: 'sac à main', categories: ['accessoires'], gender: 'women' },
  'purse': { fr: 'sac à main', categories: ['accessoires'], gender: 'women' },
  'backpack': { fr: 'sac à dos', categories: ['accessoires'], gender: 'both' },
  'briefcase': { fr: 'porte-documents', categories: ['accessoires'], gender: 'both' },
  'clutch': { fr: 'pochette', categories: ['accessoires'], gender: 'women' },
  'tote': { fr: 'cabas', categories: ['accessoires'], gender: 'both' },
  'wallet': { fr: 'portefeuille', categories: ['accessoires'], gender: 'both' },
  'belt': { fr: 'ceinture', categories: ['accessoires'], gender: 'both' },
  'hat': { fr: 'chapeau', categories: ['accessoires'], gender: 'both' },
  'cap': { fr: 'casquette', categories: ['accessoires'], gender: 'both' },
  'scarf': { fr: 'écharpe', categories: ['accessoires'], gender: 'both' },
  'gloves': { fr: 'gants', categories: ['accessoires'], gender: 'both' },
  'tie': { fr: 'cravate', categories: ['accessoires'], gender: 'men' },
  'bow tie': { fr: 'nœud papillon', categories: ['accessoires'], gender: 'men' },
  'watch': { fr: 'montre', categories: ['accessoires'], gender: 'both' },
  'jewelry': { fr: 'bijoux', categories: ['accessoires'], gender: 'both' },
  'necklace': { fr: 'collier', categories: ['accessoires'], gender: 'both' },
  'bracelet': { fr: 'bracelet', categories: ['accessoires'], gender: 'both' },
  'ring': { fr: 'bague', categories: ['accessoires'], gender: 'both' },
  'earrings': { fr: 'boucles d\'oreilles', categories: ['accessoires'], gender: 'women' },
  'satchel': { fr: 'sacoche', categories: ['accessoires'], gender: 'both' },
  'messenger bag': { fr: 'sacoche', categories: ['accessoires'], gender: 'both' },
  'crossbody bag': { fr: 'sac bandoulière', categories: ['accessoires'], gender: 'both' },
  
  // Sous-vêtements
  'underwear': { fr: 'sous-vêtements', categories: ['sous-vêtements'], gender: 'both' },
  'bra': { fr: 'soutien-gorge', categories: ['sous-vêtements'], gender: 'women' },
  'panties': { fr: 'culotte', categories: ['sous-vêtements'], gender: 'women' },
  'boxer': { fr: 'boxer', categories: ['sous-vêtements'], gender: 'men' },
  'briefs': { fr: 'slip', categories: ['sous-vêtements'], gender: 'men' },
  'lingerie': { fr: 'lingerie', categories: ['sous-vêtements'], gender: 'women' },
  
  // Styles de vêtements
  'formal': { fr: 'formel', categories: ['style'], gender: 'both' },
  'casual': { fr: 'décontracté', categories: ['style'], gender: 'both' },
  'sportswear': { fr: 'vêtements de sport', categories: ['style'], gender: 'both' },
  'athletic': { fr: 'athlétique', categories: ['style'], gender: 'both' },
  'elegant': { fr: 'élégant', categories: ['style'], gender: 'both' },
  'vintage': { fr: 'vintage', categories: ['style'], gender: 'both' },
  'retro': { fr: 'rétro', categories: ['style'], gender: 'both' },
  'minimalist': { fr: 'minimaliste', categories: ['style'], gender: 'both' },
  'bohemian': { fr: 'bohème', categories: ['style'], gender: 'both' },
  'streetwear': { fr: 'streetwear', categories: ['style'], gender: 'both' },
  'boho': { fr: 'bohème', categories: ['style'], gender: 'both' },
  'chic': { fr: 'chic', categories: ['style'], gender: 'both' },
  'preppy': { fr: 'preppy', categories: ['style'], gender: 'both' },
  'punk': { fr: 'punk', categories: ['style'], gender: 'both' },
  
  // Matériaux
  'leather': { fr: 'cuir', categories: ['matériau'], gender: 'both' },
  'cotton': { fr: 'coton', categories: ['matériau'], gender: 'both' },
  'wool': { fr: 'laine', categories: ['matériau'], gender: 'both' },
  'silk': { fr: 'soie', categories: ['matériau'], gender: 'both' },
  'denim': { fr: 'denim', categories: ['matériau'], gender: 'both' },
  'linen': { fr: 'lin', categories: ['matériau'], gender: 'both' },
  'polyester': { fr: 'polyester', categories: ['matériau'], gender: 'both' },
  'nylon': { fr: 'nylon', categories: ['matériau'], gender: 'both' },
  'suede': { fr: 'daim', categories: ['matériau'], gender: 'both' },
  'velvet': { fr: 'velours', categories: ['matériau'], gender: 'both' },
  'satin': { fr: 'satin', categories: ['matériau'], gender: 'both' },
  'cashmere': { fr: 'cachemire', categories: ['matériau'], gender: 'both' },
  'canvas': { fr: 'toile', categories: ['matériau'], gender: 'both' },
  
  // Couleurs (certaines peuvent être détectées directement par l'API Vision)
  'black': { fr: 'noir', categories: ['couleur'], gender: 'both' },
  'white': { fr: 'blanc', categories: ['couleur'], gender: 'both' },
  'red': { fr: 'rouge', categories: ['couleur'], gender: 'both' },
  'blue': { fr: 'bleu', categories: ['couleur'], gender: 'both' },
  'navy': { fr: 'bleu marine', categories: ['couleur'], gender: 'both' },
  'green': { fr: 'vert', categories: ['couleur'], gender: 'both' },
  'yellow': { fr: 'jaune', categories: ['couleur'], gender: 'both' },
  'purple': { fr: 'violet', categories: ['couleur'], gender: 'both' },
  'pink': { fr: 'rose', categories: ['couleur'], gender: 'both' },
  'orange': { fr: 'orange', categories: ['couleur'], gender: 'both' },
  'brown': { fr: 'marron', categories: ['couleur'], gender: 'both' },
  'grey': { fr: 'gris', categories: ['couleur'], gender: 'both' },
  'gray': { fr: 'gris', categories: ['couleur'], gender: 'both' },
  'beige': { fr: 'beige', categories: ['couleur'], gender: 'both' },
  'silver': { fr: 'argenté', categories: ['couleur'], gender: 'both' },
  'gold': { fr: 'doré', categories: ['couleur'], gender: 'both' },
  'burgundy': { fr: 'bordeaux', categories: ['couleur'], gender: 'both' },
  'teal': { fr: 'turquoise', categories: ['couleur'], gender: 'both' },
  'khaki': { fr: 'kaki', categories: ['couleur'], gender: 'both' },
  'olive': { fr: 'olive', categories: ['couleur'], gender: 'both' },
  'mustard': { fr: 'moutarde', categories: ['couleur'], gender: 'both' },
  'lavender': { fr: 'lavande', categories: ['couleur'], gender: 'both' },
  
  // Motifs
  'pattern': { fr: 'motif', categories: ['motif'], gender: 'both' },
  'striped': { fr: 'rayé', categories: ['motif'], gender: 'both' },
  'checkered': { fr: 'à carreaux', categories: ['motif'], gender: 'both' },
  'plaid': { fr: 'écossais', categories: ['motif'], gender: 'both' },
  'polka dot': { fr: 'à pois', categories: ['motif'], gender: 'both' },
  'floral': { fr: 'floral', categories: ['motif'], gender: 'both' },
  'paisley': { fr: 'cachemire', categories: ['motif'], gender: 'both' },
  'animal print': { fr: 'imprimé animal', categories: ['motif'], gender: 'both' },
  'geometric': { fr: 'géométrique', categories: ['motif'], gender: 'both' },
  'abstract': { fr: 'abstrait', categories: ['motif'], gender: 'both' }
};

/**
 * Traduit un terme anglais en français (normalisé en minuscule)
 * @param {string} term - Terme en anglais à traduire
 * @returns {string} - Traduction française ou le terme original si non trouvé
 */
function translateToFrench(term) {
  if (!term) return '';
  
  term = term.toLowerCase().trim();
  
  // Vérifier si le terme existe directement dans le dictionnaire
  if (FASHION_DICTIONARY[term]) {
    return FASHION_DICTIONARY[term].fr;
  }
  
  // Chercher des mots composés ou des termes partiels
  for (const [key, value] of Object.entries(FASHION_DICTIONARY)) {
    if (term.includes(key)) {
      return value.fr;
    }
  }
  
  // Chercher des correspondances plurielles (supprimer le 's' final)
  if (term.endsWith('s') && FASHION_DICTIONARY[term.slice(0, -1)]) {
    return FASHION_DICTIONARY[term.slice(0, -1)].fr;
  }
  
  // Retourner le terme original si aucune traduction n'est trouvée
  return term;
}

/**
 * Identifie la catégorie d'un terme de mode
 * @param {string} term - Terme à catégoriser (en anglais)
 * @returns {string[]} - Tableau des catégories ou vide si non trouvé
 */
function identifyCategory(term) {
  if (!term) return [];
  
  term = term.toLowerCase().trim();
  
  // Vérifier si le terme existe directement dans le dictionnaire
  if (FASHION_DICTIONARY[term]) {
    return FASHION_DICTIONARY[term].categories;
  }
  
  // Chercher des mots composés ou des termes partiels
  for (const [key, value] of Object.entries(FASHION_DICTIONARY)) {
    if (term.includes(key)) {
      return value.categories;
    }
  }
  
  // Chercher des correspondances plurielles (supprimer le 's' final)
  if (term.endsWith('s') && FASHION_DICTIONARY[term.slice(0, -1)]) {
    return FASHION_DICTIONARY[term.slice(0, -1)].categories;
  }
  
  return [];
}

/**
 * Extrait les termes liés à la mode à partir d'une liste de labels
 * @param {Array} labels - Tableau d'objets label de Google Vision API
 * @returns {Object} - Termes classés par catégorie (vêtements, matériaux, couleurs, etc.)
 */
function extractFashionTerms(labels) {
  const result = {
    clothing: [],    // Vêtements
    materials: [],   // Matériaux
    colors: [],      // Couleurs
    styles: [],      // Styles
    patterns: [],    // Motifs
    other: []        // Autres termes
  };
  
  if (!labels || !Array.isArray(labels)) return result;
  
  labels.forEach(label => {
    if (!label.description) return;
    
    const term = label.description.toLowerCase().trim();
    const termWords = term.split(' ');
    
    // Essayer de trouver des correspondances pour chaque mot individuel et pour le terme complet
    [...termWords, term].forEach(word => {
      if (FASHION_DICTIONARY[word]) {
        const categories = FASHION_DICTIONARY[word].categories;
        
        if (categories.includes('haut') || categories.includes('bas') || 
            categories.includes('complet') || categories.includes('extérieur') || 
            categories.includes('chaussures') || categories.includes('sous-vêtements')) {
          if (!result.clothing.includes(word)) {
            result.clothing.push(word);
          }
        } else if (categories.includes('matériau')) {
          if (!result.materials.includes(word)) {
            result.materials.push(word);
          }
        } else if (categories.includes('couleur')) {
          if (!result.colors.includes(word)) {
            result.colors.push(word);
          }
        } else if (categories.includes('style')) {
          if (!result.styles.includes(word)) {
            result.styles.push(word);
          }
        } else if (categories.includes('motif')) {
          if (!result.patterns.includes(word)) {
            result.patterns.push(word);
          }
        } else if (categories.includes('accessoires')) {
          if (!result.clothing.includes(word)) {
            result.clothing.push(word);
          }
        } else {
          if (!result.other.includes(word)) {
            result.other.push(word);
          }
        }
      }
      // Termes non reconnus spécifiquement mais qui pourraient être pertinents
      else if (!result.other.includes(word) && word.length > 3) {
        result.other.push(word);
      }
    });
  });
  
  return result;
}

/**
 * Génère une requête de recherche optimisée à partir des termes de mode extraits
 * @param {Object} fashionTerms - Termes classés par catégorie
 * @param {Array} colors - Couleurs détectées par le service de détection de couleurs
 * @returns {string} - Requête de recherche optimisée
 */
function generateOptimizedQuery(fashionTerms, colors = []) {
  let query = [];
  
  // Ajouter les vêtements détectés (en privilégiant la traduction française)
  if (fashionTerms.clothing.length > 0) {
    const translatedClothing = fashionTerms.clothing.map(item => translateToFrench(item));
    query = query.concat(translatedClothing);
  }
  
  // Ajouter les couleurs (priorité aux couleurs détectées par le service colorDetection)
  let colorTerms = [];
  if (colors && colors.length > 0) {
    colorTerms = colors.slice(0, 2).map(color => color.nameFr || color.nameEn || '');
  } else if (fashionTerms.colors.length > 0) {
    colorTerms = fashionTerms.colors.map(color => translateToFrench(color));
  }
  
  // Filtrer les couleurs vides
  colorTerms = colorTerms.filter(color => color && color.length > 0);
  query = query.concat(colorTerms);
  
  // Ajouter les matériaux
  if (fashionTerms.materials.length > 0) {
    const translatedMaterials = fashionTerms.materials.map(material => translateToFrench(material));
    query = query.concat(translatedMaterials);
  }
  
  // Ajouter les styles (limités à 2 maximum)
  if (fashionTerms.styles.length > 0) {
    const translatedStyles = fashionTerms.styles
      .slice(0, 2)
      .map(style => translateToFrench(style));
    query = query.concat(translatedStyles);
  }
  
  // Ajouter des termes commerciaux (toujours utiles pour la recherche)
  query.push('acheter');
  
  // Si aucun terme de vêtement n'a été identifié, ajouter un terme générique
  if (fashionTerms.clothing.length === 0) {
    query.push('vêtement');
  }
  
  // Nettoyer la requête (supprimer les doublons, filtrer les chaînes vides)
  const cleanedQuery = [...new Set(query)]
    .filter(term => term && term.length > 0)
    .join(' ');
  
  return cleanedQuery;
}

module.exports = {
  FASHION_DICTIONARY,
  translateToFrench,
  identifyCategory,
  extractFashionTerms,
  generateOptimizedQuery
};
