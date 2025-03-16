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
const upload = multer({ storage });

// Configuration Google Vision API
const configureVisionClient = () => {
  // Utiliser la clé API de l'environnement
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  
  // Créer et retourner le client Google Vision
  return new ImageAnnotatorClient({
    credentials: {
      client_email: "vision-api@elevated-guard-411822.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCaRnBlI5ZWvF2o\nkYBiiPZV5nzjCJLnM/QXCngB1NYhEgLgGE2t1iZLzrPmL6rOOYIIuCpxXGiFA44q\nFwI9XD+UXPnGzRhL37GBl35/1Eoq+TVuG1tZADMaFxxGqVvA7o/NYkbWoYrX4Wlm\nMHfE8zXF3iYyXzU3RqIV1ysLTRdxr78FvJjsqdPdQBKOAUfL1ETJJWWXc/op1nl0\nGJdkQKtpPnO7IBN9ZLe7WkNi7bUEUxxS5skfUcf8jKFeSj0+zLqcM3EzqEqrxMgH\n79GOqRAw4SbG1uZg8AXdH9UAF0wLTYL1QGegdS2dKKn6fLTZxTZE6o1dLZBHXJTR\nxvb4LVF5AgMBAAECggEABaqZdHmQQrCqH+izDV0S5H4I+Q6Xo+G/EBj5BpJ30V0D\n6yDYFFJo5QXgVqE9T9GsOlIhBB8fN+ucfiwV0XVeL/DPcjkX9kZGJhCoT3DD+pnI\nFCJT3JwcDwJu7XxU2pucM3NYLedMww+By0QkCu2KQDPn09Zjs85YLGZBwsHm96hE\ndiBL9JGmwlvKzWxsjn9T/yK4r1BX/j3nEZJM7gBwZXnGdhxhSXwjIHmCGxw47J5e\nWBo+5skMn/GpJ8/HxDw0sBw1x48jf22nAk0/eW0hJQz0JXcHVMrEajZQqUNxdPE4\nmwmVOHKhCt/nNx36GyXnfGfzffUbAkSYuRsQeUAF2QKBgQDQavXayshDTXMkSUJd\nIAq/QMwzZnP7YGI5mRFJfXGzYCqLSWCgDwh6F1KohdgDK+Dd3Rt6RP3f71mRZBW/\n26R0HqLZmAT6r6wuswAqLvv4vCkwT+9rUIFbFYEAwdxP4cAT+nsRTSm5PJdFmYE/\nSBMjcEQOPDhbr9EKMl6KfDzs7QKBgQC9D1q6p1+3d4JYc6Z2qx6qXP1tKfX1JLeC\neJsE/UgkrS94HG6SsiO2YDjsD29qP1TfX7jTr4ISE6Mx8w7dOcJnmwLHKrfQnNPn\nEr6YRzFmvzxlnyhLPGKcrBNM8qyD8DyVTsihNiYM1HmjHFpGhNkkh+Su/JTzGUmX\ngY7kMKDLDQKBgFzprmC1z7/T2IRQZ5CjQCbj9uYSj2MIEa8kP/IfHoKVMLXMJdtw\nx60LCvVP78ixq8LCgIIJOYGnzZ9EJZvqO19N/ZpBGWnWkxjvbEb6/qTjLnASUE4Y\nyL48lZdxDKnf3/06yULW1xjHRFnCBZ5LwLX6x7y8jiDtXeUJwEBEVS8RAoGAA44N\nj6F8lUKL9Q7GdWK0V5kOJcr84U7nvKEmJWG2mvOlKSWWFPHj3zPJRtIEzwYr3/2t\niLNnvUBuNSFrQ7yq5kpnYCXEVjA25MV+eI5z9hxoAc8evczZ0Jp9r3eVX57++QFH\nWKcUP20Pu8jXFJOOhxiG2g9nMd7A80Z/yJAD4bkCgYBB3Iq0c29qMOOXJv8dCO+B\nepSQGb0dzPdXK5tOVQB+SPCB2qk3Z4UUmHwsYV5OdJVVU6CQ96Q6RQjxr041j6Kr\nGCF2iJrBCeKNUU0gAY3QQpLkZeV+FzRiYWBBLFScCMv70J6uwIArVQo7Jk5HzIUF\nHNKHLsL8MihG9L9+aHHrXg==\n-----END PRIVATE KEY-----\n",
    },
  });
};

// Fonction pour analyser l'image avec Google Vision API
async function analyzeImage(imagePath) {
  try {
    const visionClient = configureVisionClient();
    
    // Convertir l'image en base64
    const imageFile = fs.readFileSync(imagePath);
    const encodedImage = imageFile.toString('base64');
    
    // Analyser l'image
    const [labelResult] = await visionClient.labelDetection({
      image: { content: encodedImage }
    });
    const [colorResult] = await visionClient.imageProperties({
      image: { content: encodedImage }
    });
    const [objectResult] = await visionClient.objectLocalization({
      image: { content: encodedImage }
    });

    // Extraire les labels pertinents (vêtements, styles, etc.)
    const clothingLabels = labelResult.labelAnnotations.filter(label => {
      const clothingKeywords = ['clothing', 'dress', 'shirt', 'pants', 'jacket', 'suit', 
                              'coat', 'shoe', 'fashion', 'style', 'outfit', 'skirt', 
                              'blouse', 'jeans', 'sweater', 'hoodie', 'tshirt', 't-shirt'];
      return clothingKeywords.some(keyword => 
        label.description.toLowerCase().includes(keyword));
    });

    // Extraire les couleurs dominantes
    const colors = colorResult.imagePropertiesAnnotation.dominantColors.colors
      .slice(0, 3)
      .map(color => {
        const { red, green, blue } = color.color;
        return {
          rgb: `rgb(${red}, ${green}, ${blue})`,
          score: color.score,
          pixelFraction: color.pixelFraction
        };
      });

    // Extraire les objets détectés
    const objects = objectResult.localizedObjectAnnotations.map(obj => ({
      name: obj.name,
      confidence: obj.score
    }));

    return {
      labels: clothingLabels,
      colors,
      objects
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    throw error;
  }
}

// Fonction pour rechercher des produits similaires
async function searchSimilarProducts(query) {
  try {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
    
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx,
        q: query,
        searchType: 'image',
        num: 10
      }
    });

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
    console.error('Erreur lors de la recherche de produits:', error);
    throw error;
  }
}

// Fonction utilitaire pour extraire un prix d'un texte
function extractPrice(title, snippet) {
  const combined = `${title} ${snippet}`;
  const priceRegex = /(\$|€|£|CAD|EUR|USD)?\s?(\d+[\.,]\d{2}|\d+)/;
  const match = combined.match(priceRegex);
  
  if (match) {
    return match[0];
  }
  return null;
}

// Route pour analyser une image et trouver des produits similaires
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image n\'a été téléchargée' });
    }

    const imagePath = req.file.path;
    
    // Analyser l'image
    const analysisResults = await analyzeImage(imagePath);
    
    // Construire une requête à partir des résultats d'analyse
    const labels = analysisResults.labels.map(label => label.description);
    const objects = analysisResults.objects.map(obj => obj.name);
    const searchQuery = [...labels, ...objects].slice(0, 5).join(' ');
    
    // Rechercher des produits similaires
    const similarProducts = await searchSimilarProducts(searchQuery);
    
    res.json({
      analysis: analysisResults,
      searchQuery,
      similarProducts
    });
    
    // Nettoyer le fichier après utilisation
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Erreur lors de la suppression du fichier:', err);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'analyse de l\'image' });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionnelle!' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
