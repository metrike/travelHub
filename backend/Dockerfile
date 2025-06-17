# Étape 1 : Image Node officielle
FROM node:18

# Étape 2 : Créer le dossier app dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers package
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier le reste de l'app
COPY . .

# Étape 6 : Exposer le port (doit correspondre à app.listen)
EXPOSE 8000

# Étape 7 : Lancer le serveur
CMD ["node", "src/index.js"]
