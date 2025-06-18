
# TravelHub – Projet Fullstack (MongoDB / Redis / Neo4j)

Ce dépôt contient :

```
.
├─ docker-compose.yml   # MongoDB, Redis, Neo4j, API
├─ backend/             # API Node.js / Express
└─ frontend/            # Interface React + Vite + Tailwind
```

## 1. Prérequis

| Outil                 | Version conseillée |
|----------------------|--------------------|
| Docker & Docker Compose | ≥ 20.10         |
| Node.js              | ≥ 18 LTS           |
| npm                  | livré avec Node.js |

---

## 2. Lancer la stack back-end (bases + API)

```bash
# À la racine du projet
docker compose up -d         # démarre MongoDB, Redis, Neo4j et l’API
```

Les conteneurs se lancent en arrière-plan (-d).  
Les données de démo sont automatiquement injectées (scripts `./backend/initdb` et init Neo4j).  
L’API Express écoute sur http://localhost:8000.

---

## 3. Installer les dépendances Node.js

```bash
# backend – (re)construction du conteneur faite par Docker, mais
# utile pour le développement hors-docker :
cd backend
npm install

# frontend
cd ../frontend
npm install
```

---

## 4. Lancer le front-end en mode dev

```bash
# Dans ./frontend
npm run dev
```

Vite ouvre l’app sur http://localhost:5173 (hot-reload automatique).  
**Assure-toi que la stack Docker tourne** (sinon le front ne trouvera pas l’API).

---

## 5. Points de contrôle rapides

| Vérification            | Commande |
|-------------------------|----------|
| Ping API                | `curl http://localhost:8000/ping` → `pong` |
| Liste d’offres          | `curl "http://localhost:8000/offers?from=PAR&to=TYO&limit=3"` |
| Recos Neo4j             | `curl "http://localhost:8000/reco?city=PAR&k=3"` |
| Métriques Prometheus    | `curl http://localhost:8000/metrics` |

---


## 6. Arrêt & nettoyage

```bash
docker compose down         # stoppe les conteneurs
docker compose down -v      # …et supprime aussi les volumes (remise à zéro des données)
```
