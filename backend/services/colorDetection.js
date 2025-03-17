/**
 * Service de détection des couleurs amélioré
 * Permet une analyse plus fine et précise des couleurs détectées par Google Vision API
 */

// Table de correspondance RGB vers noms de couleurs courants en français et en anglais
const COLOR_NAMES = {
  // Noir, gris, blanc
  'black': { fr: 'Noir', ranges: [[0, 30], [0, 30], [0, 30]] },
  'darkgray': { fr: 'Gris foncé', ranges: [[30, 70], [30, 70], [30, 70]] },
  'gray': { fr: 'Gris', ranges: [[70, 130], [70, 130], [70, 130]] },
  'lightgray': { fr: 'Gris clair', ranges: [[130, 200], [130, 200], [130, 200]] },
  'white': { fr: 'Blanc', ranges: [[200, 255], [200, 255], [200, 255]] },
  
  // Bleus
  'navy': { fr: 'Bleu marine', ranges: [[0, 50], [0, 50], [50, 100]] },
  'darkblue': { fr: 'Bleu foncé', ranges: [[0, 30], [0, 50], [100, 170]] },
  'blue': { fr: 'Bleu', ranges: [[0, 50], [50, 150], [170, 255]] },
  'lightblue': { fr: 'Bleu clair', ranges: [[50, 130], [130, 200], [200, 255]] },
  'turquoise': { fr: 'Turquoise', ranges: [[0, 100], [150, 255], [170, 255]] },
  
  // Verts
  'darkgreen': { fr: 'Vert foncé', ranges: [[0, 60], [50, 100], [0, 60]] },
  'green': { fr: 'Vert', ranges: [[0, 80], [100, 200], [0, 100]] },
  'lightgreen': { fr: 'Vert clair', ranges: [[100, 180], [170, 255], [100, 180]] },
  'olive': { fr: 'Olive', ranges: [[50, 100], [80, 130], [0, 50]] },
  
  // Rouges
  'burgundy': { fr: 'Bordeaux', ranges: [[80, 130], [0, 50], [20, 60]] },
  'darkred': { fr: 'Rouge foncé', ranges: [[120, 160], [0, 60], [0, 60]] },
  'red': { fr: 'Rouge', ranges: [[160, 255], [0, 80], [0, 80]] },
  
  // Jaunes, oranges
  'brown': { fr: 'Marron', ranges: [[80, 150], [30, 90], [0, 50]] },
  'orange': { fr: 'Orange', ranges: [[200, 255], [80, 170], [0, 70]] },
  'gold': { fr: 'Or', ranges: [[180, 255], [150, 200], [0, 80]] },
  'yellow': { fr: 'Jaune', ranges: [[200, 255], [200, 255], [0, 100]] },
  
  // Roses, violets
  'pink': { fr: 'Rose', ranges: [[200, 255], [100, 200], [150, 220]] },
  'lightpink': { fr: 'Rose clair', ranges: [[240, 255], [180, 240], [200, 255]] },
  'magenta': { fr: 'Magenta', ranges: [[180, 255], [0, 100], [100, 200]] },
  'purple': { fr: 'Violet', ranges: [[80, 180], [0, 80], [80, 180]] },
  
  // Beiges, crèmes
  'beige': { fr: 'Beige', ranges: [[190, 240], [170, 220], [130, 180]] },
  'cream': { fr: 'Crème', ranges: [[240, 255], [230, 255], [200, 240]] },
};

/**
 * Détermine le nom de la couleur la plus proche à partir d'une valeur RGB
 * @param {Object} rgbColor - Objet contenant les valeurs R, G, B (entre 0 et 255)
 * @param {String} language - Langue de retour ('fr' ou 'en')
 * @returns {String} - Nom de la couleur dans la langue demandée
 */
function getColorName(rgbColor, language = 'fr') {
  // Extraire les composantes RGB
  const { red, green, blue } = rgbColor;
  
  // Stocker le meilleur match et sa distance
  let bestMatch = null;
  let minDistance = Infinity;
  
  // Parcourir toutes les couleurs nommées
  for (const [colorKey, colorData] of Object.entries(COLOR_NAMES)) {
    const ranges = colorData.ranges;
    
    // Vérifier si la couleur est dans les plages définies
    const redInRange = red >= ranges[0][0] && red <= ranges[0][1];
    const greenInRange = green >= ranges[1][0] && green <= ranges[1][1];
    const blueInRange = blue >= ranges[2][0] && blue <= ranges[2][1];
    
    // Si toutes les composantes sont dans les plages, calculer la distance
    if (redInRange && greenInRange && blueInRange) {
      // Calculer le centre de chaque plage
      const redCenter = (ranges[0][0] + ranges[0][1]) / 2;
      const greenCenter = (ranges[1][0] + ranges[1][1]) / 2;
      const blueCenter = (ranges[2][0] + ranges[2][1]) / 2;
      
      // Calculer la distance euclidienne entre la couleur et le centre de la plage
      const distance = Math.sqrt(
        Math.pow(red - redCenter, 2) +
        Math.pow(green - greenCenter, 2) +
        Math.pow(blue - blueCenter, 2)
      );
      
      // Si c'est la plus petite distance trouvée, mémoriser cette couleur
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = colorKey;
      }
    }
  }
  
  // Si aucune correspondance n'a été trouvée, utiliser la méthode de distance la plus proche
  if (!bestMatch) {
    for (const [colorKey, colorData] of Object.entries(COLOR_NAMES)) {
      const ranges = colorData.ranges;
      
      // Calculer le centre de chaque plage
      const redCenter = (ranges[0][0] + ranges[0][1]) / 2;
      const greenCenter = (ranges[1][0] + ranges[1][1]) / 2;
      const blueCenter = (ranges[2][0] + ranges[2][1]) / 2;
      
      // Calculer la distance euclidienne entre la couleur et le centre de la plage
      const distance = Math.sqrt(
        Math.pow(red - redCenter, 2) +
        Math.pow(green - greenCenter, 2) +
        Math.pow(blue - blueCenter, 2)
      );
      
      // Si c'est la plus petite distance trouvée, mémoriser cette couleur
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = colorKey;
      }
    }
  }
  
  // Retourner le nom de la couleur dans la langue demandée
  return language === 'fr' ? COLOR_NAMES[bestMatch].fr : bestMatch;
}

/**
 * Analyse les couleurs dominantes et retourne des informations enrichies
 * @param {Array} dominantColors - Tableau des couleurs dominantes de Google Vision API
 * @returns {Array} - Tableau des couleurs avec noms et informations complémentaires
 */
function analyzeColors(dominantColors) {
  if (!dominantColors || !Array.isArray(dominantColors)) {
    return [];
  }
  
  // Enrichir chaque couleur avec son nom et des informations supplémentaires
  return dominantColors.map(color => {
    const { rgb, score, pixelFraction } = color;
    
    // Extraire les composantes RGB à partir de la chaîne rgb(r, g, b)
    let red, green, blue;
    try {
      [red, green, blue] = rgb.match(/\\d+/g).map(Number);
    } catch (e) {
      // En cas d'erreur, utiliser des valeurs par défaut
      red = 0;
      green = 0;
      blue = 0;
    }
    
    // Déterminer le nom de la couleur en français et en anglais
    const nameFr = getColorName({ red, green, blue }, 'fr');
    const nameEn = getColorName({ red, green, blue }, 'en');
    
    // Déterminer si la couleur est claire ou foncée
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    const isDark = brightness < 128;
    
    // Convertir en format hexadécimal
    const hex = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
    
    // Déterminer le contraste de texte optimal (blanc pour les couleurs foncées, noir pour les claires)
    const textColor = isDark ? '#FFFFFF' : '#000000';
    
    // Retourner l'objet couleur enrichi
    return {
      rgb,
      hex,
      red,
      green,
      blue,
      nameFr,
      nameEn,
      score,
      pixelFraction,
      isDark,
      textColor
    };
  });
}

/**
 * Génère une description textuelle des couleurs de l'image
 * @param {Array} analyzedColors - Tableau des couleurs analysées
 * @returns {String} - Description textuelle des couleurs principales
 */
function generateColorDescription(analyzedColors) {
  if (!analyzedColors || analyzedColors.length === 0) {
    return "Couleurs non identifiées";
  }
  
  // Extraire les couleurs principales (2 ou 3 maximum)
  const mainColors = analyzedColors.slice(0, Math.min(3, analyzedColors.length));
  
  // Utiliser les noms français pour la description
  const colorNames = mainColors.map(color => color.nameFr);
  
  // Construire la description
  if (colorNames.length === 1) {
    return `Principalement ${colorNames[0]}`;
  } else if (colorNames.length === 2) {
    return `${colorNames[0]} et ${colorNames[1]}`;
  } else {
    return `${colorNames[0]}, ${colorNames[1]} et ${colorNames[2]}`;
  }
}

// Exporter les fonctions du module
module.exports = {
  analyzeColors,
  getColorName,
  generateColorDescription
};
