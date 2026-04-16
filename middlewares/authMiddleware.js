// authMiddleware.js
const User = require('../models/User');
const { verifyToken } = require('../utils/jwtService');

module.exports = async function (req, res, next) {
    try {

        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token manquant (non trouvé dans le cookie)',
            });
        }

        const payload = verifyToken(token);


        const user = await User.findById(payload.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur introuvable.',
            });
        }
        req.user = { userId: payload.userId, role: user.role };

        next();
    } catch (error) {
        console.error("Middleware Erreur DÉTAILLÉE:", error);
        return res.status(401).send({
            success: false,
            message: `Authentication failed: ${error.message}`
        });
    }
};