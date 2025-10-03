const User = require('../models/User')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const dotenv = require('dotenv');
const crypto = require('crypto');



dotenv.config();
const secret = process.env.PASS_SEC




//Création d'un compte utilisateur
router.post('/register', async (req, res) => {



  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(409).send({ success: false, message: 'Cet utilisateur existe déjà.' });
    }

    // Création d'un nouvel utilisateur
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      isAdmin: req.body.isAdmin || false,
    });

    const savedUser = await newUser.save();

    res.status(201).send({
      success: true,
      message: 'Utilisateur créé avec succès.',
      data: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).send({ success: false, message: 'Erreur serveur.', error: err.message });
  }

})

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
      ? 'https://resume-ai-frontend-mu.vercel.app/'
      : 'localhost';

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'None' en production pour CORS, 'Lax' en local est plus sécurisé
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      path: '/',
      domain: cookieDomain // ✅ Active cette ligne !
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
    ? 'https://resume-ai-frontend-mu.vercel.app/'
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

module.exports = router;