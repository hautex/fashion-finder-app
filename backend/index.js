const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Charger nos services personnalisés
const colorDetection = require('./services/colorDetection');
const fashionTerms = require('./services/fashionTerms');
const objectColorExtractor = require('./services/objectColorExtractor');
const productSearch = require('./services/productSearch');
const cacheService = require('./services/cacheService');

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite à 10MB
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont acceptées.'), false);
    }
    cb(null, true);
  }
});

// Fonction pour générer un hash d'une image (pour le cache)
function generateImageHash(imagePath) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error('Erreur lors de la génération du hash de l\'image:', error);
    return Date.now().toString(); // Fallback: timestamp actuel
  }
}

// Fonction pour analyser l'image avec Google Vision API directement via HTTPS
async function analyzeImage(imagePath) {
  try {
    console.log("Début de l'analyse de l'image via l'API Vision...");
    
    // Générer un hash de l'image pour le cache
    const imageHash = generateImageHash(imagePath);
    
    // Vérifier si l'analyse est en cache
    const cachedAnalysis = cacheService.get('vision', { imageHash });
    if (cachedAnalysis) {
      console.log("Résultats d'analyse trouvés en cache");
      return cachedAnalysis;
    }
    
    // Lire l'image et la convertir en base64
    const imageFile = fs.readFileSync(imagePath);
    const encodedImage = Buffer.from(imageFile).toString('base64');
    
    // Préparer la requête à l'API Vision
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    // Construire le corps de la requête avec plus de features pour une meilleure détection
    const requestBody = {
      requests: [
        {
          image: { content: encodedImage },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 30 }, // Augmenté pour plus de labels
            { type: 'IMAGE_PROPERTIES', maxResults: 15 }, // Plus de détails sur les couleurs
            { type: 'OBJECT_LOCALIZATION', maxResults: 20 }, // Plus d'objets détectés
            { type: 'WEB_DETECTION', maxResults: 20 }, // Plus de détection web
            { type: 'TEXT_DETECTION', maxResults: 15 }, // Plus de texte détecté
            { type: 'LOGO_DETECTION', maxResults: 10 }  // Plus de logos détectés
          ]
        }
      ]
    };
    
    console.log("Envoi de la requête à Google Vision API...");
    const response = await axios.post(url, requestBody);
    
    // Vérifier si la réponse contient des erreurs
    if (response.data.responses[0].error) {
      throw new Error(`Google Vision API error: ${response.data.responses[0].error.message}`);
    }
    
    console.log("Réponse reçue de Google Vision API");
    
    // Extraire les informations pertinentes
    const result = response.data.responses[0];
    const { 
      labelAnnotations, 
      imagePropertiesAnnotation, 
      localizedObjectAnnotations, 
      webDetection,
      textAnnotations,
      logoAnnotations
    } = result;
    
    // Imprimer les informations de débogage
    console.log("Labels détectés:", labelAnnotations?.map(label => label.description) || []);
    console.log("Objets détectés:", localizedObjectAnnotations?.map(obj => obj.name) || []);
    
    // Trouver l'objet principal sur l'image
    const mainObject = objectColorExtractor.findMainObject(localizedObjectAnnotations || []);
    console.log("Objet principal détecté:", mainObject ? mainObject.name : "Aucun");
    
    // Extraire les couleurs spécifiques à l'objet principal (si trouvé)
    let objectColors = [];
    let colorDescription = "Non détecté";
    
    if (mainObject) {
      // Extraire les couleurs spécifiquement à cet objet
      objectColors = await objectColorExtractor.extractObjectColors(imageFile, mainObject);
      colorDescription = colorDetection.generateColorDescription(objectColors);
      console.log(`Couleurs de l'objet principal (${mainObject.name}):`, 
                  objectColors.map(c => c.nameFr).join(', '));
    } else {
      // Fallback sur les couleurs globales de l'image
      const globalColors = (imagePropertiesAnnotation?.dominantColors?.colors || [])
        .slice(0, 12) // Augmenté pour plus de diversité de couleurs
        .map(color => {
          const { red, green, blue } = color.color;
          return {
            rgb: `rgb(${red}, ${green}, ${blue})`,
            score: color.score,
            pixelFraction: color.pixelFraction
          };
        });
      
      objectColors = colorDetection.analyzeColors(globalColors);
      colorDescription = colorDetection.generateColorDescription(objectColors);
      console.log("Couleurs globales de l'image:", objectColors.map(c => c.nameFr).join(', '));
    }
    
    // Extraire les objets détectés
    const objects = (localizedObjectAnnotations || []).map(obj => ({
      name: obj.name,
      confidence: obj.score,
      // Ajouter les coordonnées de délimitation pour référence
      boundingPoly: obj.boundingPoly ? obj.boundingPoly.normalizedVertices : []
    }));
    
    // Extraire les entités web pertinentes
    const webEntities = (webDetection?.webEntities || [])
      .filter(entity => entity.score > 0.5)
      .map(entity => ({
        description: entity.description,
        score: entity.score
      }));
    
    // Extraire les images similaires du web
    const similarImages = (webDetection?.visuallySimilarImages || [])
      .slice(0, 8) // Augmenté pour plus d'images similaires
      .map(image => ({
        url: image.url
      }));
    
    // Extraire le texte détecté (peut contenir des marques, tailles, etc.)
    const detectedText = (textAnnotations || [])
      .slice(1) // Ignorer le premier qui contient tout le texte
      .map(text => ({
        text: text.description,
        confidence: text.score || 0.9
      }));
    
    // Extraire les logos détectés (marques potentielles)
    const detectedLogos = (logoAnnotations || [])
      .map(logo => ({
        name: logo.description,
        confidence: logo.score
      }));
    
    // Résultats enrichis
    const analysisResults = {
      labels: labelAnnotations || [],
      colors: objectColors,
      colorDescription,
      mainObject: mainObject ? {
        name: mainObject.name,
        confidence: mainObject.score
      } : null,
      objects,
      webEntities,
      similarImages,
      detectedText,
      detectedLogos
    };
    
    // Stocker les résultats dans le cache
    cacheService.set('vision', { imageHash }, analysisResults);
    
    return analysisResults;
  } catch (error) {
    console.error('Erreur détaillée lors de l\'analyse de l\'image:', error);
    // Essayer d'extraire le message d'erreur de l'API Google Vision
    if (error.response && error.response.data) {
      console.error('Réponse d\'erreur de l\'API:', error.response.data);
    }
    
    // Même en cas d'erreur, renvoyer des résultats de base pour éviter un échec complet
    return {
      labels: [{ description: "clothing", score: 0.9 }, { description: "fashion", score: 0.9 }],
      colors: [{ 
        rgb: 'rgb(128, 128, 128)', 
        hex: '#808080',
        red: 128, green: 128, blue: 128,
        nameFr: 'Gris', 
        nameEn: 'gray',
        score: 1.0, 
        pixelFraction: 1.0,
        isDark: true,
        textColor: '#FFFFFF'
      }],
      colorDescription: "Principalement gris",
      mainObject: null,
      objects: [{ name: "Clothing", confidence: 0.9 }],
      webEntities: [{ description: "Fashion", score: 0.9 }],
      similarImages: [],
      detectedText: [],
      detectedLogos: []
    };
  }
}

// Fonction pour construire une requête de recherche intelligente
function buildSearchQuery(analysisResults) {
  try {
    console.log("Construction d'une requête de recherche optimisée...");
    
    // Utiliser notre service de terminologie de mode pour extraire et catégoriser les termes
    const allLabels = [
      ...(analysisResults.labels || []),
      ...(analysisResults.objects || []).map(obj => ({ description: obj.name, score: obj.confidence })),
      ...(analysisResults.webEntities || [])
    ];
    
    // Ajouter les textes détectés qui pourraient contenir des marques
    if (analysisResults.detectedText && analysisResults.detectedText.length > 0) {
      const textLabels = analysisResults.detectedText.map(item => ({
        description: item.text,
        score: item.confidence || 0.9
      }));
      allLabels.push(...textLabels);
    }
    
    // Ajouter les logos détectés qui sont probablement des marques
    if (analysisResults.detectedLogos && analysisResults.detectedLogos.length > 0) {
      const logoLabels = analysisResults.detectedLogos.map(logo => ({
        description: logo.name,
        score: logo.confidence || 0.9
      }));
      allLabels.push(...logoLabels);
    }
    
    const extractedTerms = fashionTerms.extractFashionTerms(allLabels);
    console.log("Termes de mode extraits:", extractedTerms);
    
    // Déterminer le type d'article principal (pour adapter les fallbacks plus tard)
    let mainItemType = 'default';
    let mainColor = '';
    
    // Si un objet principal a été identifié, l'utiliser comme référence
    if (analysisResults.mainObject) {
      const mainObjectName = analysisResults.mainObject.name.toLowerCase();
      mainItemType = mainObjectName;
      
      if (mainObjectName.includes('shoe') || mainObjectName.includes('boot') || 
          mainObjectName.includes('footwear') || mainObjectName.includes('sneaker')) {
        mainItemType = 'chaussure';
      } else if (mainObjectName.includes('bag') || mainObjectName.includes('handbag') || 
                 mainObjectName.includes('purse')) {
        mainItemType = 'sac';
      } else if (mainObjectName.includes('jacket') || mainObjectName.includes('coat')) {
        mainItemType = 'veste';
      } else if (mainObjectName.includes('dress')) {
        mainItemType = 'robe';
      } else if (mainObjectName.includes('pants') || mainObjectName.includes('trousers') || 
                 mainObjectName.includes('jeans')) {
        mainItemType = 'pantalon';
      }
    } 
    // Sinon, utiliser les termes extraits
    else if (extractedTerms.clothing.length > 0 || extractedTerms.shoes.length > 0 || 
             extractedTerms.bags.length > 0) {
      
      // Vérifier d'abord les chaussures car c'est notre priorité
      if (extractedTerms.shoes.length > 0) {
        const shoeItem = extractedTerms.shoes[0].term.toLowerCase();
        mainItemType = 'chaussure';
        
        // Affiner le type
        if (shoeItem.includes('boot') || shoeItem.includes('bottine')) {
          mainItemType = 'bottine';
        } else if (shoeItem.includes('sneaker') || shoeItem.includes('basket')) {
          mainItemType = 'sneaker';
        }
      }
      // Ensuite vérifier les sacs
      else if (extractedTerms.bags.length > 0) {
        const bagItem = extractedTerms.bags[0].term.toLowerCase();
        mainItemType = 'sac';
      }
      // Enfin vérifier les vêtements généraux
      else if (extractedTerms.clothing.length > 0) {
        const mainItem = extractedTerms.clothing[0].term.toLowerCase();
        
        if (mainItem.includes('dress') || mainItem.includes('robe')) {
          mainItemType = 'robe';
        } else if (mainItem.includes('jacket') || mainItem.includes('coat') ||
                  mainItem.includes('veste') || mainItem.includes('manteau')) {
          mainItemType = 'veste';
        } else if (mainItem.includes('pants') || mainItem.includes('trousers') ||
                  mainItem.includes('pantalon') || mainItem.includes('jeans')) {
          mainItemType = 'pantalon';
        } else if (mainItem.includes('shirt') || mainItem.includes('chemise') ||
                  mainItem.includes('blouse')) {
          mainItemType = 'chemise';
        } else if (mainItem.includes('sweater') || mainItem.includes('pull') ||
                  mainItem.includes('hoodie') || mainItem.includes('sweatshirt')) {
          mainItemType = 'pull';
        }
      }
    }
    
    // Extraire la couleur principale
    if (analysisResults.colors && analysisResults.colors.length > 0) {
      mainColor = analysisResults.colors[0].nameFr || '';
      
      // Si la couleur principale est très faible en pourcentage, vérifier la seconde couleur
      if (analysisResults.colors[0].pixelFraction < 0.1 && analysisResults.colors.length > 1) {
        if (analysisResults.colors[1].pixelFraction > analysisResults.colors[0].pixelFraction) {
          mainColor = analysisResults.colors[1].nameFr || '';
        }
      }
    }
    
    // Générer une requête optimisée avec notre service
    const optimizedQuery = fashionTerms.generateOptimizedQuery(extractedTerms, analysisResults.colors);
    
    console.log(`Type d'article principal détecté: ${mainItemType}`);
    console.log(`Couleur principale: ${mainColor}`);
    console.log(`Requête optimisée: ${optimizedQuery}`);
    
    return {
      query: optimizedQuery,
      itemType: mainItemType,
      color: mainColor
    };
  } catch (error) {
    console.error('Erreur lors de la construction de la requête:', error);
    // Requête de secours en cas d'erreur
    return {
      query: 'vêtement mode acheter',
      itemType: 'default',
      color: ''
    };
  }
}

// Route pour tester si les APIs sont disponibles
app.get('/api/check-apis', async (req, res) => {
  try {
    // Vérifier Google Vision API
    const apiKeyVision = process.env.GOOGLE_VISION_API_KEY;
    let visionStatus = { available: false, message: 'Clé API manquante' };
    
    if (apiKeyVision) {
      try {
        const visionTestUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKeyVision}`;
        const visionTestResponse = await axios.post(visionTestUrl, {
          requests: [{
            image: { content: '' },
            features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
          }]
        });
        
        // Même si l'API renvoie une erreur pour une image vide, ça confirme que l'API est accessible
        visionStatus = { available: true, message: 'API Google Vision disponible' };
      } catch (error) {
        if (error.response && error.response.status !== 400) {
          // Une erreur 400 est attendue pour une requête invalide (image vide)
          visionStatus = { 
            available: false, 
            message: `Erreur Vision API: ${error.response?.status || 'Inconnue'}`
          };
        } else {
          // L'API a répondu avec 400, ce qui est normal pour notre test
          visionStatus = { available: true, message: 'API Google Vision disponible' };
        }
      }
    }
    
    // Vérifier Google Custom Search API
    const apiKeySearch = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    let searchStatus = { available: false, message: 'Clés API manquantes' };
    
    if (apiKeySearch && cx) {
      try {
        const searchTestUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKeySearch}&cx=${cx}&q=test&num=1`;
        const searchTestResponse = await axios.get(searchTestUrl);
        
        if (searchTestResponse.data) {
          searchStatus = { available: true, message: 'API Google Custom Search disponible' };
        }
      } catch (error) {
        searchStatus = { 
          available: false, 
          message: `Erreur Custom Search API: ${error.response?.status || 'Inconnue'}`
        };
      }
    }
    
    res.json({ 
      success: true,
      vision: visionStatus,
      search: searchStatus
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des APIs:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Route pour obtenir les statistiques du cache
app.get('/api/cache-stats', (req, res) => {
  res.json({ 
    success: true,
    stats: cacheService.getStats()
  });
});

// Route pour vider le cache
app.post('/api/clear-cache', (req, res) => {
  cacheService.clear();
  res.json({ 
    success: true,
    message: 'Cache vidé avec succès'
  });
});

// Route pour analyser une image et trouver des produits similaires
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image n\'a été téléchargée' });
    }

    const imagePath = req.file.path;
    console.log(`Image téléchargée: ${imagePath}`);
    
    let analysisResults, searchQueryInfo, similarProducts;
    
    try {
      // Analyser l'image
      console.log('Début de l\'analyse de l\'image...');
      analysisResults = await analyzeImage(imagePath);
      console.log('Analyse terminée avec succès');
      
      // Construire une requête à partir des résultats d'analyse
      searchQueryInfo = buildSearchQuery(analysisResults);
      console.log(`Requête de recherche construite: "${searchQueryInfo.query}" (type: ${searchQueryInfo.itemType}, couleur: ${searchQueryInfo.color})`);
      
      // Vérifier le cache pour la recherche
      const cacheKey = {
        query: searchQueryInfo.query,
        itemType: searchQueryInfo.itemType,
        color: searchQueryInfo.color
      };
      
      const cachedProducts = cacheService.get('search', cacheKey);
      if (cachedProducts) {
        console.log('Résultats de recherche trouvés en cache');
        similarProducts = cachedProducts;
      } else {
        // Rechercher des produits similaires avec notre service amélioré
        console.log('Début de la recherche de produits similaires...');
        similarProducts = await productSearch.searchFashionProducts(
          searchQueryInfo.query, 
          searchQueryInfo.itemType,
          searchQueryInfo.color
        );
        console.log(`${similarProducts.length} produits similaires trouvés`);
        
        // Mettre en cache les résultats
        cacheService.set('search', cacheKey, similarProducts);
      }
    } catch (error) {
      console.error('Erreur pendant le traitement:', error);
      
      // En cas d'erreur, utiliser des valeurs par défaut pour éviter un échec complet
      analysisResults = {
        labels: [{ description: "fashion", score: 0.9 }, { description: "vêtement", score: 0.9 }],
        colors: [{ 
          rgb: 'rgb(128, 128, 128)', 
          hex: '#808080',
          red: 128, green: 128, blue: 128,
          nameFr: 'Gris', 
          nameEn: 'gray',
          score: 1.0, 
          pixelFraction: 1.0,
          isDark: true,
          textColor: '#FFFFFF'
        }],
        colorDescription: "Principalement gris",
        mainObject: null,
        objects: [{ name: "Clothing", confidence: 0.9 }],
        webEntities: [{ description: "Fashion", score: 0.9 }],
        similarImages: [],
        detectedText: [],
        detectedLogos: []
      };
      searchQueryInfo = {
        query: "vêtement mode acheter",
        itemType: "default",
        color: "gris"
      };
      
      // Utiliser le service productSearch pour les résultats de secours
      similarProducts = await productSearch.getFallbackResults(
        searchQueryInfo.itemType, 
        searchQueryInfo.color
      );
      
      console.log('Utilisation des résultats de secours suite à une erreur');
    }
    
    // Envoyer les résultats au client
    res.json({
      success: true,
      analysis: analysisResults,
      searchQuery: searchQueryInfo.query,
      itemType: searchQueryInfo.itemType,
      similarProducts
    });
    
    // Nettoyer le fichier après utilisation
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Erreur lors de la suppression du fichier:', err);
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    
    // Même en cas d'erreur grave, renvoyer des résultats par défaut
    res.json({ 
      success: true,
      analysis: {
        labels: [{ description: "fashion", score: 0.9 }, { description: "vêtement", score: 0.9 }],
        colors: [{ 
          rgb: 'rgb(128, 128, 128)', 
          hex: '#808080',
          red: 128, green: 128, blue: 128,
          nameFr: 'Gris', 
          nameEn: 'gray',
          score: 1.0, 
          pixelFraction: 1.0,
          isDark: true,
          textColor: '#FFFFFF'
        }],
        colorDescription: "Gris",
        mainObject: null,
        objects: [{ name: "Clothing", confidence: 0.9 }],
        webEntities: [{ description: "Fashion", score: 0.9 }],
        similarImages: [],
        detectedText: [],
        detectedLogos: []
      },
      searchQuery: "vêtement mode acheter",
      itemType: "default",
      similarProducts: await productSearch.getFallbackResults("default", "")
    });
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erreur lors de la suppression du fichier après erreur:', err);
      });
    }
  }
});

// Route pour recherche manuelle (sans analyse d'image)
app.post('/api/search', express.json(), async (req, res) => {
  try {
    const { query, itemType, color } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Une requête de recherche est requise' 
      });
    }
    
    console.log(`Recherche manuelle: "${query}" (type: ${itemType || 'non spécifié'}, couleur: ${color || 'non spécifiée'})`);
    
    // Vérifier le cache pour cette recherche
    const cacheKey = {
      query,
      itemType: itemType || 'default',
      color: color || ''
    };
    
    const cachedResults = cacheService.get('search', cacheKey);
    if (cachedResults) {
      console.log('Résultats de recherche trouvés en cache');
      return res.json({
        success: true,
        searchQuery: query,
        itemType: itemType || 'default',
        similarProducts: cachedResults
      });
    }
    
    // Utiliser notre service de recherche amélioré
    const results = await productSearch.searchFashionProducts(
      query, 
      itemType || 'default',
      color || ''
    );
    
    // Stocker les résultats dans le cache
    cacheService.set('search', cacheKey, results);
    
    res.json({
      success: true,
      searchQuery: query,
      itemType: itemType || 'default',
      similarProducts: results
    });
  } catch (error) {
    console.error('Erreur lors de la recherche manuelle:', error);
    
    // En cas d'erreur, utiliser les résultats de secours
    res.json({
      success: true,
      searchQuery: req.body.query || 'recherche',
      itemType: req.body.itemType || 'default',
      similarProducts: await productSearch.getFallbackResults(
        req.body.itemType || 'default', 
        req.body.color || ''
      )
    });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionnelle!', version: '2.0.0' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`\n=======================================================
  Fashion Finder API Server v2.0.0
=======================================================
  Serveur démarré sur le port ${port}
  
  Routes disponibles:
  - GET  /api/test           Test de base de l'API
  - GET  /api/check-apis     Vérification des API Google
  - GET  /api/cache-stats    Statistiques du cache
  - POST /api/clear-cache    Vider le cache
  - POST /api/analyze        Analyse d'image et recherche
  - POST /api/search         Recherche manuelle sans image
  
  Environnement:
  - Vision API:      ${process.env.GOOGLE_VISION_API_KEY ? 'Configurée' : 'Non configurée'}
  - Custom Search:   ${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY ? 'Configurée' : 'Non configurée'}
  - Engine ID:       ${process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || 'Non configuré'}
=======================================================
  `);
});
