const jwt = require('jsonwebtoken');


const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } 

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  }

const verifyAccessToken = (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET,);

      if (typeof decoded === 'string') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
};