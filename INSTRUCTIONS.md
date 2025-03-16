# Guide d'utilisation de Fashion Finder

Ce document vous guidera à travers l'installation et l'utilisation de l'application Fashion Finder.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- Un navigateur web moderne (Chrome, Firefox, Edge, etc.)

## Installation et démarrage

### Méthode simplifiée (Windows)

1. Clonez ce dépôt sur votre machine:
   ```
   git clone https://github.com/hautex/fashion-finder-app.git
   cd fashion-finder-app
   ```

2. Exécutez le script de démarrage:
   ```
   .\scripts\start-app.bat
   ```

3. Le script installera toutes les dépendances, démarrera le backend et le frontend, et ouvrira automatiquement l'application dans votre navigateur.

### Installation manuelle

Si vous n'utilisez pas Windows ou préférez une installation manuelle:

1. Clonez ce dépôt sur votre machine:
   ```
   git clone https://github.com/hautex/fashion-finder-app.git
   cd fashion-finder-app
   ```

2. Installez les dépendances du backend:
   ```
   cd backend
   npm install
   ```

3. Installez les dépendances du frontend:
   ```
   cd ../frontend
   npm install
   ```

4. Démarrez le backend:
   ```
   cd ../backend
   npm start
   ```

5. Dans un autre terminal, démarrez le frontend:
   ```
   cd ../frontend
   npm start
   ```

6. Ouvrez votre navigateur web à l'adresse [http://localhost:3000](http://localhost:3000)

## Utilisation de l'application

### Téléchargement d'une image

1. Sur la page principale, vous avez deux options pour télécharger une image:
   - Cliquez sur la zone de dépôt pour sélectionner une image depuis votre explorateur de fichiers
   - Glissez-déposez directement une image dans la zone prévue à cet effet

2. Une fois l'image sélectionnée, vous verrez un aperçu de celle-ci.

### Analyse de l'image

1. Cliquez sur le bouton "Analyser l'image".
2. Patientez pendant que le traitement s'effectue (analyse de l'image, détection des caractéristiques et recherche des produits similaires).
3. Un indicateur de chargement vous montrera que l'opération est en cours.

### Consultation des résultats

Une fois l'analyse terminée, vous verrez:

1. **Caractéristiques détectées**:
   - Description des éléments identifiés
   - Couleurs dominantes avec leur représentation visuelle
   - Objets détectés avec leur niveau de confiance

2. **Produits similaires**:
   - Images des produits trouvés
   - Titres des produits
   - Sites marchands
   - Prix (lorsque disponibles)
   - Liens directs vers les pages produits

Cliquez sur n'importe quel produit pour être redirigé vers la page du marchand où vous pourrez l'acheter.

## Configuration des APIs

L'application est déjà configurée avec:

- Clé API Google Vision: `AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ`
- Clé API Google Custom Search: `AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ`
- ID du moteur de recherche personnalisé: `233b9e048806d4add`

Ces clés sont stockées dans le fichier `.env.local` du backend.

## Dépannage

### L'application ne démarre pas

1. Vérifiez que Node.js est correctement installé:
   ```
   node --version
   ```

2. Assurez-vous que les ports 3000 et 5000 sont libres sur votre machine.

### Problèmes d'analyse d'image

1. Vérifiez que vous utilisez une image claire et de bonne qualité.
2. Assurez-vous que le vêtement est bien visible et occupe une partie significative de l'image.
3. Vérifiez votre connexion internet, car l'application a besoin d'accéder aux APIs Google.

### Autres problèmes

Si vous rencontrez d'autres problèmes, consultez les logs dans les terminaux backend et frontend pour identifier la cause de l'erreur.

## Support

Pour toute question ou assistance, veuillez ouvrir une issue sur le dépôt GitHub.
