const jwt = require('jsonwebtoken');


const generateToken = (payload,secret,expires) => {
    return jwt.sign(payload, secret, {
      expiresIn: expires,
    });
  } 

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
  }

const verifyToken = (token,secret) => {
    try {
      return jwt.verify(token,secret);
    } catch (error) {
      return null;
    }
  }

  module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
};