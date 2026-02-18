//server/routes/authRoutes.js

const User = require('../models/User')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendResetPasswordEmail, sendActivationEmail } = require('../utils/emailServices');



dotenv.config();
const secret = process.env.PASS_SEC




//Création d'un compte utilisateur
router.post('/register', async (req, res) => {



  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(409).send({ success: false, message: 'Cet utilisateur existe déjà.' });
    }

    // 🔐 Création token brut
    const activationToken = crypto.randomBytes(32).toString('hex');

    // 🔐 Hash du token pour stockage sécurisé
    const hashedActivationToken = crypto
      .createHash('sha256')
      .update(activationToken)
      .digest('hex');

    const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    // Création d'un nouvel utilisateur
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      isAdmin: req.body.isAdmin || false,
      activated: false,
      activationToken: hashedActivationToken,
      activationTokenExpires,
    });

    const savedUser = await newUser.save();

    //const activationUrl = `${process.env.CORS_ORIGIN_ONLINE}/activate/${activationToken}`;
    const activationUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.CORS_ORIGIN_ONLINE}/activate/${activationToken}`
      : `${process.env.LOCALHOST}/activate/${activationToken}`;

    await sendActivationEmail(newUser.email, newUser.name, activationUrl);


    res.status(201).send({
      success: true,
      message: 'Utilisateur créé avec succès.',
      /*data: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin,
      },*/
    });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Erreur serveur.', error: err.message });
  }

})

// Route d'activation du compte
router.get('/activate/:token', async (req, res) => {
  try {

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      activationToken: hashedToken,
      activationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: 'Lien d’activation invalide ou expiré.',
      });
    }

    user.activated = true;
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;

    await user.save();

    res.status(200).send({
      success: true,
      message: 'Compte activé avec succès. Vous pouvez maintenant vous connecter.',
    });

  } catch (err) {
    res.status(500).send({
      success: false,
      message: 'Erreur serveur lors de l’activation.',
    });
  }
});


// Route de connexion
router.post('/login', async (req, res) => {

  //console.log("tentative de login",req.body)
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  //console.log("vérification schema",schema)
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send({ success: false, message: error.details[0].message });

  try {
    // Recherche de l'utilisateur par email
    const user = await User.findOne({ email: req.body.email });

    //console.log("vérification user",user)
    if (!user) {
      return res.status(404).send({ success: false, message: 'Utilisateur introuvable.' });
    }

    // Vérification du mot de passe
    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({ success: false, message: 'Mot de passe incorrect.' });
    }

    //console.log("vérification password",validPassword)
    // Création du token JWT
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: '1d' } // Expire en 1 jour
    );

    const cookieDomain = process.env.NODE_ENV === 'production'
      ? '.hanseroland.com'
      : 'localhost';

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'None' en production pour CORS, 'Lax' en local est plus sécurisé
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      path: '/',
      domain: cookieDomain
    });

    // console.log("vérification token",token)

    // Réponse avec le token
    res.status(200).send({
      success: true,
      message: 'Connexion réussie.',
      //token: token,
      data: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("Erreur serveur lors de la connexion :", err);
    res.status(500).send({ success: false, message: 'Erreur serveur interne lors de la connexion.', error: err.message });
  }
});


router.post('/logout', (req, res) => {
  const cookieDomain = process.env.NODE_ENV === 'production'
    ? '.hanseroland.com'
    : 'localhost';

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    domain: cookieDomain,
    path: '/'
  });
  res.status(200).send({ success: true, message: "Déconnecté." });
});


router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ success: false, message: 'Aucun utilisateur trouvé avec cet email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 3600000; // Expire dans 1 heure

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    //const resetUrl = `${process.env.CORS_ORIGIN_ONLINE}/reset-password/${resetToken}`; 
    const resetUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.CORS_ORIGIN_ONLINE}/reset-password/${resetToken}`
      : `${process.env.LOCALHOST}/reset-password/${resetToken}`;
    //const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // Utilise la nouvelle fonction d'envoi d'e-mail
    await sendResetPasswordEmail(user.email, user.name, resetUrl);

    res.status(200).send({ success: true, message: 'Un lien de réinitialisation a été envoyé à votre email.' });

  } catch (err) {
    // En cas d'erreur, efface les champs pour éviter de bloquer l'utilisateur
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    }
    console.error("Erreur serveur lors de la demande de réinitialisation :", err);
    res.status(500).send({ success: false, message: 'Erreur serveur lors de la demande de réinitialisation.' });
  }
});



router.put('/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.')
      .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une lettre minuscule.')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule.')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.')
      .matches(/[^a-zA-Z0-9]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial.'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() });
    }

    try {
      const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).send({ success: false, message: 'Jeton de réinitialisation invalide ou expiré.' });
      }

      user.password = bcrypt.hashSync(req.body.password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.status(200).send({ success: true, message: 'Mot de passe réinitialisé avec succès.' });

    } catch (err) {
      res.status(500).send({ success: false, message: 'Erreur serveur lors de la réinitialisation du mot de passe.' });
    }
  }
);

module.exports = router;