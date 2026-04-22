const User = require('../models/User');
const { sendResetPasswordEmail, sendActivationEmail } = require('../utils/emailServices');
const { generateRandomToken, cryptoHash } = require('../utils/cryptoService');
const { hashPassword, comparePassword } = require('../utils/passwordService');
const { generateToken } = require('../utils/jwtService');
const asyncHandler = require('../middlewares/asyncHandler');
const { validationResult } = require('express-validator');
const RefreshTokenModel = require('../models/RefreshTokenModel');
const refreshTokenService = require('../services/refreshTokenService');

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
        console.log("Login Bien appélé")

        if (!user || !testPassword) {
            return res.status(401)
                    .json(
                        { 
                            success: false, 
                            message: 'Identifiants invalides.' 
                        }
                    );
        }
        const tokenPayload = {userId: user._id, isAdmin: user.isAdmin};
        const token = generateToken(tokenPayload,process.env.JWT_SECRET,process.env.JWT_EXPIRES_IN)

        const refreshToken = generateRandomToken();
        const hashedRefreshToken = cryptoHash(refreshToken);

        const newRefreshToken = new RefreshTokenModel({
                token: hashedRefreshToken,
                userId: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
            });
        
        await newRefreshToken.save();
        

        const cookieDomain = process.env.NODE_ENV === 'production' ? `${proecess.env.BASE_DOMAIN}` : 'localhost';

        // --- COOKIE ACCESS TOKEN ---
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: '/',
            domain: cookieDomain
        });

        // --- COOKIE REFRESH TOKEN ---
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
            path: '/',
            domain: cookieDomain
        });

        res.status(200).json({
            success: true,
            data: { id: user._id, email: user.email, isAdmin: user.isAdmin }
        });
   
});

exports.logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    // On supprime le Refresh Token de la base de données
    if (refreshToken) {
        const hashed = cryptoHash(refreshToken);
        await RefreshTokenModel.deleteOne({ token: hashed });
    }

    const cookieDomain = process.env.NODE_ENV === 'production'
        ? `${proecess.env.BASE_DOMAIN}`
        : 'localhost';

    
    // On efface les deux cookies
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        domain: cookieDomain,
        path: '/'
    };

    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    
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
      
});

exports.refreshToken = asyncHandler(async (req,res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ 
            success: false, 
            message: "Session expirée." 
        });
    }

    const tokenDoc = await refreshTokenService.verifyAndRotateToken(refreshToken);

    if (!tokenDoc) {
        return res.status(401).json({ 
            success: false, 
            message: "Token invalide ou expiré." 
        });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(404).json({ 
        success: false, 
        message: "Utilisateur introuvable." 
    });

    const tokenPayload = { userId: user._id, isAdmin: user.isAdmin };
    const newToken = generateToken(tokenPayload, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);

    const cookieDomain = process.env.NODE_ENV === 'production' 
        ? `${proecess.env.BASE_DOMAIN}` 
        : 'localhost';

    res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        domain: cookieDomain
    });

    res.status(200).json({ success: true, message: "Accès renouvelé." });

})