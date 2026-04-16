const crypto = require('crypto')


 const cryptoHash = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

  const generateResetPasswordToken = () => {
    return crypto.randomBytes(32).toString('hex');
  }

 const  generateRandomToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    cryptoHash,
    generateResetPasswordToken,
    generateRandomToken
}

