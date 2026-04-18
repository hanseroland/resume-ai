const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const userController = require('../controllers/userController');





// Afficher tous les utilisateurs
router.get('/', authMiddleware,adminMiddleware, userController.getAllUsers);

// Obtenir les infos de l'utilisateur en cours
router.get('/current-user', authMiddleware, userController.getCurrentUser);

// Statistiques groupées (Total, Admins, Récents)
router.get('/stats/global',authMiddleware,adminMiddleware, userController.getStats);

// Anciennes routes de comptage (pour compatibilité avec ton front-end actuel)
router.get('/count',authMiddleware,adminMiddleware, userController.getStats); 
router.get('/recent',authMiddleware,adminMiddleware, userController.getStats);
router.get('/users/count/admins',authMiddleware,adminMiddleware, userController.getStats);
router.get('/users/count/standard',authMiddleware,adminMiddleware, userController.getStats);

// Chercher par ID
router.get('/:id', userController.getUserById);

// Chercher par Email
router.get('/email/:email',authMiddleware,adminMiddleware, userController.getUserByEmail);

// Création d'un compte
router.post('/add',authMiddleware,adminMiddleware, userController.createUser);

// Modifier les informations textuelles d'un utilisateur
router.put('/:id',authMiddleware, userController.updateUser);

// Mise à jour spécifique de la photo de profil
router.put('/update-picture/:id',authMiddleware, 
    uploadOptions.single('profilePicture'), 
    userController.updatePicture
);


// Supprimer un utilisateur
router.delete('/:id',authMiddleware,adminMiddleware, userController.deleteUser);

module.exports = router;