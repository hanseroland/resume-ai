// authMiddleware.js
const User = require('../models/User');
const { verifyToken } = require('../utils/jwtService');

module.exports = async function (req, res, next) {
    try {

        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé : Token manquant',
            });
        }

        const payload = verifyToken(token, process.env.JWT_SECRET);

        if (!payload) {
            // Si le token est expiré ou invalide, on renvoie 401.
            // Le front-end interceptera ce 401 pour appeler /refresh-token
            return res.status(401).json({
                success: false,
                message: 'Session expirée ou token invalide',
                code: 'TOKEN_EXPIRED' // pour aider le front-end
            });
        }


        const user = await User.findById(payload.userId).select('-password');;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur introuvable.',
            });
        }
        req.user = { userId: payload.userId, isAdmin: user.isAdmin };

        next();
    } catch (error) {
        console.error("Middleware Erreur DÉTAILLÉE:", error);
        return res.status(401).send({
            success: false,
            message: `Échec de l\'authentification`
        });
    }
};