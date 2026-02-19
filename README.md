# Server - Resume AI

API REST backend pour la gestion des CV et des profils utilisateurs.

## 📋 Vue d'ensemble

Ce serveur Node.js/Express fournit une API complète pour :
- Authentification et gestion des utilisateurs
- Création, édition et suppression de CV
- Génération assistée par IA (OpenAI, Google Gemini)
- Gestion des profils utilisateurs
- Envoi d'emails


## 🎯 Caractéristiques principales

- **Authentification JWT** : Sécurisation des endpoints via tokens JWT
- **Intégration IA** : OpenAI et Google Gemini pour l'amélioration des CV
- **Gestion des emails** : Activation de compte, réinitialisation de mot de passe
- **Stockage de fichiers** : Upload et gestion des images de profil
- **CORS configurable** : Support multi-environnement (local et production)
- **Validation robuste** : Joi et express-validator
- **Gestion d'erreurs centralisée** : Middleware d'erreur personnalisé
- **Limite de débit** : Protection contre les abus avec express-rate-limit

## 🛠️ Technologies utilisées

- **Express.js** (v4.18.2) - Framework web
- **MongoDB & Mongoose** (v8.5.1) - Base de données et ODM
- **JWT** (jsonwebtoken v9.0.0) - Authentification
- **bcryptjs** - Hachage des mots de passe
- **OpenAI API** - Génération et amélioration de contenu
- **Google Gemini API** - IA générative
- **Nodemailer** - Envoi d'emails
- **Multer** - Upload de fichiers
- **Express Rate Limit** - Limitation du débit

## 📦 Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- MongoDB (local ou Atlas)
- Clés API : OpenAI, Google Gemini (optionnel)

## 🚀 Installation et démarrage

### 1. Installer les dépendances

```bash
cd server
npm install
```

### 2. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du dossier `server/` avec les variables suivantes :

```env
# API Configuration
API_URL=/api/v1
PORT=5000
NODE_ENV=development

# Frontend URL
BASE_URL=http://localhost:3000/
LOCALHOST=http://localhost:3000

# Database
MONGODB_URL_LOCAL=mongodb://localhost:27017/resume-ai
MONGODB_URL_ONLINE=mongodb+srv://username:password@cluster.mongodb.net/resume-ai
PASS_MONGODB=your_mongodb_password

# Authentication
JWT_SECRET=your_secret_key_here
PASS_SEC=your_encryption_secret_here

# CORS Configuration
CORS_ORIGIN_LOCAL=http://localhost:3000,http://localhost:5000,http://127.0.0.1:3000,http://127.0.0.1:5000
CORS_ORIGIN_ONLINE=https://your-production-domain.com

# AI APIs
OPENAI_API_KEY=sk-your_openai_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Email Service (Nodemailer)
LWS_EMAIL_HOST=mail.your-domain.com
LWS_EMAIL_USER=noreply@your-domain.com
LWS_EMAIL_PASS=your_email_password
LWS_EMAIL_PORT=465
LWS_EMAIL_SECURE=true

# Deployment
renderUrl=https://api.your-domain.com
```

### 3. Démarrer le serveur

En mode développement :
```bash
npm start
```

Le serveur sera accessible à `http://localhost:5000`

## 📁 Structure du projet

```
server/
├── routes/                  # Définition des routes
│   ├── authRoutes.js       # Authentification (register, login, reset password)
│   ├── resumeRoutes.js     # Gestion des CV
│   └── userRoutes.js       # Gestion des profils utilisateurs
├── models/                  # Modèles Mongoose
│   ├── User.js             # Schéma utilisateur
│   └── Resume.js           # Schéma CV
├── middlewares/            # Middlewares personnalisés
│   ├── authMiddleware.js   # Vérification JWT
│   └── errorHandler.js     # Gestion centralisée des erreurs
├── utils/                   # Fonctions utilitaires
│   ├── emailServices.js    # Service d'envoi d'emails
│   └── token.js            # Gestion des tokens
├── public/                  # Fichiers statiques
│   └── profile/            # Images de profil des utilisateurs
├── server.js               # Point d'entrée
├── package.json            # Dépendances
└── .env                    # Variables d'environnement
```

## 🔐 Modèles de données

### User

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  isAdmin: Boolean,
  activated: Boolean,
  activationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resumes: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Resume

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  theme: Number,
  categorie: String,
  personalInfo: {
    fullName: String,
    jobTitle: String,
    address: String,
    phone: String,
    email: String
  },
  summary: String,
  experiences: [
    {
      jobTitle: String,
      companyName: String,
      city: String,
      country: String,
      startDate: Date,
      endDate: Date,
      workSummary: String
    }
  ],
  skills: [{ name: String, level: Number }],
  educations: [
    {
      degree: String,
      schoolName: String,
      city: String,
      country: String,
      startDate: Date,
      endDate: Date
    }
  ],
  hobbies: [String],
  languages: [{ name: String, note: String }],
  certifications: [
    {
      title: String,
      issuingOrganization: String,
      dateIssued: Date
    }
  ],
  projects: [
    {
      projectTitle: String,
      projectDescription: String,
      link: String
    }
  ]
}
```

## 🌐 Endpoints API

### Authentification (`/api/v1/auth`)

- `POST /register` - Créer un compte utilisateur
- `POST /login` - Connexion utilisateur
- `POST /forget-password` - Demander une réinitialisation de mot de passe
- `POST /reset-password/:token` - Réinitialiser le mot de passe
- `POST /activate/:token` - Activer le compte utilisateur
- `POST /refresh-token` - Renouveler le token JWT

### CV (`/api/v1/resumes`)

- `GET /` - Récupérer tous les CV de l'utilisateur
- `GET /:id` - Récupérer un CV spécifique
- `POST /` - Créer un nouveau CV
- `PUT /:id` - Mettre à jour un CV
- `DELETE /:id` - Supprimer un CV
- `POST /:id/optimize` - Optimiser un CV avec l'IA

### Utilisateurs (`/api/v1/users`)

- `GET /profile` - Récupérer le profil de l'utilisateur
- `PUT /profile` - Mettre à jour le profil
- `POST /profile-picture` - Upload une photo de profil
- `DELETE /profile` - Supprimer le compte
- `GET /` - Récupérer tous les utilisateurs (admin)
- `DELETE /:id` - Supprimer un utilisateur (admin)

## 🔒 Sécurité et Middlewares

### Authentification JWT

```javascript
// Middleware authMiddleware.js
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token invalide' });
  }
};
```

### Gestion des erreurs

```javascript
// Middleware errorHandler.js permet une gestion centralisée des erreurs
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Erreur serveur';
  res.status(status).json({ success: false, message });
});
```

## 📧 Services d'email

### Nodemailer Configuration

Le serveur utilise Nodemailer pour envoyer des emails via votre serveur SMTP :

```javascript
// emailServices.js
const transporter = nodemailer.createTransport({
  host: process.env.LWS_EMAIL_HOST,
  port: process.env.LWS_EMAIL_PORT,
  secure: process.env.LWS_EMAIL_SECURE === 'true',
  auth: {
    user: process.env.LWS_EMAIL_USER,
    pass: process.env.LWS_EMAIL_PASS
  }
});

// Envoi d'email d'activation
await sendActivationEmail(email, activationLink);

// Envoi d'email de réinitialisation
await sendResetPasswordEmail(email, resetLink);
```

## 🤖 Intégrations IA

### OpenAI

Permet d'améliorer et de générer du contenu pour les CV :

```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Utilisation dans les routes
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...]
});
```

### Google Gemini

Offre une alternative IA avec des capacités avancées :

```javascript
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

// Génération avec recherche web
const response = await client.models.generateContent({
  model: 'gemini-3-flash-preview',
  tools: [{ googleSearch: {} }],
  // ...
});
```


## 📤 Upload de fichiers

Utilise Multer pour gérer les uploads :

```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './public/profile/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
```

## 📊 Validation des données

### Joi

Validation au niveau global :

```javascript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required()
});
```

### Express-validator

Validation au niveau des routes :

```javascript
app.post('/endpoint', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
});
```

## 🧪 Tests

Actuellement aucun test configuré. Ajouter des tests Jest ou Mocha :

```bash
npm test
```


## 🌐 Configuration CORS

### Environnement de développement

```env
CORS_ORIGIN_LOCAL=http://localhost:3000,http://localhost:5000,http://127.0.0.1:3000,http://127.0.0.1:5000
```

### Environnement de production

```env
CORS_ORIGIN_ONLINE=https://your-production-domain.com
```

## 🚢 Déploiement

### Utiliser Render.com

1. Connecter le repository GitHub à Render
2. Définir les variables d'environnement dans le tableau de bord Render
3. Le build et le déploiement se font automatiquement

### Utiliser Railway

1. Connecter le repository
2. Ajouter un service MongoDB
3. Configurer les variables d'environnement
4. Déployer

### Heroku (anciennes méthodes)

```bash
heroku login
heroku create app-name
git push heroku main
```

## 📝 Conventions de code

### Structure des routes

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Route protégée
router.get('/protected', authMiddleware, async (req, res) => {
  try {
    // Logique métier
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

### Gestion des erreurs

```javascript
try {
  // Votre code
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue'
  });
}
```

## 🔗 Variables d'environnement essentielles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `API_URL` | Préfixe API | `/api/v1` |
| `PORT` | Port du serveur | `5000` |
| `NODE_ENV` | Environnement | `development` ou `production` |
| `MONGODB_URL_LOCAL` | MongoDB local | `mongodb://localhost:27017/resume-ai` |
| `MONGODB_URL_ONLINE` | MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Secret JWT | Clé secrète aléatoire complexe |
| `OPENAI_API_KEY` | Clé OpenAI | `sk-...` |
| `GOOGLE_GEMINI_API_KEY` | Clé Gemini | Clé API Google |
| `LWS_EMAIL_*` | Configuration email | Détails du serveur SMTP |
| `CORS_ORIGIN_LOCAL` | Origines CORS local | `http://localhost:3000` |

## 🤝 Contribution

1. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
2. Commiter les changements (`git commit -m 'Add some AmazingFeature'`)
3. Pousser vers la branche (`git push origin feature/AmazingFeature`)
4. Ouvrir une Pull Request

## 📞 Support et Dépannage

### Problèmes courants

**Connexion MongoDB échouée**
- Vérifier la string de connexion dans `.env`
- Vérifier que MongoDB est en cours d'exécution
- Pour Atlas, vérifier l'IP whitelist

**Erreurs d'authentification**
- Vérifier que `JWT_SECRET` est défini
- Vérifier que le token n'a pas expiré

**Mails non envoyés**
- Vérifier les identifiants email
- Vérifier que le port SMTP est correct
- Vérifier les logs Nodemailer

## 📄 Licence

Ce projet fait partie du projet Resume AI.
