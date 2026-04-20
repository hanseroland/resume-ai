const RefreshTokenModel = require('../models/RefreshTokenModel');
const { cryptoHash } = require('../utils/cryptoService');

exports.verifyAndRotateToken = async (rawRefreshToken) => {

    const hashed = cryptoHash(rawRefreshToken);
    
   
    const storedToken = await RefreshTokenModel.findOne({ token: hashed });
    
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
        if (storedToken) await RefreshTokenModel.deleteOne({ _id: storedToken._id });
        return null;
    }

    return storedToken; d
};