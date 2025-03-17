/**
 * Service amélioré de détection de couleurs
 * Fournit une analyse précise des couleurs avec noms en français
 */

// Correspondance RGB vers noms de couleurs en français et anglais
const COLOR_NAMES = [
  // Tons de marron
  { 
    range: [[80, 40, 0], [165, 100, 40]], 
    nameFr: 'Marron', 
    nameEn: 'Brown',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[150, 90, 40], [180, 130, 80]], 
    nameFr: 'Marron clair', 
    nameEn: 'Light brown',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[60, 30, 0], [100, 60, 30]], 
    nameFr: 'Marron foncé', 
    nameEn: 'Dark brown',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[170, 120, 70], [210, 180, 130]], 
    nameFr: 'Beige', 
    nameEn: 'Beige',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[210, 180, 140], [240, 220, 180]], 
    nameFr: 'Beige clair', 
    nameEn: 'Light beige',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[160, 110, 60], [190, 140, 90]], 
    nameFr: 'Tan', 
    nameEn: 'Tan',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[90, 50, 20], [130, 80, 40]], 
    nameFr: 'Chocolat', 
    nameEn: 'Chocolate',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[180, 130, 80], [215, 175, 130]], 
    nameFr: 'Camel', 
    nameEn: 'Camel',
    isDark: false,
    textColor: '#000000'
  },
  
  // Tons de noir/gris/blanc
  { 
    range: [[0, 0, 0], [35, 35, 35]], 
    nameFr: 'Noir', 
    nameEn: 'Black',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[36, 36, 36], [85, 85, 85]], 
    nameFr: 'Gris foncé', 
    nameEn: 'Dark gray',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[86, 86, 86], [170, 170, 170]], 
    nameFr: 'Gris', 
    nameEn: 'Gray',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[171, 171, 171], [235, 235, 235]], 
    nameFr: 'Gris clair', 
    nameEn: 'Light gray',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[236, 236, 236], [255, 255, 255]], 
    nameFr: 'Blanc', 
    nameEn: 'White',
    isDark: false,
    textColor: '#000000'
  },
  
  // Tons de bleu
  { 
    range: [[0, 0, 120], [30, 30, 180]], 
    nameFr: 'Bleu foncé', 
    nameEn: 'Dark blue',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[0, 0, 181], [65, 65, 255]], 
    nameFr: 'Bleu', 
    nameEn: 'Blue',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[66, 66, 230], [160, 200, 255]], 
    nameFr: 'Bleu clair', 
    nameEn: 'Light blue',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[0, 65, 106], [30, 90, 140]], 
    nameFr: 'Bleu marine', 
    nameEn: 'Navy blue',
    isDark: true,
    textColor: '#FFFFFF'
  },
  
  // Tons de rouge
  { 
    range: [[120, 0, 0], [200, 30, 30]], 
    nameFr: 'Rouge foncé', 
    nameEn: 'Dark red',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[201, 31, 31], [255, 70, 70]], 
    nameFr: 'Rouge', 
    nameEn: 'Red',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[181, 71, 71], [255, 150, 150]], 
    nameFr: 'Rouge clair', 
    nameEn: 'Light red',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[180, 0, 0], [255, 50, 50]], 
    nameFr: 'Rouge vif', 
    nameEn: 'Bright red',
    isDark: true,
    textColor: '#FFFFFF'
  },
  
  // Tons de vert
  { 
    range: [[0, 60, 0], [30, 120, 30]], 
    nameFr: 'Vert foncé', 
    nameEn: 'Dark green',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[31, 121, 31], [80, 200, 80]], 
    nameFr: 'Vert', 
    nameEn: 'Green',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[81, 201, 81], [170, 255, 170]], 
    nameFr: 'Vert clair', 
    nameEn: 'Light green',
    isDark: false,
    textColor: '#000000'
  },
  
  // Tons de jaune
  { 
    range: [[230, 180, 0], [255, 255, 60]], 
    nameFr: 'Jaune', 
    nameEn: 'Yellow',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[200, 150, 0], [229, 179, 0]], 
    nameFr: 'Jaune foncé', 
    nameEn: 'Dark yellow',
    isDark: false,
    textColor: '#000000'
  },
  
  // Tons de orange
  { 
    range: [[200, 80, 0], [255, 150, 50]], 
    nameFr: 'Orange', 
    nameEn: 'Orange',
    isDark: false,
    textColor: '#000000'
  },
  
  // Tons de rose
  { 
    range: [[200, 0, 130], [255, 0, 200]], 
    nameFr: 'Rose foncé', 
    nameEn: 'Dark pink',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[250, 130, 200], [255, 200, 230]], 
    nameFr: 'Rose clair', 
    nameEn: 'Light pink',
    isDark: false,
    textColor: '#000000'
  },
  
  // Tons de violet
  { 
    range: [[80, 0, 80], [150, 0, 150]], 
    nameFr: 'Violet foncé', 
    nameEn: 'Dark purple',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[151, 50, 151], [200, 100, 200]], 
    nameFr: 'Violet', 
    nameEn: 'Purple',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[201, 101, 201], [235, 190, 235]], 
    nameFr: 'Violet clair', 
    nameEn: 'Light purple',
    isDark: false,
    textColor: '#000000'
  },
  
  // Tons de turquoise et cyan
  { 
    range: [[0, 150, 150], [100, 220, 220]], 
    nameFr: 'Turquoise', 
    nameEn: 'Turquoise',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[0, 200, 230], [130, 255, 255]], 
    nameFr: 'Cyan', 
    nameEn: 'Cyan',
    isDark: false,
    textColor: '#000000'
  },
  
  // Couleurs spéciales pour les chaussures
  { 
    range: [[50, 20, 0], [90, 45, 20]], 
    nameFr: 'Cuir', 
    nameEn: 'Leather',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[130, 70, 30], [170, 100, 60]], 
    nameFr: 'Cognac', 
    nameEn: 'Cognac',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[110, 60, 30], [140, 80, 50]], 
    nameFr: 'Châtaigne', 
    nameEn: 'Chestnut',
    isDark: true,
    textColor: '#FFFFFF'
  },
  { 
    range: [[180, 160, 140], [220, 200, 180]], 
    nameFr: 'Taupe', 
    nameEn: 'Taupe',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[170, 150, 130], [190, 170, 150]], 
    nameFr: 'Cappuccino', 
    nameEn: 'Cappuccino',
    isDark: false,
    textColor: '#000000'
  },
  { 
    range: [[90, 80, 70], [120, 110, 100]], 
    nameFr: 'Anthracite', 
    nameEn: 'Anthracite',
    isDark: true,
    textColor: '#FFFFFF'
  }
];

/**
 * Convertit une couleur RGB en valeur hexadécimale
 * @param {number} r - Valeur rouge (0-255)
 * @param {number} g - Valeur verte (0-255)
 * @param {number} b - Valeur bleue (0-255)
 * @return {string} - Code couleur hexadécimal (#RRGGBB)
 */
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Détermine le nom de couleur le plus proche pour une valeur RGB donnée
 * @param {number} r - Valeur rouge (0-255)
 * @param {number} g - Valeur verte (0-255)
 * @param {number} b - Valeur bleue (0-255)
 * @return {object} - Informations sur la couleur la plus proche
 */
function findClosestColor(r, g, b) {
  // Distance euclidienne en espace RGB
  function distance(color) {
    const [[r1Min, g1Min, b1Min], [r1Max, g1Max, b1Max]] = color.range;
    
    // Vérifier si la couleur se trouve dans la plage
    if (r >= r1Min && r <= r1Max && 
        g >= g1Min && g <= g1Max && 
        b >= b1Min && b <= b1Max) {
      return 0; // Correspondance parfaite si dans la plage
    }
    
    // Trouver le point le plus proche dans la plage
    const rClosest = Math.min(Math.max(r, r1Min), r1Max);
    const gClosest = Math.min(Math.max(g, g1Min), g1Max);
    const bClosest = Math.min(Math.max(b, b1Min), b1Max);
    
    // Calculer la distance euclidienne
    return Math.sqrt(
      Math.pow(r - rClosest, 2) + 
      Math.pow(g - gClosest, 2) + 
      Math.pow(b - bClosest, 2)
    );
  }
  
  // Trouver la couleur avec la distance minimale
  let minDistance = Infinity;
  let closestColor = null;
  
  for (const color of COLOR_NAMES) {
    const dist = distance(color);
    if (dist < minDistance) {
      minDistance = dist;
      closestColor = color;
    }
  }
  
  // Si aucune correspondance trouvée (ne devrait jamais se produire)
  if (!closestColor) {
    return {
      nameFr: 'Inconnu',
      nameEn: 'Unknown',
      isDark: r + g + b < 382, // Heuristique simple pour déterminer si c'est foncé
      textColor: r + g + b < 382 ? '#FFFFFF' : '#000000',
      distance: Infinity
    };
  }
  
  // Retourner les informations sur la couleur la plus proche
  return {
    ...closestColor,
    distance: minDistance
  };
}

/**
 * Analyse les couleurs dominantes à partir des données de l'API Vision
 * @param {Array} colorData - Données de couleurs de l'API Vision
 * @return {Array} - Informations de couleurs enrichies
 */
function analyzeColors(colorData) {
  // Vérifier si les données d'entrée sont valides
  if (!colorData || !Array.isArray(colorData) || colorData.length === 0) {
    console.warn('Aucune donnée de couleur valide fournie pour l\'analyse');
    return [];
  }
  
  // Traiter chaque couleur
  return colorData.map(color => {
    try {
      // Extraire les composantes RGB du format rgb(r, g, b)
      let r, g, b;
      
      if (color.rgb) {
        // Si déjà au format rgb(r, g, b)
        const match = color.rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          r = parseInt(match[1], 10);
          g = parseInt(match[2], 10);
          b = parseInt(match[3], 10);
        }
      }
      
      // Si on a un objet color avec des propriétés r, g, b
      if (color.color) {
        r = color.color.red || 0;
        g = color.color.green || 0;
        b = color.color.blue || 0;
      }
      
      // Si on n'a pas pu extraire les composantes, retourner une couleur par défaut
      if (r === undefined || g === undefined || b === undefined) {
        console.warn('Impossible d\'extraire les composantes RGB de la couleur:', color);
        return {
          rgb: 'rgb(128, 128, 128)',
          hex: '#808080',
          red: 128,
          green: 128,
          blue: 128,
          nameFr: 'Gris',
          nameEn: 'Gray',
          score: color.score || 0,
          pixelFraction: color.pixelFraction || 0,
          isDark: true,
          textColor: '#FFFFFF'
        };
      }
      
      // Limiter les valeurs RGB à 0-255
      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
      
      // Trouver le nom de couleur le plus proche
      const colorInfo = findClosestColor(r, g, b);
      
      // Construire l'objet de couleur enrichi
      return {
        rgb: `rgb(${r}, ${g}, ${b})`,
        hex: rgbToHex(r, g, b),
        red: r,
        green: g,
        blue: b,
        nameFr: colorInfo.nameFr,
        nameEn: colorInfo.nameEn,
        score: color.score || 0,
        pixelFraction: color.pixelFraction || 0,
        isDark: colorInfo.isDark,
        textColor: colorInfo.textColor
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse d\'une couleur:', error);
      
      // En cas d'erreur, retourner une couleur par défaut
      return {
        rgb: 'rgb(128, 128, 128)',
        hex: '#808080',
        red: 128,
        green: 128,
        blue: 128,
        nameFr: 'Gris',
        nameEn: 'Gray',
        score: color.score || 0,
        pixelFraction: color.pixelFraction || 0,
        isDark: true,
        textColor: '#FFFFFF'
      };
    }
  });
}

/**
 * Génère une description textuelle pour les couleurs dominantes
 * @param {Array} colors - Couleurs analysées
 * @return {string} - Description textuelle
 */
function generateColorDescription(colors) {
  if (!colors || colors.length === 0) {
    return 'Couleur non détectée';
  }
  
  // Filtrer les couleurs selon leur importance (score et pixelFraction)
  const significantColors = colors
    .filter(c => c.pixelFraction > 0.05) // Au moins 5% de l'image
    .sort((a, b) => {
      // Combiner score et pixelFraction pour le tri
      const importanceA = a.score * Math.sqrt(a.pixelFraction);
      const importanceB = b.score * Math.sqrt(b.pixelFraction);
      return importanceB - importanceA;
    });
  
  // Si aucune couleur significative n'est trouvée, utiliser la première couleur
  if (significantColors.length === 0 && colors.length > 0) {
    return `Principalement ${colors[0].nameFr.toLowerCase()}`;
  }
  
  // Générer une description basée sur les couleurs principales
  if (significantColors.length === 1) {
    return `Principalement ${significantColors[0].nameFr.toLowerCase()}`;
  } else if (significantColors.length === 2) {
    return `${significantColors[0].nameFr} et ${significantColors[1].nameFr.toLowerCase()}`;
  } else {
    const mainColor = significantColors[0].nameFr;
    const otherColors = significantColors
      .slice(1, 3) // Limiter à 2 couleurs supplémentaires
      .map(c => c.nameFr.toLowerCase())
      .join(' et ');
    
    return `${mainColor} avec ${otherColors}`;
  }
}

module.exports = {
  analyzeColors,
  generateColorDescription,
  findClosestColor,
  rgbToHex
};
