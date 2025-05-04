const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePicture:{
    type: String,
    required: false,
  },
  isAdmin: {
    type: Boolean,
    default:false,
  },
  resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }],
},
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  });

module.exports = mongoose.model('User', userSchema);