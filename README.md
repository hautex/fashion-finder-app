# Fashion Finder App

![Fashion Finder Logo](https://img.icons8.com/color/96/000000/clothes.png)

Application qui permet de trouver des vêtements similaires à partir d'une photo en utilisant les APIs Google Vision et Google Custom Search.

## 🌟 Fonctionnalités

- **Upload d'images** : glisser-déposer ou sélection de fichier
- **Analyse d'images** : détection du type de vêtement, couleur et style via Google Vision API
- **Recherche intelligente** : recherche de produits similaires sur Google Shopping
- **UI intuitive** : interface utilisateur moderne avec Tailwind CSS
- **Résultats détaillés** : affichage des images, prix, description et liens d'achat

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express
- **Frontend** : React, Tailwind CSS
- **APIs** : Google Vision API, Google Custom Search API

## 🚀 Installation rapide

### Windows

1. Clonez ce dépôt
   ```
   git clone https://github.com/hautex/fashion-finder-app.git
   cd fashion-finder-app
   ```

2. Exécutez le script de démarrage
   ```
   scripts\start-app.bat
   ```

3. L'application s'ouvrira automatiquement dans votre navigateur

### Installation manuelle (tous systèmes)

Voir les instructions détaillées dans [INSTRUCTIONS.md](INSTRUCTIONS.md)

## 📸 Comment utiliser

1. **Téléchargez une image** d'un vêtement que vous aimez
2. **Cliquez sur "Analyser l'image"**
3. **Découvrez les produits similaires** avec leurs liens d'achat

## 💻 Structure du projet

```
fashion-finder-app/
├── backend/             # Serveur Node.js
│   ├── index.js         # API Express
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

Pour vérifier l'activation des APIs :
```
scripts\check-google-api.bat
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 📬 Contact

Pour toute question ou suggestion, veuillez ouvrir une issue sur ce dépôt GitHub.

---

Développé avec ❤️ pour simplifier votre shopping en ligne
