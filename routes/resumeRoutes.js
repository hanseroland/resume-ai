const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const resumeController = require('../controllers/resumeController');

// Afficher les informations d'un seul CV par son id
router.get('/:id',authMiddleware, resumeController.getById);

// récupérer les CV d'un utilisateur donné en fonction de son ID
router.get('/user/:userId',authMiddleware, resumeController.getByUserId)

// Récupérer les 3 derniers CV d'un utilisateur donné
router.get('/user/:userId/latest',authMiddleware, resumeController.getLatest);

// Compter les CV d'un utilisateur spécifique
router.get('/user/count/:userId',authMiddleware, resumeController.getUserResumeCount);

// Compter TOUS les CV de la plateforme (pour admin)
router.get('/count/all',authMiddleware,adminMiddleware, resumeController.getAllResumesCount);

// Compter les CV par mois pour l'année en cours
router.get('/stats/monthly',authMiddleware,adminMiddleware, resumeController.getMonthlyStats);

// Compter les CV créés au cours de la dernière semaine, regroupés par jour
router.get('/stats/weekly-activity',authMiddleware,adminMiddleware, resumeController.getWeeklyActivityStats);

// calculer la performance hebdomadaire en comparant le nombre de CV créés cette semaine par rapport à la semaine précédente
router.get('/stats/weekly-performance',authMiddleware,adminMiddleware, resumeController.getWeeklyPerformance);

//Route pour créer un nouveau CV
router.post('/create',authMiddleware, resumeController.create);

// Route pour mettre à jour les détails personnels d'un CV
router.put('/update-personal-info/:resumeId',authMiddleware,resumeController.updatePersonalInfo);

// Route pour mettre à jour les détails personnels d'un CV
router.put('/update-summary-info/:resumeId',authMiddleware, resumeController.updateSummary);



/*************************** */
/*Routes avec l'API de OpenAI*
/***************************/

// Route pour générer du texte pour le CV en fonction d'un prompt avec l'API OpenAI
router.post('/openai-generate-text',authMiddleware, resumeController.generateAiText);

// Route pour générer du texte pour le CV en fonction d'un prompt avec l'API OpenAI
router.post('/openai-generate-three-textes',authMiddleware, resumeController.generateThreeSummaries);

// Route pour générer une Expérience 
router.post('/openai-generate-experience-list',authMiddleware, resumeController.generateExperienceList);

/** FIN API de OPENAI ******/




/*************************** */
/*Routes avec l'API de GEMINI
/
/***************************/

router.post('/gemini-generate-text',authMiddleware, resumeController.generateAiText)

router.post('/gemini-generate-three-textes',authMiddleware, resumeController.generateThreeSummaries)

router.post('/gemini-generate-experience-list',authMiddleware, resumeController.generateExperienceList)

/** FIN API de GEMINI ******/



// Route pour mettre à jour l'éducation d'un CV
router.put('/update-educations-info/:resumeId',authMiddleware, resumeController.updateEducations);


// Route pour mettre à jour les expériences d'un CV
router.put('/update-experiences-info/:resumeId',authMiddleware, resumeController.updateExperiences);


// Route pour mettre à jour des skills d'un CV
router.put('/update-skills-info/:resumeId',authMiddleware, resumeController.updateSkills);

// Route pour mettre à jour des projets d'un CV
router.put('/update-projects-info/:resumeId',authMiddleware, resumeController.updateProjects);

// Route pour mettre à jour des certifications d'un CV
router.put('/update-certifications-info/:resumeId',authMiddleware, resumeController.updateCertifications);


// Route pour mettre à jour les hobbies d'un CV
router.put('/update-hobbies-info/:resumeId',authMiddleware, resumeController.updateHobbies);


// Route pour mettre à jour les langue d'un CV
router.put('/update-languages-info/:resumeId',authMiddleware, resumeController.updateLanguages);

// Supprimer un utilisateur
router.delete('/delete-resume/:id',authMiddleware, resumeController.delete);


module.exports = router;