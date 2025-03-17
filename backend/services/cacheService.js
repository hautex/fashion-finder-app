/**
 * Service de cache pour stocker temporairement les résultats d'analyses et de recherches
 * Permet d'améliorer les performances en évitant des requêtes répétées aux APIs externes
 */

class CacheService {
  constructor(maxSize = 100, ttl = 3600000) { // 1 heure par défaut en millisecondes
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Génère une clé de cache à partir d'une requête
   * @param {String} type - Type de requête ('vision', 'search', etc.)
   * @param {Object} params - Paramètres de la requête
   * @returns {String} - Clé de cache unique
   */
  generateKey(type, params) {
    // Pour les requêtes de type 'vision', utiliser un hash de l'image
    if (type === 'vision' && params.imageHash) {
      return `vision:${params.imageHash}`;
    }
    
    // Pour les requêtes de recherche, combiner la requête et les filtres
    if (type === 'search') {
      const { query, itemType, color } = params;
      return `search:${query}-${itemType || 'default'}-${color || 'any'}`;
    }
    
    // Pour les requêtes de produit direct, utiliser l'URL
    if (type === 'product' && params.url) {
      return `product:${params.url}`;
    }
    
    // Cas général: convertir les paramètres en JSON et générer une clé
    return `${type}:${JSON.stringify(params)}`;
  }

  /**
   * Vérifie si une entrée est présente dans le cache et valide
   * @param {String} key - Clé de cache
   * @returns {Boolean} - True si l'entrée est valide
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    const entry = this.cache.get(key);
    const now = Date.now();
    
    // Vérifier si l'entrée a expiré
    if (now - entry.timestamp > this.ttl) {
      // Supprimer l'entrée expirée
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Récupère une entrée du cache
   * @param {String} type - Type de requête
   * @param {Object} params - Paramètres de la requête
   * @returns {Object|null} - Valeur en cache ou null si absente/expirée
   */
  get(type, params) {
    const key = this.generateKey(type, params);
    
    if (this.has(key)) {
      this.hits++;
      return this.cache.get(key).value;
    }
    
    this.misses++;
    return null;
  }

  /**
   * Ajoute ou met à jour une entrée dans le cache
   * @param {String} type - Type de requête
   * @param {Object} params - Paramètres de la requête
   * @param {*} value - Valeur à stocker
   * @returns {Boolean} - True si l'opération a réussi
   */
  set(type, params, value) {
    try {
      const key = this.generateKey(type, params);
      
      // Nettoyer le cache si nécessaire
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }
      
      // Ajouter la nouvelle entrée
      this.cache.set(key, {
        value,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
      return false;
    }
  }

  /**
   * Supprime l'entrée la plus ancienne du cache
   */
  evictOldest() {
    if (this.cache.size === 0) return;
    
    let oldestKey = null;
    let oldestTimestamp = Infinity;
    
    // Trouver l'entrée la plus ancienne
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    // Supprimer l'entrée la plus ancienne
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Supprime une entrée spécifique du cache
   * @param {String} type - Type de requête
   * @param {Object} params - Paramètres de la requête
   * @returns {Boolean} - True si l'entrée a été supprimée
   */
  invalidate(type, params) {
    const key = this.generateKey(type, params);
    return this.cache.delete(key);
  }

  /**
   * Vide complètement le cache
   */
  clear() {
    this.cache.clear();
    console.log('Cache vidé');
  }

  /**
   * Obtient des statistiques sur l'utilisation du cache
   * @returns {Object} - Statistiques du cache
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 
        ? (this.hits / (this.hits + this.misses)).toFixed(2) 
        : 0
    };
  }
}

// Exporter une instance singleton du service de cache
const cacheService = new CacheService();

module.exports = cacheService;
