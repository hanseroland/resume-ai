const bcrypt = require('bcryptjs');


const saltRounds = 12;

   const hashPassword = (password) => {
    return bcrypt.hashSync(password, saltRounds);
  }

  const comparePassword = (password, hashed) => {
    return bcrypt.compareSync(password, hashed);
}

module.exports = {
    hashPassword,
    comparePassword
}