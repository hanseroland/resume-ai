# AI Resume - API REST de Génération de CV Assistée par l'IA

Une **API REST complète** pour la création, gestion et génération intelligente de CV, construite avec **Node.js**, **Express** et **MongoDB**. Interface intégrée avec les **LLMs les plus puissants** (OpenAI & Google Gemini) pour générer automatiquement des contenus professionnels.

## Table des matières

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Routes API](#routes-api)
- [Fonctionnalités coeur](#fonctionnalités-coeur)
- [Intégrations externes](#intégrations-externes)
- [Scripts disponibles](#scripts-disponibles)
- [Dépendances principales](#dépendances-principales)
- [Auteur](#auteur)

---

## Présentation

**AI Resume** est une plateforme complète de gestion de CV qui permet de :

 **Authentification & Sécurité**
- Créer des comptes utilisateurs avec activation par email
- Login sécurisé avec JWT (Access Token + Refresh Token)
- Gestion des rôles (Administrateur / Utilisateur standard)
- Réinitialisation de mot de passe par email

 **Gestion de CV**
- Créer, modifier et supprimer des CV
- Gérer les sections : infos personnelles, résumé, expériences, formations, compétences, langues, projets, certifications
- Thèmes et styles personnalisables
- Multi-CV par utilisateur

 **Intelligence Artificielle**
- Générer des résumés professionnels avec OpenAI ou Google Gemini
- Créer automatiquement des descriptions d'expériences
- Générer 3 variantes de texte pour choisir la meilleure

 **Dashboard Admin**
- Statistiques globales (utilisateurs, CV créés, tendances)
- Monitoring de l'activité hebdomadaire/mensuelle
- Gestion des utilisateurs

 **Médias**
- Upload de photos de profil via Cloudinary
- Stockage sécurisé et optimisé

---

## Stack technique

| Couche | Technologies |
|--------|--------------|
| **Runtime** | Node.js >= 18 |
| **Framework HTTP** | Express.js |
| **Base de données** | MongoDB (Mongoose ODM) |
| **Authentification** | JWT + Refresh Token + bcryptjs |
| **IA** | OpenAI API + Google Gemini API |
| **Emails** | Nodemailer (SMTP) |
| **Stockage** | Cloudinary |
| **Validation** | Express-validator + Joi |
| **Upload fichiers** | Multer |
| **Documentation** | Swagger/OpenAPI |
| **Sécurité** | Rate Limiting, CORS, Cookie-Parser |

---

## Prérequis

Avant de démarrer, assurez-vous d'avoir :

- **Node.js** >= 18 et npm
- **MongoDB** en local ou sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Clé API OpenAI** (optionnelle mais recommandée) — [obtenir une clé](https://platform.openai.com/api-keys)
- **Clé API Google Gemini** (optionnelle) — [obtenir une clé](https://ai.google.dev/)
- **Compte Cloudinary** pour l'upload d'images — [créer un compte](https://cloudinary.com/)
- **Serveur SMTP** pour l'envoi d'emails (Gmail, LWS, etc.)

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/hanseroland/ai-resume.git
cd ai-resume

# 2. Installer les dépendances du serveur
npm install

# 3. Installer les dépendances du client (React)
cd client
npm install
cd ..

# 4. Créer le fichier .env
cp server/.env.example server/.env

# 5. Remplir les variables d'environnement dans server/.env (voir section ci-dessous)

# 6. Lancer en développement (serveur + client)
npm run dev

# Ou lancer manuellement :
# Terminal 1 (serveur)
npm start

# Terminal 2 (client)
cd client && npm start
```

---

## Variables d'environnement

Créez un fichier `server/.env` avec les variables suivantes :

```env
# ============================================
# SERVEUR & ENVIRONNEMENT
# ============================================
PORT=5000
NODE_ENV=development
API_URL=/api/v1

# ============================================
# CORS & DOMAINES
# ============================================
CORS_ORIGIN_LOCAL=http://localhost:3000,http://localhost:5000,http://127.0.0.1:3000,http://127.0.0.1:5000
CORS_ORIGIN_ONLINE=https://votredomaine.com

BASE_URL=http://localhost:3000/
BASE_DOMAIN=

# ============================================
# BASE DE DONNÉES MONGODB
# ============================================
MONGODB_URL_LOCAL=mongodb://localhost:27017/resume_ai
MONGODB_URL_ONLINE=mongodb+srv://user:password@cluster.mongodb.net/resume_ai

# ============================================
# AUTHENTIFICATION JWT (OBLIGATOIRE)
# ============================================
JWT_SECRET=votre_clé_secrète_très_longue_et_sécurisée
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=votre_clé_refresh_très_longue_et_sécurisée
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# SÉCURITÉ
# ============================================
PASS_SEC=votre_clé_de_chiffrement_des_données_sensibles
PASS_MONGODB=votre_mot_de_passe_mongodb_atlas

# ============================================
# INTELLIGENCE ARTIFICIELLE
# ============================================
OPENAI_API_KEY=sk-proj-...
GOOGLE_GEMINI_API_KEY=AIza...

# ============================================
# EMAIL (NODEMAILER - SMTP)
# ============================================
LWS_EMAIL_HOST=smtp.lwsmail.com
LWS_EMAIL_PORT=587
LWS_EMAIL_SECURE=false
LWS_EMAIL_USER=votre@email.com
LWS_EMAIL_PASS=votre_mot_de_passe

# Ou Gmail / autre provider
# LWS_EMAIL_HOST=smtp.gmail.com
# LWS_EMAIL_PORT=587
# LWS_EMAIL_SECURE=false
# LWS_EMAIL_USER=votremail@gmail.com
# LWS_EMAIL_PASS=votre_mot_de_passe_appli

# ============================================
# CLOUDINARY (UPLOAD D'IMAGES)
# ============================================
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# ============================================
# OPTIONNEL
# ============================================
LOCALHOST=http://localhost:3000
renderUrl=https://votre-api-render.onrender.com
```

> ⚠️ **Important** : `JWT_SECRET` et `JWT_REFRESH_SECRET` sont **obligatoires** — l'application ne démarrera pas sans eux.

---

## Structure du projet

```
ai-resume/
├── server/                          # Backend (Node.js/Express)
│   ├── controllers/                 # Logique métier (handler des routes)
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   └── userController.js
│   │
│   ├── models/                      # Schémas Mongoose (entités)
│   │   ├── User.js
│   │   ├── Resume.js
│   │   └── RefreshTokenModel.js
│   │
│   ├── routes/                      # Définition des routes API
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/                    # Logique métier réutilisable
│   │   ├── aiService.js             # OpenAI & Gemini
│   │   ├── userService.js
│   │   ├── resumeService.js
│   │   ├── refreshTokenService.js
│   │   └── uploadService.js         # Cloudinary
│   │
│   ├── middlewares/                 # Middlewares Express
│   │   ├── authMiddleware.js        # Vérification JWT
│   │   ├── adminMiddleware.js       # Vérification rôle admin
│   │   ├── errorHandler.js          # Gestion centralisée des erreurs
│   │   ├── validatorMiddleware.js   # Validation des requêtes
│   │   └── asyncHandler.js
│   │
│   ├── utils/                       # Utilitaires
│   │   ├── jwtService.js
│   │   ├── emailServices.js
│   │   ├── passwordService.js
│   │   ├── cryptoService.js
│   │   └── cloudinary.js
│   │
│   ├── public/
│   │   └── profile/                 # Photos de profil uploadées
│   │
│   ├── server.js                    # Point d'entrée
│   ├── package.json
│   └── .env                         # Variables d'environnement
|     |
    ├── package.json                 # Scripts globaux (root)
    └── README.md

```

---

## Routes API

### 🔐 Authentification `/api/v1/auth`

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/register` | Créer un compte | ❌ |
| POST | `/login` | Se connecter (JWT + Refresh Token) | ❌ |
| POST | `/logout` | Se déconnecter | ✅ |
| POST | `/refresh-token` | Renouveler le JWT expiré | ❌ |
| GET | `/activate/:token` | Activer le compte via email | ❌ |
| POST | `/forgot-password` | Demander la réinitialisation | ❌ |
| PUT | `/reset-password/:token` | Réinitialiser le mot de passe | ❌ |

**Rate Limiting** : 5 tentatives de login par IP tous les 15 minutes

---

### 📄 CV `/api/v1/resume`

| Méthode | Route | Description | Auth | Admin |
|---------|-------|-------------|------|-------|
| POST | `/create` | Créer un CV | ✅ | ❌ |
| GET | `/:id` | Consulter un CV | ✅ | ❌ |
| GET | `/user/:userId` | Récupérer tous mes CV | ✅ | ❌ |
| GET | `/user/:userId/latest` | Mes 3 derniers CV | ✅ | ❌ |
| GET | `/user/count/:userId` | Nombre de CV créés | ✅ | ❌ |
| PUT | `/update-personal-info/:resumeId` | Mettre à jour infos perso | ✅ | ❌ |
| PUT | `/update-summary-info/:resumeId` | Mettre à jour résumé | ✅ | ❌ |
| PUT | `/update-educations-info/:resumeId` | Mettre à jour formations | ✅ | ❌ |
| POST | `/openai-generate-text` | Générer texte avec OpenAI | ✅ | ❌ |
| POST | `/openai-generate-three-textes` | 3 variantes texte OpenAI | ✅ | ❌ |
| POST | `/openai-generate-experience-list` | Générer expériences OpenAI | ✅ | ❌ |
| POST | `/gemini-generate-text` | Générer texte avec Gemini | ✅ | ❌ |
| POST | `/gemini-generate-three-textes` | 3 variantes texte Gemini | ✅ | ❌ |
| POST | `/gemini-generate-experience-list` | Générer expériences Gemini | ✅ | ❌ |
| **Admin Routes** |
| GET | `/count/all` | Total CV en ligne | ✅ | ✅ |
| GET | `/stats/monthly` | CV créés par mois | ✅ | ✅ |
| GET | `/stats/weekly-activity` | Activité hebdomadaire | ✅ | ✅ |
| GET | `/stats/weekly-performance` | Performance semaine vs semaine | ✅ | ✅ |

---

### 👤 Utilisateurs `/api/v1/user`

| Méthode | Route | Description | Auth | Admin |
|---------|-------|-------------|------|-------|
| GET | `/current-user` | Mes infos | ✅ | ❌ |
| PUT | `/:id` | Modifier mon profil | ✅ | ❌ |
| PUT | `/update-picture/:id` | Modifier photo de profil | ✅ | ❌ |
| **Admin Routes** |
| GET | `/` | Tous les utilisateurs | ✅ | ✅ |
| GET | `/:id` | Un utilisateur | ✅ | ✅ |
| POST | `/add` | Créer un utilisateur | ✅ | ✅ |
| DELETE | `/:id` | Supprimer un utilisateur | ✅ | ✅ |
| GET | `/stats/global` | Statistiques globales | ✅ | ✅ |
| GET | `/count` | Nombre total d'utilisateurs | ✅ | ✅ |
| GET | `/recent` | Utilisateurs récents | ✅ | ✅ |
| GET | `/users/count/admins` | Nombre d'admins | ✅ | ✅ |
| GET | `/users/count/standard` | Nombre users standard | ✅ | ✅ |

---

## Fonctionnalités coeur

### 🤖 Génération IA

L'API intègre deux LLMs puissants pour générer du contenu professionnel :

**OpenAI (GPT-4/3.5)**
```javascript
POST /api/v1/resume/openai-generate-text
Body: {
  "prompt": "Décris mes expériences en management...",
  "resumeId": "..."
}
```

**Google Gemini**
```javascript
POST /api/v1/resume/gemini-generate-text
Body: {
  "prompt": "Décris expériences...",
  "resumeId": "..."
}
```

### 🔐 Authentification JWT

- **Access Token** : durée courte (15 min)
- **Refresh Token** : durée longue (7 jours), stocké en base
- Rotation automatique lors de la réinitialisation

### 📊 Dashboard Admin

Statistiques en temps réel :
- Utilisateurs actifs / total
- CV créés (hebdo/mensuel)
- Tendances d'utilisation
- Répartition admin/utilisateurs

### 📸 Upload d'images optimisé

Via **Cloudinary** :
- Photos de profil compressées & redimensionnées
- CDN global pour accès rapide
- Gestion automatique des versions

---

## Intégrations externes

| Service | Usage | Docs |
|---------|-------|------|
| **MongoDB** | Base de données | [Mongoose Docs](https://mongoosejs.com/) |
| **OpenAI** | Génération texte IA | [API Docs](https://platform.openai.com/docs) |
| **Google Gemini** | Génération texte IA | [API Docs](https://ai.google.dev/docs) |
| **Cloudinary** | Stockage images | [Docs](https://cloudinary.com/documentation) |
| **Nodemailer** | Envoi emails | [Docs](https://nodemailer.com/) |
| **Stripe** | Paiements (optionnel) | [API Docs](https://stripe.com/docs) |

---

## Scripts disponibles

```bash
# Développement
npm start          # Lancer le serveur avec nodemon (rechargement auto)

# Production
npm run build       # Builder le client React
npm run prod       # Démarrer en production

# Contrôle qualité
npm test           # Lancer les tests (si configués)
npm run lint       # Vérifier la syntaxe (si configué)
```

---

## Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| `express` | ^4.18.2 | Framework HTTP |
| `mongoose` | ^8.5.1 | ODM MongoDB |
| `jsonwebtoken` | ^9.0.0 | Génération/Vérification JWT |
| `bcryptjs` | ^2.4.3 | Hash mots de passe |
| `nodemailer` | ^6.10.1 | Envoi emails |
| `openai` | ^4.83.0 | Client OpenAI |
| `@google/genai` | ^1.40.0 | Client Google Gemini |
| `cloudinary` | ^2.9.0 | Upload images |
| `express-validator` | ^7.2.0 | Validation requêtes |
| `multer` | ^1.4.5 | Upload fichiers |
| `joi` | ^17.13.3 | Validation schémas |
| `express-rate-limit` | ^7.5.1 | Rate limiting |
| `swagger-ui-express` | ^5.0.0 | Documentation API |

---

## Documentation API

Après le démarrage, accédez à la documentation interactive :

```
http://localhost:5000/api-docs
```

Vous pouvez y :
- Visualiser tous les endpoints
- Voir les schémas de requête/réponse
- Tester directement depuis le navigateur

---

## Architecture & Principes

Le projet applique les **bonnes pratiques** :

 **Séparation des responsabilités** — Controllers, Services, Models distincts  
 **Gestion centralisée des erreurs** — Middleware errorHandler global  
 **Validation stricte** — Express-validator + Joi  
 **Authentification robuste** — JWT + Refresh Token rotation  
 **Sécurité** — Rate limiting, CORS, mot de passe hashé bcrypt  
 **Code réutilisable** — Services et utilitaires partagés  
 **Documentation** — Swagger/OpenAPI + Commentaires JSDoc  

---

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Vérifier la connexion
# 1. MongoDB local doit être lancé
mongod

# 2. Ou utiliser MongoDB Atlas dans .env
MONGODB_URL_ONLINE=mongodb+srv://...
```

### "JWT_SECRET not provided"
```bash
# Générer une clé secrète sécurisée
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ajouter à .env
JWT_SECRET=<votre_clé_générée>
```

### "Email not sending"
```bash
# Vérifier les paramètres SMTP
# Pour Gmail :
# 1. Activer "Less secure app access" ou générer un mot de passe appli
# 2. Utiliser le mot de passe spécifique à l'appli dans LWS_EMAIL_PASS
```

---

## Auteur

Développé par **NGUEMA NTOUGOU Hanse Roland Parfait**

-  Email : [rolandntougou@gmail.com](mailto:rolandntougou@gmail.com)
-  GitHub : [@hanseroland](https://github.com/hanseroland)
-  Projet : [AI Resume](https://ai-resume.app)

---

## License

MIT License — Voir le fichier [LICENSE](./server/LICENSE) pour les détails.

---
