const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();

module.exports =  async function (req, res, next) {
    try {
        const authorizationHeader = req.header('authorization');
        if (!authorizationHeader) {
            return res.status(401).send({ 
                success: false,
                message: 'Authorization header missing'
            });
        }

        
        const token = authorizationHeader.replace("Bearer ", "");
        const decryptedData = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decryptedData.userId);

       // console.log("affiche use middle :",user)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur introuvable.',
            });
        }

        req.user = { userId: decryptedData.userId };
        //console.log("middleware", decryptedData.userId);
        next();
    } catch (error) {
        return res.status(401).send({ 
            success: false,
            message: 'Token Invalid'
        });
    }
};