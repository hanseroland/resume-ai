const express = require('express')
const router = express.Router()

const resumeController = require('../controllers/resumeController');

// Afficher les informations d'un seul CV par son id
router.get('/:id', resumeController.getById);

// récupérer les CV d'un utilisateur donné en fonction de son ID
router.get('/user/:userId', resumeController.getByUserId)

// Récupérer les 3 derniers CV d'un utilisateur donné
router.get('/user/:userId/latest', resumeController.getLatest);

// Compter les CV d'un utilisateur spécifique
router.get('/user/count/:userId', resumeController.getUserResumeCount);

// Compter TOUS les CV de la plateforme (pour admin)
router.get('/count/all', resumeController.getAllResumesCount);

// Compter les CV par mois pour l'année en cours
router.get('/stats/monthly', resumeController.getMonthlyStats);

// Compter les CV créés au cours de la dernière semaine, regroupés par jour
router.get('/stats/weekly-activity', resumeController.getWeeklyActivityStats);

// calculer la performance hebdomadaire en comparant le nombre de CV créés cette semaine par rapport à la semaine précédente
router.get('/stats/weekly-performance', resumeController.getWeeklyPerformance);

//Route pour créer un nouveau CV
router.post('/create', resumeController.create);

// Route pour mettre à jour les détails personnels d'un CV
router.put('/update-personal-info/:resumeId',resumeController.updatePersonalInfo);

// Route pour mettre à jour les détails personnels d'un CV
router.put('/update-summary-info/:resumeId', resumeController.updateSummary);



/*************************** */
/*Routes avec l'API de OpenAI*
/***************************/

// Route pour générer du texte pour le CV en fonction d'un prompt avec l'API OpenAI
router.post('/openai-generate-text', resumeController.generateAiText);

// Route pour générer du texte pour le CV en fonction d'un prompt avec l'API OpenAI
router.post('/openai-generate-three-textes', resumeController.generateThreeSummaries);

// Route pour générer une Expérience 
router.post('/openai-generate-experience-list', resumeController.generateExperienceList);

/** FIN API de OPENAI ******/




/*************************** */
/*Routes avec l'API de GEMINI
/
/***************************/

router.post('/gemini-generate-text', resumeController.generateAiText)

router.post('/gemini-generate-three-textes', resumeController.generateThreeSummaries)

router.post('/gemini-generate-experience-list', resumeController.generateExperienceList)

/** FIN API de GEMINI ******/



// Route pour mettre à jour l'éducation d'un CV
router.put('/update-educations-info/:resumeId', resumeController.updateEducations);


// Route pour mettre à jour les expériences d'un CV
router.put('/update-experiences-info/:resumeId', resumeController.updateExperiences);


// Route pour mettre à jour des skills d'un CV
router.put('/update-skills-info/:resumeId', resumeController.updateSkills);

// Route pour mettre à jour des projets d'un CV
router.put('/update-projects-info/:resumeId', resumeController.updateProjects);

// Route pour mettre à jour des certifications d'un CV
router.put('/update-certifications-info/:resumeId', resumeController.updateCertifications);


// Route pour mettre à jour les hobbies d'un CV
router.put('/update-hobbies-info/:resumeId', resumeController.updateHobbies);


// Route pour mettre à jour les langue d'un CV
router.put('/update-languages-info/:resumeId', resumeController.updateLanguages);

// Supprimer un utilisateur
router.delete('/delete-resume/:id', resumeController.delete);


module.exports = router;