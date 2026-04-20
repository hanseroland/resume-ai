//server/routes/authRoutes.js
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validatorMiddleware');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    max: 5, // Limite chaque IP à 5 tentatives de connexion par fenêtre
    message: {
       success: false, 
       message: "Trop de tentatives de connexion. Réessayez dans 15 minutes." 
      }
});


/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    maintenir un utilisateur connecté de manière sécurisée
 */

router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Enregistrer un nouvel utilisateur
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authentifier l'utilisateur et retourner un cookie/token
 */
router.post('/login',loginLimiter, authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Supprimer le cookie de session
 */
router.post('/logout/',authController.logout);

/**
 * @route   GET /api/v1/auth/activate/:token
 * @desc    Activer le compte via le lien email
 */
router.get('/activate/:token', authController.activate);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Demander un lien de réinitialisation
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   PUT /api/v1/auth/reset-password/:token
 * @desc    Changer le mot de passe avec validation stricte
 */
router.put(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }
      return true;
    }),
    validate,
  ],
  authController.resetPassword
);


module.exports = router;