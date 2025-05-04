const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  theme: { type: Number},
  title: { type: String},
  personalInfo: {
    fullName: { type: String },
    jobTitle: { type: String,  },
    address: { type: String },
    phone: { type: String },
    email: { type: String,  },
  },
  summary: { type: String }, // Peut être généré par l'IA
  experiences: [{
    jobTitle: { type: String,  },
    companyName: { type: String,  },
    city: { type: String },
    country: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    workSummary: { type: String }, // Peut être généré par l'IA
  }],
  skills: [{ name:{ type: String},level:{Number} }], // Liste de compétences
  educations: [{
    degree: { type: String,  },
    schoolName: { type: String,  },
    city: { type: String },
    country: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  }],
  hobbies: [{ type: String }],
  languages: [{ name:{ type: String},note:{String} }],
  certifications: [{
    title: { type: String,  },
    issuingOrganization: { type: String },
    dateIssued: { type: Date },
    description: { type: String },
  }],
  projects: [{
    title: { type: String,  },
    description: { type: String },
    technologies: [{ type: String }],
    link: { type: String }, // Lien vers le projet
  }],
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
