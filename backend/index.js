const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
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

// Configuration Google Vision API
const configureVisionClient = () => {
  try {
    // Méthode 1 : Utiliser les credentials si disponibles
    if (process.env.GOOGLE_VISION_CREDENTIALS) {
      const credentials = JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS);
      return new ImageAnnotatorClient({ credentials });
    }
    
    // Méthode 2 : Utiliser la clé API
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error('Google Vision API key non trouvée dans les variables d\'environnement');
    }
    
    return new ImageAnnotatorClient({ 
      credentials: {
        client_email: "vision-api@elevated-guard-411822.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCaRnBlI5ZWvF2o\nkYBiiPZV5nzjCJLnM/QXCngB1NYhEgLgGE2t1iZLzrPmL6rOOYIIuCpxXGiFA44q\nFwI9XD+UXPnGzRhL37GBl35/1Eoq+TVuG1tZADMaFxxGqVvA7o/NYkbWoYrX4Wlm\nMHfE8zXF3iYyXzU3RqIV1ysLTRdxr78FvJjsqdPdQBKOAUfL1ETJJWWXc/op1nl0\nGJdkQKtpPnO7IBN9ZLe7WkNi7bUEUxxS5skfUcf8jKFeSj0+zLqcM3EzqEqrxMgH\n79GOqRAw4SbG1uZg8AXdH9UAF0wLTYL1QGegdS2dKKn6fLTZxTZE6o1dLZBHXJTR\nxvb4LVF5AgMBAAECggEABaqZdHmQQrCqH+izDV0S5H4I+Q6Xo+G/EBj5BpJ30V0D\n6yDYFFJo5QXgVqE9T9GsOlIhBB8fN+ucfiwV0XVeL/DPcjkX9kZGJhCoT3DD+pnI\nFCJT3JwcDwJu7XxU2pucM3NYLedMww+By0QkCu2KQDPn09Zjs85YLGZBwsHm96hE\ndiBL9JGmwlvKzWxsjn9T/yK4r1BX/j3nEZJM7gBwZXnGdhxhSXwjIHmCGxw47J5e\nWBo+5skMn/GpJ8/HxDw0sBw1x48jf22nAk0/eW0hJQz0JXcHVMrEajZQqUNxdPE4\nmwmVOHKhCt/nNx36GyXnfGfzffUbAkSYuRsQeUAF2QKBgQDQavXayshDTXMkSUJd\nIAq/QMwzZnP7YGI5mRFJfXGzYCqLSWCgDwh6F1KohdgDK+Dd3Rt6RP3f71mRZBW/\n26R0HqLZmAT6r6wuswAqLvv4vCkwT+9rUIFbFYEAwdxP4cAT+nsRTSm5PJdFmYE/\nSBMjcEQOPDhbr9EKMl6KfDzs7QKBgQC9D1q6p1+3d4JYc6Z2qx6qXP1tKfX1JLeC\neJsE/UgkrS94HG6SsiO2YDjsD29qP1TfX7jTr4ISE6Mx8w7dOcJnmwLHKrfQnNPn\nEr6YRzFmvzxlnyhLPGKcrBNM8qyD8DyVTsihNiYM1HmjHFpGhNkkh+Su/JTzGUmX\ngY7kMKDLDQKBgFzprmC1z7/T2IRQZ5CjQCbj9uYSj2MIEa8kP/IfHoKVMLXMJdtw\nx60LCvVP78ixq8LCgIIJOYGnzZ9EJZvqO19N/ZpBGWnWkxjvbEb6/qTjLnASUE4Y\nyL48lZdxDKnf3/06yULW1xjHRFnCBZ5LwLX6x7y8jiDtXeUJwEBEVS8RAoGAA44N\nj6F8lUKL9Q7GdWK0V5kOJcr84U7nvKEmJWG2mvOlKSWWFPHj3zPJRtIEzwYr3/2t\niLNnvUBuNSFrQ7yq5kpnYCXEVjA25MV+eI5z9hxoAc8evczZ0Jp9r3eVX57++QFH\nWKcUP20Pu8jXFJOOhxiG2g9nMd7A80Z/yJAD4bkCgYBB3Iq0c29qMOOXJv8dCO+B\nepSQGb0dzPdXK5tOVQB+SPCB2qk3Z4UUmHwsYV5OdJVVU6CQ96Q6RQjxr041j6Kr\nGCF2iJrBCeKNUU0gAY3QQpLkZeV+FzRiYWBBLFScCMv70J6uwIArVQo7Jk5HzIUF\nHNKHLsL8MihG9L9+aHHrXg==\n-----END PRIVATE KEY-----\n",
      },
    });
  } catch (error) {
    console.error('Erreur lors de la configuration du client Google Vision:', error);
    throw error;
  }
};

// Fonction pour analyser l'image avec Google Vision API
async function analyzeImage(imagePath) {
  try {
    const visionClient = configureVisionClient();
    
    // Convertir l'image en base64
    const imageFile = fs.readFileSync(imagePath);
    const encodedImage = imageFile.toString('base64');
    
    // Analyse multi-feature pour obtenir plus d'informations
    const request = {
      image: { content: encodedImage },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'IMAGE_PROPERTIES', maxResults: 5 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'WEB_DETECTION', maxResults: 10 }
      ]
    };

    // Faire l'appel API
    const [result] = await visionClient.annotateImage(request);
    
    // Vérifier s'il y a des erreurs
    if (result.error) {
      throw new Error(`Google Vision API error: ${result.error.message}`);
    }

    console.log('Vision API response received successfully');

    // Extraire les informations pertinentes
    const { labelAnnotations, imagePropertiesAnnotation, localizedObjectAnnotations, webDetection } = result;

    // Extraire les labels pertinents (vêtements, styles, etc.)
    const clothingKeywords = [
      'clothing', 'dress', 'shirt', 'pants', 'jacket', 'suit', 'coat', 
      'shoe', 'fashion', 'style', 'outfit', 'skirt', 'blouse', 'jeans', 
      'sweater', 'hoodie', 'tshirt', 't-shirt', 'hat', 'accessory', 'bag',
      'scarf', 'tie', 'sock', 'glove', 'jewelry'
    ];

    // Filtrer les labels pertinents
    const clothingLabels = labelAnnotations.filter(label => {
      return clothingKeywords.some(keyword => 
        label.description.toLowerCase().includes(keyword)) || 
        label.score > 0.8;  // Inclure aussi les labels avec un score élevé
    });

    // Extraire les couleurs dominantes
    const colors = imagePropertiesAnnotation.dominantColors.colors
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
    const objects = localizedObjectAnnotations.map(obj => ({
      name: obj.name,
      confidence: obj.score
    }));

    // Extraire les entités web pertinentes si disponibles
    const webEntities = webDetection?.webEntities || [];
    const relevantWebEntities = webEntities
      .filter(entity => entity.score > 0.5)
      .map(entity => ({
        description: entity.description,
        score: entity.score
      }));

    return {
      labels: clothingLabels,
      colors,
      objects,
      webEntities: relevantWebEntities
    };
  } catch (error) {
    console.error('Erreur détaillée lors de l\'analyse de l\'image:', error);
    throw error;
  }
}

// Fonction pour rechercher des produits similaires
async function searchSimilarProducts(query) {
  try {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    if (!apiKey || !cx) {
      throw new Error('Les clés API Google Custom Search sont manquantes');
    }

    console.log(`Recherche pour la requête: "${query}" avec CX: ${cx}`);
    
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx,
        q: `${query} clothing buy online`,
        searchType: 'image',
        num: 10,
        imgType: 'shopping',
        rights: 'cc_publicdomain cc_attribute cc_sharealike',
        safe: 'active'
      }
    });

    // Vérifier la réponse
    if (!response.data || response.status !== 200) {
      throw new Error(`Erreur API Custom Search: ${response.status}`);
    }

    console.log(`Nombre de résultats trouvés: ${response.data.items?.length || 0}`);

    // Traiter les résultats
    const items = response.data.items || [];
    return items.map(item => ({
      title: item.title,
      link: item.link,
      displayLink: item.displayLink,
      image: item.image?.thumbnailLink || item.link,
      snippet: item.snippet,
      price: extractPrice(item.title, item.snippet)
    }));
  } catch (error) {
    console.error('Erreur détaillée lors de la recherche de produits:', error);
    if (error.response) {
      console.error('Réponse API:', error.response.data);
    }
    throw error;
  }
}

// Fonction utilitaire pour extraire un prix d'un texte
function extractPrice(title, snippet) {
  const combined = `${title} ${snippet}`;
  
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
    const labels = analysisResults.labels.map(label => label.description);
    const objects = analysisResults.objects.map(obj => obj.name);
    const webEntities = analysisResults.webEntities.map(entity => entity.description);
    
    // Obtenir les couleurs dominantes en termes simples
    const colorTerms = analysisResults.colors.slice(0, 2).map(color => {
      const { rgb } = color;
      const [r, g, b] = rgb.match(/\d+/g).map(Number);
      
      // Convertir RGB en termes de couleur simples
      if (r > 200 && g > 200 && b > 200) return 'white';
      if (r < 50 && g < 50 && b < 50) return 'black';
      if (r > 200 && g < 100 && b < 100) return 'red';
      if (r < 100 && g > 150 && b < 100) return 'green';
      if (r < 100 && g < 100 && b > 200) return 'blue';
      if (r > 200 && g > 150 && b < 100) return 'yellow';
      if (r > 200 && g < 150 && b > 200) return 'purple';
      if (r < 150 && g > 150 && b > 150) return 'grey';
      if (r > 230 && g > 100 && b < 100) return 'orange';
      return '';
    }).filter(Boolean);
    
    // Combiner toutes les informations
    const allTerms = [...labels, ...objects, ...webEntities, ...colorTerms];
    
    // Sélectionner les termes les plus pertinents (score élevé, sans doublons)
    const uniqueTerms = [...new Set(allTerms)];
    
    // Prendre les 5 termes les plus significatifs
    const searchTerms = uniqueTerms.slice(0, 5);
    
    // Ajouter des termes de shopping
    searchTerms.push('buy', 'shop');
    
    return searchTerms.join(' ');
  } catch (error) {
    console.error('Erreur lors de la construction de la requête:', error);
    // Requête de secours en cas d'erreur
    return 'clothing fashion buy online';
  }
}

// Route pour tester si les APIs sont disponibles
app.get('/api/check-apis', async (req, res) => {
  try {
    // Vérifier Google Vision API
    const visionClient = configureVisionClient();
    const visionStatus = { available: true, message: 'API Google Vision disponible' };

    // Vérifier Google Custom Search API
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    // Faire une petite requête de test
    const testResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: { key: apiKey, cx, q: 'test', num: 1 }
    });
    
    const searchStatus = { available: true, message: 'API Google Custom Search disponible' };
    
    res.json({ 
      success: true,
      vision: visionStatus,
      search: searchStatus
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des APIs:', error);
    
    // Déterminer quelle API a échoué
    let visionStatus = { available: true, message: 'API Google Vision disponible' };
    let searchStatus = { available: true, message: 'API Google Custom Search disponible' };
    
    if (error.message.includes('Vision')) {
      visionStatus = { available: false, message: error.message };
    } else {
      searchStatus = { available: false, message: error.message };
    }
    
    res.status(500).json({ 
      success: false,
      vision: visionStatus,
      search: searchStatus,
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
  res.json({ message: 'API fonctionnelle!', version: '1.1.0' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`
=======================================================
  Fashion Finder API Server
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
