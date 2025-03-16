const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

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

// Fonction pour analyser l'image avec Google Vision API directement via HTTPS
async function analyzeImage(imagePath) {
  try {
    console.log("Début de l'analyse de l'image via l'API Vision...");
    
    // Lire l'image et la convertir en base64
    const imageFile = fs.readFileSync(imagePath);
    const encodedImage = Buffer.from(imageFile).toString('base64');
    
    // Préparer la requête à l'API Vision
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    // Construire le corps de la requête
    const requestBody = {
      requests: [
        {
          image: { content: encodedImage },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 15 },
            { type: 'IMAGE_PROPERTIES', maxResults: 5 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'WEB_DETECTION', maxResults: 10 }
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
    const { labelAnnotations, imagePropertiesAnnotation, localizedObjectAnnotations, webDetection } = result;
    
    // Extraire les labels pertinents (vêtements, styles, etc.)
    const clothingKeywords = [
      'clothing', 'dress', 'shirt', 'pants', 'jacket', 'suit', 'coat', 
      'shoe', 'fashion', 'style', 'outfit', 'skirt', 'blouse', 'jeans', 
      'sweater', 'hoodie', 'tshirt', 't-shirt', 'hat', 'accessory', 'bag',
      'scarf', 'tie', 'sock', 'glove', 'jewelry'
    ];
    
    // Filtrer les labels pertinents
    const clothingLabels = (labelAnnotations || []).filter(label => {
      return clothingKeywords.some(keyword => 
        label.description.toLowerCase().includes(keyword)) || 
        label.score > 0.8;  // Inclure aussi les labels avec un score élevé
    });
    
    // Extraire les couleurs dominantes
    const colors = (imagePropertiesAnnotation?.dominantColors?.colors || [])
      .slice(0, 5)
      .map(color => {
        const { red, green, blue } = color.color;
        return {
          rgb: `rgb(${red}, ${green}, ${blue})`,
          score: color.score,
          pixelFraction: color.pixelFraction
        };
      });
    
    // Extraire les objets détectés
    const objects = (localizedObjectAnnotations || []).map(obj => ({
      name: obj.name,
      confidence: obj.score
    }));
    
    // Extraire les entités web pertinentes si disponibles
    const webEntities = (webDetection?.webEntities || [])
      .filter(entity => entity.score > 0.5)
      .map(entity => ({
        description: entity.description,
        score: entity.score
      }));
    
    // Extraire les images similaires du web
    const similarImages = (webDetection?.visuallySimilarImages || [])
      .slice(0, 5)
      .map(image => ({
        url: image.url
      }));
    
    return {
      labels: clothingLabels,
      colors,
      objects,
      webEntities,
      similarImages
    };
  } catch (error) {
    console.error('Erreur détaillée lors de l\'analyse de l\'image:', error);
    // Essayer d'extraire le message d'erreur de l'API Google Vision
    if (error.response && error.response.data) {
      console.error('Réponse d\'erreur de l\'API:', error.response.data);
    }
    throw error;
  }
}

// Fonction pour rechercher des produits similaires en utilisant directement l'API Custom Search
async function searchSimilarProducts(query) {
  try {
    console.log(`Recherche pour la requête: "${query}"`);
    
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    if (!apiKey || !cx) {
      throw new Error('Les clés API Google Custom Search sont manquantes');
    }
    
    // Ajouter des termes de shopping à la requête
    const enhancedQuery = `${query} vêtement acheter`;
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(enhancedQuery)}&num=10&searchType=image&imgType=photo&safe=active`;
    
    console.log(`URL de recherche: ${url}`);
    const response = await axios.get(url);
    
    // Vérifier la réponse
    if (!response.data) {
      throw new Error('Réponse vide de l\'API Custom Search');
    }
    
    console.log(`Nombre de résultats trouvés: ${response.data.items?.length || 0}`);
    
    // Traiter les résultats
    const items = response.data.items || [];
    return items.map(item => ({
      title: item.title || 'Produit sans titre',
      link: item.link || '',
      displayLink: item.displayLink || '',
      image: item.link || '',  // Utiliser le lien principal comme image
      snippet: item.snippet || '',
      price: extractPrice(item.title, item.snippet)
    }));
  } catch (error) {
    console.error('Erreur détaillée lors de la recherche de produits:', error);
    if (error.response) {
      console.error('Réponse d\'erreur:', error.response.data);
    }
    
    // En cas d'erreur, essayer une recherche simplifiée en dernier recours
    try {
      console.log("Tentative de recherche simplifiée en dernier recours...");
      const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
      const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
      
      const fallbackQuery = "vêtements mode acheter en ligne";
      const fallbackUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(fallbackQuery)}&num=5`;
      
      const fallbackResponse = await axios.get(fallbackUrl);
      const fallbackItems = fallbackResponse.data.items || [];
      
      return fallbackItems.map(item => ({
        title: item.title || 'Produit sans titre',
        link: item.link || '',
        displayLink: item.displayLink || '',
        image: item.link || '', 
        snippet: item.snippet || '',
        price: extractPrice(item.title, item.snippet)
      }));
    } catch (fallbackError) {
      console.error('Échec de la recherche de secours:', fallbackError);
      throw error; // Relancer l'erreur originale
    }
  }
}

// Fonction utilitaire pour extraire un prix d'un texte
function extractPrice(title, snippet) {
  const combined = `${title || ''} ${snippet || ''}`;
  
  // Recherche plus robuste de prix en différentes devises
  const priceRegex = /(\$|€|£|EUR|USD|CAD)?\s?(\d+[\.,]\d{2}|\d+)/;
  const match = combined.match(priceRegex);
  
  if (match) {
    return match[0];
  }
  return null;
}

// Fonction pour construire une requête de recherche robuste
function buildSearchQuery(analysisResults) {
  try {
    // Extraire les labels et objets pertinents
    const labels = (analysisResults.labels || []).map(label => label.description);
    const objects = (analysisResults.objects || []).map(obj => obj.name);
    const webEntities = (analysisResults.webEntities || []).map(entity => entity.description);
    
    // Obtenir les couleurs dominantes en termes simples
    const colorTerms = (analysisResults.colors || []).slice(0, 2).map(color => {
      const { rgb } = color;
      const [r, g, b] = rgb.match(/\d+/g).map(Number);
      
      // Convertir RGB en termes de couleur simples
      if (r > 200 && g > 200 && b > 200) return 'blanc';
      if (r < 50 && g < 50 && b < 50) return 'noir';
      if (r > 200 && g < 100 && b < 100) return 'rouge';
      if (r < 100 && g > 150 && b < 100) return 'vert';
      if (r < 100 && g < 100 && b > 200) return 'bleu';
      if (r > 200 && g > 150 && b < 100) return 'jaune';
      if (r > 200 && g < 150 && b > 200) return 'violet';
      if (r < 150 && g > 150 && b > 150) return 'gris';
      if (r > 230 && g > 100 && b < 100) return 'orange';
      return '';
    }).filter(Boolean);
    
    // Termes de vêtements en français
    const clothingTerms = ['vêtement', 'mode', 'habits', 'tenue'];
    
    // Termes commerciaux
    const commercialTerms = ['acheter', 'boutique', 'magasin', 'prix'];
    
    // Combiner toutes les informations
    const allTerms = [...labels, ...objects, ...webEntities, ...colorTerms];
    
    // Sélectionner les termes les plus pertinents (sans doublons)
    const uniqueTerms = [...new Set(allTerms)];
    
    // Prendre les 5 termes les plus significatifs
    const searchTerms = uniqueTerms.slice(0, 5);
    
    // Ajouter des termes de shopping (un de chaque catégorie)
    if (clothingTerms.length > 0) searchTerms.push(clothingTerms[0]);
    if (commercialTerms.length > 0) searchTerms.push(commercialTerms[0]);
    
    return searchTerms.join(' ');
  } catch (error) {
    console.error('Erreur lors de la construction de la requête:', error);
    // Requête de secours en cas d'erreur
    return 'vêtement mode acheter en ligne';
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

// Route pour analyser une image et trouver des produits similaires
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image n\'a été téléchargée' });
    }

    const imagePath = req.file.path;
    console.log(`Image téléchargée: ${imagePath}`);
    
    // Analyser l'image
    console.log('Début de l\'analyse de l\'image...');
    const analysisResults = await analyzeImage(imagePath);
    console.log('Analyse terminée avec succès');
    
    // Construire une requête à partir des résultats d'analyse
    const searchQuery = buildSearchQuery(analysisResults);
    console.log(`Requête de recherche construite: "${searchQuery}"`);
    
    // Rechercher des produits similaires
    console.log('Début de la recherche de produits similaires...');
    const similarProducts = await searchSimilarProducts(searchQuery);
    console.log(`${similarProducts.length} produits similaires trouvés`);
    
    // Envoyer les résultats au client
    res.json({
      success: true,
      analysis: analysisResults,
      searchQuery,
      similarProducts
    });
    
    // Nettoyer le fichier après utilisation
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Erreur lors de la suppression du fichier:', err);
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    
    // Envoyer une réponse d'erreur détaillée
    res.status(500).json({ 
      success: false,
      error: 'Une erreur est survenue lors de l\'analyse de l\'image',
      details: error.message,
      advice: 'Assurez-vous que l\'image est claire et que les APIs Google sont activées'
    });
    
    // Nettoyer le fichier en cas d'erreur
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erreur lors de la suppression du fichier après erreur:', err);
      });
    }
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionnelle!', version: '1.2.0' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`
=======================================================
  Fashion Finder API Server v1.2.0
=======================================================
  Serveur démarré sur le port ${port}
  
  Routes disponibles:
  - GET  /api/test           Test de base de l'API
  - GET  /api/check-apis     Vérification des API Google
  - POST /api/analyze        Analyse d'image et recherche
  
  Environnement:
  - Vision API:      ${process.env.GOOGLE_VISION_API_KEY ? 'Configurée' : 'Non configurée'}
  - Custom Search:   ${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY ? 'Configurée' : 'Non configurée'}
  - Engine ID:       ${process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || 'Non configuré'}
=======================================================
  `);
});
