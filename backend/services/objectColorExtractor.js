/**
 * Service d'extraction de couleurs pour objets spécifiques
 * Isole et analyse les couleurs d'un objet spécifique dans l'image
 */

const sharp = require('sharp');
const colorDetection = require('./colorDetection');

// Liste des objets de mode pertinents qui peuvent être détectés
const FASHION_OBJECTS = [
  // Chaussures
  'Footwear', 'Shoe', 'Boot', 'Sneakers', 'High heels', 'Sandal',
  
  // Vêtements
  'Clothing', 'Outerwear', 'Dress', 'Coat', 'Jacket', 'Shirt', 'T-shirt', 
  'Pants', 'Jeans', 'Skirt', 'Shorts', 'Trousers', 'Sweater', 'Hoodie',
  'Suit', 'Top', 'Blouse',
  
  // Sacs
  'Bag', 'Handbag', 'Backpack', 'Luggage', 'Briefcase', 'Wallet', 'Purse',
  
  // Accessoires
  'Tie', 'Bow tie', 'Hat', 'Cap', 'Glasses', 'Sunglasses', 'Watch', 'Jewelry', 
  'Necklace', 'Bracelet', 'Ring', 'Earrings', 'Scarf', 'Glove', 'Belt'
];

/**
 * Trouvé l'objet principal (mode) dans la liste des objets détectés
 * @param {Array} objects - Objets détectés par Vision API
 * @returns {Object|null} - L'objet principal trouvé ou null
 */
function findMainObject(objects) {
  // Si aucun objet n'est détecté, retourner null
  if (!objects || !Array.isArray(objects) || objects.length === 0) {
    console.warn('Aucun objet détecté dans l\'image');
    return null;
  }
  
  // Priorité donnée aux objets liés à la mode
  const fashionObjects = objects.filter(obj => {
    // Certains objets pertinents pour la mode peuvent ne pas être exactement dans notre liste
    // On vérifie donc si un mot clé de notre liste est présent dans le nom de l'objet
    return FASHION_OBJECTS.some(fashionObj => 
      obj.name.toLowerCase().includes(fashionObj.toLowerCase())
    );
  });
  
  // Si des objets de mode sont trouvés, sélectionner celui avec le score le plus élevé
  if (fashionObjects.length > 0) {
    // Trier par score (confiance) pour obtenir l'objet le plus pertinent
    const sortedObjects = [...fashionObjects].sort((a, b) => b.score - a.score);
    
    // Optimisation pour les chaussures : si plusieurs objets sont détectés et que l'un d'eux est une chaussure,
    // donner la priorité à la chaussure
    const shoeObjects = sortedObjects.filter(obj => {
      const name = obj.name.toLowerCase();
      return name.includes('shoe') || name.includes('footwear') || 
             name.includes('boot') || name.includes('sneaker') ||
             name.includes('heel');
    });
    
    // Optimisation pour les sacs : si plusieurs objets sont détectés et que l'un d'eux est un sac,
    // donner la priorité au sac après les chaussures
    const bagObjects = sortedObjects.filter(obj => {
      const name = obj.name.toLowerCase();
      return name.includes('bag') || name.includes('purse') || 
             name.includes('handbag') || name.includes('backpack');
    });
    
    // Trouver l'objet le plus pertinent en fonction des priorités
    if (shoeObjects.length > 0) {
      console.log('Objet principal (chaussure) trouvé:', shoeObjects[0].name);
      return shoeObjects[0];
    } else if (bagObjects.length > 0) {
      console.log('Objet principal (sac) trouvé:', bagObjects[0].name);
      return bagObjects[0];
    } else {
      console.log('Objet principal de mode trouvé:', sortedObjects[0].name);
      return sortedObjects[0];
    }
  }
  
  // Si aucun objet de mode n'est trouvé, retourner l'objet avec le plus haut score
  if (objects.length > 0) {
    const sortedObjects = [...objects].sort((a, b) => b.score - a.score);
    console.log('Aucun objet de mode trouvé, utilisation de l\'objet principal:', sortedObjects[0].name);
    return sortedObjects[0];
  }
  
  // Si vraiment aucun objet n'est pertinent, retourner null
  return null;
}

/**
 * Extrait les couleurs spécifiques à un objet détecté
 * @param {Buffer} imageBuffer - Données de l'image
 * @param {Object} object - Objet détecté avec ses coordonnées
 * @returns {Array} - Couleurs extraites pour l'objet
 */
async function extractObjectColors(imageBuffer, object) {
  try {
    // S'assurer que l'objet a des coordonnées de délimitation
    if (!object || !object.boundingPoly || !object.boundingPoly.normalizedVertices || 
        object.boundingPoly.normalizedVertices.length < 4) {
      console.warn('Données de délimitation incomplètes, utilisation de l\'image entière');
      
      // Analyser l'image entière
      const image = sharp(imageBuffer);
      const { width, height } = await image.metadata();
      
      // Extraire les couleurs dominantes
      const pixels = await image
        .resize(100, 100, { fit: 'fill' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const { data, info } = pixels;
      const { width: resizedWidth, height: resizedHeight, channels } = info;
      
      // Analyser les couleurs avec notre service de détection de couleurs
      const dominantColors = await analyzeDominantColors(data, resizedWidth, resizedHeight, channels);
      
      return colorDetection.analyzeColors(dominantColors);
    }
    
    // Extraire les coordonnées normalisées (entre 0 et 1)
    const vertices = object.boundingPoly.normalizedVertices;
    
    // Extraire les dimensions minimales pour couvrir l'objet
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    
    vertices.forEach(vertex => {
      const { x = 0, y = 0 } = vertex; // Utiliser 0 comme valeur par défaut
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    
    // S'assurer que les coordonnées sont dans les limites (0-1)
    minX = Math.max(0, Math.min(1, minX));
    minY = Math.max(0, Math.min(1, minY));
    maxX = Math.max(0, Math.min(1, maxX));
    maxY = Math.max(0, Math.min(1, maxY));
    
    // Obtenir les métadonnées de l'image
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    
    // Calculer les coordonnées en pixels
    const region = {
      left: Math.floor(minX * width),
      top: Math.floor(minY * height),
      width: Math.ceil((maxX - minX) * width),
      height: Math.ceil((maxY - minY) * height)
    };
    
    // Vérifier que la région est valide
    if (region.width <= 0 || region.height <= 0) {
      console.warn('Région de délimitation invalide, utilisation de l\'image entière');
      
      // Analyser l'image entière
      const image = sharp(imageBuffer);
      
      // Extraire les couleurs dominantes
      const pixels = await image
        .resize(100, 100, { fit: 'fill' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const { data, info } = pixels;
      const { width: resizedWidth, height: resizedHeight, channels } = info;
      
      const dominantColors = await analyzeDominantColors(data, resizedWidth, resizedHeight, channels);
      
      return colorDetection.analyzeColors(dominantColors);
    }
    
    // Extraire la région correspondant à l'objet et redimensionner pour une analyse plus rapide
    // Utiliser un extrait plus grand pour capturer le contexte si l'objet est petit
    const objectRegion = await image
      .extract(region)
      .resize(100, 100, { fit: 'fill' }) // Redimensionner pour accélérer l'analyse
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const { data, info } = objectRegion;
    const { width: resizedWidth, height: resizedHeight, channels } = info;
    
    // Analyser les couleurs dominantes
    const dominantColors = await analyzeDominantColors(data, resizedWidth, resizedHeight, channels);
    
    // Passer les couleurs dominantes à notre service de détection
    return colorDetection.analyzeColors(dominantColors);
  } catch (error) {
    console.error('Erreur lors de l\'extraction des couleurs de l\'objet:', error);
    
    // En cas d'erreur, retourner un tableau vide
    return [];
  }
}

/**
 * Analyse les couleurs dominantes dans une image ou une région
 * @param {Buffer} data - Données brutes de l'image
 * @param {Number} width - Largeur de l'image
 * @param {Number} height - Hauteur de l'image
 * @param {Number} channels - Nombre de canaux (3 pour RGB, 4 pour RGBA)
 * @returns {Array} - Couleurs dominantes détectées
 */
async function analyzeDominantColors(data, width, height, channels) {
  // Vérifier les entrées
  if (!data || !width || !height || !channels) {
    console.warn('Données d\'image invalides pour l\'analyse des couleurs');
    return [];
  }
  
  // Créer un histogramme de couleurs
  const colorHistogram = {};
  const pixelCount = width * height;
  
  // Parcourir tous les pixels
  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    
    // Quantifier les couleurs pour réduire l'espace des couleurs
    // Chaque composante est divisée par 16 pour passer de 0-255 à 0-15
    const quantizedR = Math.floor(r / 16) * 16;
    const quantizedG = Math.floor(g / 16) * 16;
    const quantizedB = Math.floor(b / 16) * 16;
    
    // Créer une clé unique pour cette couleur
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
    
    // Incrémenter le compteur pour cette couleur
    if (colorHistogram[colorKey]) {
      colorHistogram[colorKey].count++;
    } else {
      colorHistogram[colorKey] = {
        rgb: `rgb(${quantizedR}, ${quantizedG}, ${quantizedB})`,
        color: { red: quantizedR, green: quantizedG, blue: quantizedB },
        count: 1
      };
    }
  }
  
  // Trier les couleurs par fréquence
  const sortedColors = Object.values(colorHistogram)
    .sort((a, b) => b.count - a.count);
  
  // Sélectionner les 8 couleurs les plus fréquentes (ou moins si moins sont disponibles)
  const dominantColors = sortedColors
    .slice(0, Math.min(8, sortedColors.length))
    .map(color => ({
      rgb: color.rgb,
      color: color.color,
      score: color.count / pixelCount, // Score de confiance basé sur la fréquence
      pixelFraction: color.count / pixelCount // Fraction des pixels pour cette couleur
    }));
  
  // Filtrer les couleurs trop proches en HSL
  const filteredColors = filterSimilarColors(dominantColors);
  
  return filteredColors;
}

/**
 * Filtre les couleurs similaires pour avoir une palette plus diversifiée
 * @param {Array} colors - Couleurs à filtrer
 * @returns {Array} - Couleurs filtrées
 */
function filterSimilarColors(colors) {
  // Si moins de 2 couleurs, pas besoin de filtrer
  if (!colors || colors.length < 2) {
    return colors;
  }
  
  // Convertir RGB en HSL pour une comparaison plus perceptuelle
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return [h, s, l];
  }
  
  // Calculer la distance perceptuelle entre deux couleurs en HSL
  function hslDistance(hsl1, hsl2) {
    // Différence de teinte (h) avec gestion du cercle des couleurs
    const hDiff = Math.min(Math.abs(hsl1[0] - hsl2[0]), 1 - Math.abs(hsl1[0] - hsl2[0]));
    
    // Différences de saturation (s) et luminosité (l)
    const sDiff = Math.abs(hsl1[1] - hsl2[1]);
    const lDiff = Math.abs(hsl1[2] - hsl2[2]);
    
    // Pondération pour donner plus d'importance à la teinte
    return hDiff * 2 + sDiff + lDiff;
  }
  
  // Convertir les couleurs RGB en HSL
  const colorsWithHsl = colors.map(color => {
    const { red, green, blue } = color.color;
    const hsl = rgbToHsl(red, green, blue);
    return { ...color, hsl };
  });
  
  // Filtrer les couleurs trop similaires (distance HSL < 0.15)
  const filteredColors = [];
  
  for (const color of colorsWithHsl) {
    // Vérifier si cette couleur est trop similaire à une couleur déjà sélectionnée
    const isTooSimilar = filteredColors.some(selectedColor => 
      hslDistance(color.hsl, selectedColor.hsl) < 0.15
    );
    
    if (!isTooSimilar) {
      filteredColors.push(color);
    }
  }
  
  // S'assurer qu'on a au moins 3 couleurs si possible
  if (filteredColors.length < 3 && colorsWithHsl.length >= 3) {
    // Ajouter les couleurs restantes jusqu'à avoir 3 couleurs
    const remainingColors = colorsWithHsl.filter(color => 
      !filteredColors.some(selectedColor => selectedColor === color)
    );
    
    for (let i = 0; i < remainingColors.length && filteredColors.length < 3; i++) {
      filteredColors.push(remainingColors[i]);
    }
  }
  
  // Retourner les couleurs sans les propriétés HSL
  return filteredColors.map(({ hsl, ...color }) => color);
}

module.exports = {
  findMainObject,
  extractObjectColors,
  FASHION_OBJECTS
};
