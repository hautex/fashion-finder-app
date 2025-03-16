# Fashion Finder App

![Fashion Finder Logo](https://img.icons8.com/color/96/000000/clothes.png)

Application qui permet de trouver des vêtements similaires à partir d'une photo en utilisant les APIs Google Vision et Google Custom Search.

## 🌟 Fonctionnalités

- **Upload d'images** : glisser-déposer ou sélection de fichier
- **Analyse d'images** : détection du type de vêtement, couleur et style via Google Vision API
- **Recherche intelligente** : recherche de produits similaires sur Google Shopping
- **UI intuitive** : interface utilisateur moderne avec Tailwind CSS
- **Résultats détaillés** : affichage des images, prix, description et liens d'achat
- **Gestion d'erreurs avancée** : diagnostic des problèmes d'API et conseils de dépannage
- **Vérification automatique** : test des services Google pour garantir le bon fonctionnement

## 🚀 Installation rapide

### Méthode recommandée (Windows)

1. Clonez ce dépôt
   ```
   git clone https://github.com/hautex/fashion-finder-app.git
   cd fashion-finder-app
   ```

2. Exécutez le script de vérification pour s'assurer que les APIs sont disponibles
   ```
   scripts\check-google-api.bat
   ```

3. Ou directement le script de démarrage
   ```
   scripts\start-app.bat
   ```

4. L'application s'ouvrira automatiquement dans votre navigateur

### Installation manuelle (tous systèmes)

Voir les instructions détaillées dans [INSTRUCTIONS.md](INSTRUCTIONS.md)

## 📸 Comment utiliser

1. **Téléchargez une image** d'un vêtement que vous aimez
2. **Vérifiez l'état des API** dans le panneau supérieur
3. **Cliquez sur "Analyser l'image"**
4. **Découvrez les produits similaires** avec leurs liens d'achat

## 🔍 Astuces pour de meilleurs résultats

- Utilisez des images nettes et bien éclairées
- Le vêtement devrait occuper la majorité de l'image
- Préférez les images avec un fond simple
- Évitez les images avec plusieurs vêtements ou personnes

## 💻 Structure du projet

```
fashion-finder-app/
├── backend/             # Serveur Node.js
│   ├── index.js         # API Express avec intégration Google
│   ├── package.json     # Dépendances backend
│   └── .env.local       # Variables d'environnement
├── frontend/            # Application React
│   ├── public/          # Fichiers statiques
│   ├── src/             # Code source React
│   └── package.json     # Dépendances frontend
└── scripts/             # Scripts utilitaires
    ├── start-app.bat            # Script de démarrage tout-en-un
    ├── check-google-api.bat     # Vérification de l'activation des APIs
    └── install-tailwind-deps.bat # Installation des dépendances Tailwind
```

## 🔑 Configuration des APIs

L'application est configurée avec :
- Clé API Google Vision : `AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ`
- ID du moteur de recherche : `233b9e048806d4add`

Pour obtenir vos propres clés API:
1. Créez un projet dans [Google Cloud Console](https://console.cloud.google.com/)
2. Activez les APIs "Vision API" et "Custom Search API"
3. Créez une clé API dans "Identifiants"
4. Créez un moteur de recherche personnalisé sur [Programmable Search Engine](https://programmablesearchengine.google.com/)
5. Mettez à jour les valeurs dans le fichier `backend/.env.local`

## 🔧 Dépannage

Si vous rencontrez des problèmes :

1. Exécutez le script de vérification pour diagnostiquer les problèmes d'API
   ```
   scripts\check-google-api.bat
   ```

2. Vérifiez que les APIs Google sont activées et que les clés API fonctionnent
3. Consultez les logs dans les terminaux du backend et frontend
4. Essayez avec différentes images si l'analyse échoue

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📬 Contact

Pour toute question ou suggestion, veuillez ouvrir une issue sur ce dépôt GitHub.

---

Développé avec ❤️ pour simplifier votre shopping en ligne
