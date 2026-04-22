const express = require('express')
const router = express.Router() 
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const resumeController = require('../controllers/resumeController');

// Appliquer le middleware d'auth à toutes les routes 
router.use(authMiddleware);

/**
 * ROUTES STATISTIQUES
 */

// Compter TOUS les CV de la plateforme (pour admin)
router.get('/stats/count-all',adminMiddleware, resumeController.getAllResumesCount);

// Compter les CV par mois pour l'année en cours
router.get('/stats/monthly',adminMiddleware, resumeController.getMonthlyStats);

// Compter les CV créés au cours de la dernière semaine, regroupés par jour
router.get('/stats/weekly-activity',adminMiddleware, resumeController.getWeeklyActivityStats);

// calculer la performance hebdomadaire en comparant le nombre de CV créés cette semaine par rapport à la semaine précédente
router.get('/stats/weekly-performance',adminMiddleware, resumeController.getWeeklyPerformance);


/**
 * ROUTES LIEES AUX USERS
 */

// récupérer les CV d'un utilisateur donné en fonction de son ID
router.get('/user/:userId', resumeController.getByUserId)

// Récupérer les 3 derniers CV d'un utilisateur donné
router.get('/user/:userId/latest', resumeController.getLatest);

// Compter les CV d'un utilisateur spécifique
router.get('/user/:userId/count', resumeController.getUserResumeCount);

/**
 * 
 * ROUTES IA
 */

router.post('/openai-generate-text', resumeController.generateAiText);
router.post('/openai-generate-three-textes', resumeController.generateThreeSummaries);
router.post('/openai-generate-experience-list', resumeController.generateExperienceList);


router.post('/gemini-generate-text', resumeController.generateAiText)
router.post('/gemini-generate-three-textes', resumeController.generateThreeSummaries)
router.post('/gemini-generate-experience-list', resumeController.generateExperienceList)


/**
 * CRUD
 */

// Afficher tous les CV
router.get('/', resumeController.findAll);

//Route pour créer un nouveau CV
router.post('/', resumeController.create);

// Afficher les informations d'un seul CV par son id
router.get('/:id', resumeController.getById);

// Supprimer un utilisateur
router.delete('/:id', resumeController.delete);


/**
 * MISES À JOUR PARTIELLES (Sections du CV)
 */



// Route pour mettre à jour les détails personnels d'un CV
router.put('/:resumeId/personal-info',resumeController.updatePersonalInfo);

// Route pour mettre à jour les détails personnels d'un CV
router.put('/:resumeId/summary', resumeController.updateSummary);

// Route pour mettre à jour l'éducation d'un CV
router.put('/:resumeId/educations', resumeController.updateEducations);


// Route pour mettre à jour les expériences d'un CV
router.put('/:resumeId/experiences', resumeController.updateExperiences);


// Route pour mettre à jour des skills d'un CV
router.put('/:resumeId/skills', resumeController.updateSkills);

// Route pour mettre à jour des projets d'un CV
router.put('/:resumeId/projects', resumeController.updateProjects);

// Route pour mettre à jour des certifications d'un CV
router.put('/:resumeId/certifications', resumeController.updateCertifications);


// Route pour mettre à jour les hobbies d'un CV
router.put('/:resumeId/hobbies', resumeController.updateHobbies);


// Route pour mettre à jour les langue d'un CV
router.put('/:resumeId/languages', resumeController.updateLanguages);

// routes/resumeRoutes.js
router.put('/:resumeId/color', authMiddleware, resumeController.updateColorTheme);


module.exports = router;