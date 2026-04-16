const User = require('../models/User');
const { sendResetPasswordEmail, sendActivationEmail } = require('../utils/emailServices');
const { generateRandomToken, cryptoHash } = require('../utils/cryptoService');
const { hashPassword, comparePassword } = require('../utils/passwordService');
const { generateAccessToken } = require('../utils/jwtService');
const asyncHandler = require('../middlewares/asyncHandler');
const { validationResult } = require('express-validator');

/**
 * Enregitrer un utilisateur
 */

exports.register = asyncHandler( async(req, res) => {
   
        const { name, email, password, isAdmin } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: 'Cet utilisateur existe déjà.'
            });
        }

        // Création token brut
        const activationToken = generateRandomToken()

        // Hash du token pour stockage sécurisé
        const hashedActivationToken = cryptoHash(activationToken);

        const activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

        const hashedPassword = hashPassword(password);

        // Création d'un nouvel utilisateur
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin: isAdmin || false,
            activated: false,
            activationToken: hashedActivationToken,
            activationTokenExpires,
        });

        await newUser.save();

        const activationUrl = process.env.NODE_ENV === 'production'
            ? `${process.env.CORS_ORIGIN_ONLINE}/activate/${activationToken}`
            : `${process.env.LOCALHOST}/activate/${activationToken}`;

        await sendActivationEmail(newUser.email, newUser.name, activationUrl);


        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès.',
        });
    
});

exports.login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        const testPassword = comparePassword(password,user.password);

        if (!user || !testPassword) {
            return res.status(401)
                    .json(
                        { 
                            success: false, 
                            message: 'Identifiants invalides.' 
                        }
                    );
        }
        const token = generateAccessToken({userId: user._id, isAdmin: user.isAdmin})

        const cookieDomain = process.env.NODE_ENV === 'production' ? '.hanseroland.com' : 'localhost';

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: '/',
            domain: cookieDomain
        });

        res.status(200).json({
            success: true,
            data: { id: user._id, email: user.email, isAdmin: user.isAdmin }
        });
   
});

exports.logout = asyncHandler(async (req, res) => {
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
    res.status(200).json({ success: true, message: "Déconnecté." });
});

exports.activate = async (req,res) => {
     try {
    
        const activationToken = req.params.token;
        const hashedToken = cryptoHash(activationToken)
    
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
};

exports.forgotPassword = asyncHandler(async (req,res) => {
    
        const {email} = req.body;
        const user = await User.findOne({email});
        if (!user) {
          return res.status(404)
            .json({ 
                success: false, 
                message: 'Aucun utilisateur trouvé avec cet email.' 
            });
        }
    
        const resetToken = generateRandomToken()
        const resetPasswordToken = cryptoHash(resetToken);
        const resetPasswordExpires = Date.now() + 3600000; // Expire dans 1 heure
    
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
    
        await user.save();
    
        const resetUrl = process.env.NODE_ENV === 'production'
          ? `${process.env.CORS_ORIGIN_ONLINE}/reset-password/${resetToken}`
          : `${process.env.LOCALHOST}/reset-password/${resetToken}`;
    
        await sendResetPasswordEmail(user.email, user.name, resetUrl);
    
        res.status(200).json({ 
            success: true, 
            message: 'Un lien de réinitialisation a été envoyé à votre email.' 
        });
    
});

exports.resetPassword = asyncHandler(async (req,res) => {
    
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, errors: errors.array() });
        }
    
          
          const token = req.params.token
          const resetPasswordToken = cryptoHash(token)
    
          const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() },
          });
    
          if (!user) {
            return res.status(400)
                    .json({ 
                        success: false, 
                        message: 'Jeton de réinitialisation invalide ou expiré.' }
                    );
          }
    
          const newPassword = req.body.password;
          user.password = hashPassword(newPassword);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();
    
          res.status(200)
             .json({ 
                success: true, 
                message: 'Mot de passe réinitialisé avec succès.' 
            });
      
})