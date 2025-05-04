const Resume = require('../models/Resume')
const User = require('../models/User')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const OpenAI = require('openai');
const dotenv = require('dotenv');



dotenv.config();
const secret = process.env.PASS_SEC 

// Intégration de l'API OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Cela reste pareil, mais la structure a changé
});



// Afficher les informations d'un seul CV par son id
router.get('/:id', async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ success: false, message: 'CV introuvable.' });
        }
        res.status(200).json({ success: true, data: resume });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// récupérer les CV d'un utilisateur donné en fonction de son ID
router.get('/user/:userId',async(req,res)=>{

  try {
    const userId = req.params.userId

    const findUser = await User.findById(userId)
 
    if(!findUser){
       return res.status(404).send(
         {
           success:false,
           message:'Aucun utilisateur trouvé'
         }
       )
    }
 
    const findResume = await Resume.find({userId:userId})
    if (!findResume) {
     return res.status(404).json({ success: false, message: 'Aucun CV trouvé(s).' });
    }
 
    res.status(200).send({ 
      success: true, 
      messages:'CV recupérés avec succès',
      data: findResume 
    });
  } catch (error) {
       res.status(500).json({ success: false, error: error.message });
  }
 
})

//Route pour créer un nouveau CV
router.post('/create', async (req, res) => {

  //console.log("first",req.body)

    const { userId, title } = req.body;
  
    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
     // console.log("UserId",userId)

      // Créer un nouveau CV
      const newResume = new Resume({
        userId: userId,
        title: title,
        personalInfo: {
          fullName: "",
          jobTitle: "",
          address: "",
          phone: "",
          email: user.email // Par défaut, utiliser l'email de l'utilisateur
        },
        summary: "",
        experiences: [],
        skills: [],
        education: [],
        hobbies: [],
        certifications: [],
        projects: []
      });
  
      // Sauvegarder le CV
      const savedResume = await newResume.save();

     // console.log("savedResume",savedResume)
  
      // Ajouter l'ID du CV dans le modèle User
      user.resumes.push(savedResume._id);
      await user.save();
  
      // Répondre avec les détails du CV créé
      console.log("savedResume",savedResume)
      res.status(201).json({
        success:true,
        message: 'CV créé avec succès.',
        data: savedResume
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la création du CV.' });
    }
  });

// Route pour mettre à jour les détails personnels d'un CV
router.put('/update-personal-info/:resumeId', async (req, res) => {
  
  const { resumeId } = req.params;
  const { fullName, jobTitle, address, phone, email } = req.body;

  try {
      // Vérifier si le CV existe
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour des détails personnels avec l'opérateur `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          {
              $set: {
                  "personalInfo.fullName": fullName,
                  "personalInfo.jobTitle": jobTitle,
                  "personalInfo.address": address,
                  "personalInfo.phone": phone,
                  "personalInfo.email": email
              }
          },
          { new: true } // Retourner le document mis à jour
      );

      res.status(200).json({
          success: true,
          message: "Informations personnelles mises à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour du CV." });
  }
});

// Route pour mettre à jour les détails personnels d'un CV
router.put('/update-summary-info/:resumeId', async (req, res) => {
  
  const { resumeId } = req.params;
  const { summary } = req.body;

  try {
      // Vérifier si le CV existe
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour des détails personnels avec l'opérateur `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          {$set: {summary : summary}},
          { new: true } // Retourner le document mis à jour
      );

      res.status(200).json({
          success: true,
          message: "Résumé profil mis à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour du CV." });
  }
});


// Route pour générer du texte pour le CV en fonction d'un prompt
router.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Le prompt est requis." });
    }

    // Préparation des messages pour ChatCompletion
    const messages = [
      {
        role: "system",
        content: "Vous êtes un expert en rédaction de CV. Générez un texte clair, concis et professionnel à partir des informations fournies."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    // Appel à l'API ChatCompletion
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ou "gpt-4" si nécessaire
      messages: messages,
      max_tokens: 500,       // Ajustez la valeur en fonction de la longueur attendue
      temperature: 0.7,      // Ajustez la créativité de la réponse
    });

    // Extraction du contenu généré
    const generatedText = chatCompletion.choices[0].message.content;

    console.log("resumé",generatedText)

    // Réponse avec le texte généré
    res.status(200).json({
      success: true,
      message: "Texte généré avec succès.",
      data: generatedText
    });
  } catch (error) {
    console.error("Erreur lors de la génération du texte:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la génération du texte.",
      error: error.message
    });
  }
});

// Route pour générer du texte pour le CV en fonction d'un prompt
router.post('/generate-three-textes', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Le prompt est requis." });
    }

    // Préparation des messages avec instructions précises pour l'appel de fonction
    const messages = [
      {
        role: "system",
        content: "Vous êtes un expert en rédaction de CV. Veuillez générer trois résumés de profil différents au format JSON. Chaque résumé doit être un texte concis et professionnel décrivant un profil. Retournez le résultat en appelant la fonction 'generateSummaries'."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    // Définition de la fonction à appeler par l'IA pour retourner un résultat structuré
    const functions = [
      {
        name: "generateSummaries",
        description: "Génère trois résumés de profil au format JSON.",
        parameters: {
          type: "object",
          properties: {
            summaries: {
              type: "array",
              items: { type: "string" },
              description: "Liste contenant trois résumés de profil."
            }
          },
          required: ["summaries"]
        }
      }
    ];

    // Appel à l'API avec support de l'appel de fonction
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ou "gpt-4" si nécessaire// Modèle supportant le function calling
      messages: messages,
      functions: functions,
      function_call: "auto",  // Permet à l'API de décider d'appeler la fonction si le contexte le justifie
      max_tokens: 500,
      temperature: 0.7,
    });

    const message = chatCompletion.choices[0].message;

    // Si le modèle a choisi d'appeler la fonction, on récupère les arguments passés
    if (message.function_call) {
      const argsString = message.function_call.arguments;
      let functionArgs;
      try {
        functionArgs = JSON.parse(argsString);
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Erreur lors de l'analyse des arguments de la fonction.",
          error: err.message
        });
      }

      console.log("les textes:",functionArgs)
      // functionArgs devrait contenir { summaries: [summary1, summary2, summary3] }
      return res.status(200).json({
        success: true,
        message: "Fonction appelée avec succès.",
        data: functionArgs
      });
    } else {
      // Cas de repli si l'IA ne retourne pas d'appel de fonction
      return res.status(200).json({
        success: true,
        message: "Texte généré sans appel de fonction.",
        data: message.content
      });
    }
  } catch (error) {
    console.error("Erreur lors de la génération du texte:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la génération du texte.",
      error: error.message
    });
  }
});


// Route pour générer une Expérience 
router.post('/generate-experience-list', async (req, res) => {
  try {

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Le prompt est requis." });
    }

    // Préparation des messages pour ChatCompletion
    const messages = [
      {
        role: "system",
        content: "Vous êtes un expert en rédaction de CV. Générez un texte clair, concis et professionnel à partir des informations fournies."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    // Appel à l'API ChatCompletion
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ou "gpt-4" si nécessaire
      messages: messages,
      max_tokens: 500,       // Ajustez la valeur en fonction de la longueur attendue
      temperature: 0.7,      // Ajustez la créativité de la réponse
    });

    // Extraction du contenu généré
    const generatedText = chatCompletion.choices[0].message.content;

    console.log("expérience : ",generatedText)

    // Réponse avec le texte généré
    res.status(200).json({
      success: true,
      message: "Expérience générée avec succès.",
      data: generatedText
    });
  } catch (error) {
    console.error("Erreur lors de la génération du texte:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la génération du texte.",
      error: error.message
    });
  }
});

// Route pour mettre à jour l'éducation d'un CV
router.put('/update-educations-info/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const educations  = req.body;

  try {
      // Vérifier si le CV existe
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour des éducations existantes avec `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          { $set: { educations: educations } }, // Remplace le champ `education` tout en conservant les autres champs
          { new: true, runValidators: true } // Retourne le document mis à jour et applique les validations
      );
      //console.log(updatedResume)

      res.status(200).json({
          success: true,
          message: "Informations d'éducation mises à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour des informations d'éducation." });
  }
});


// Route pour mettre à jour les expériences d'un CV
router.put('/update-experiences-info/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const  experiences  = req.body;

 // console.log("resume id",req.params)
 // console.log("body",experiences)

  try {
    
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour des expériences existantes avec `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          { $set: { experiences: experiences } }, // Remplace le champ `experiences` tout en conservant les autres champs
          { new: true, runValidators: true } // Retourne le document mis à jour et applique les validations
      );

      console.log("resume mDB",updatedResume)
      res.status(200).json({
          success: true,
          message: "Informations d'experiences mises à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour des informations d'experiences." });
  }
});


// Route pour mettre à jour des skills d'un CV
router.put('/update-skills-info/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const  skills  = req.body;

 // console.log("resume id",req.params)
 // console.log("body",skills)

  try {
    
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour de compétences existantes avec `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          { $set: { skills: skills } }, // Remplace le champ `skills` tout en conservant les autres champs
          { new: true, runValidators: true } // Retourne le document mis à jour et applique les validations
      );

      console.log("resume mDB",updatedResume)
      res.status(200).json({
          success: true,
          message: "COmpétences mises à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour des informations d'experiences." });
  }
});

// Route pour mettre à jour des projets d'un CV
router.put('/update-projects-info/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const  projects  = req.body;


  try {
    
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour de projets existants avec `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          { $set: { projects: projects } }, // Remplace le champ `projects` tout en conservant les autres champs
          { new: true, runValidators: true } // Retourne le document mis à jour et applique les validations
      );

      console.log("resume mDB",updatedResume)
      res.status(200).json({
          success: true,
          message: "Projets mis à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour des informations d'experiences." });
  }
});

// Route pour mettre à jour des certifications d'un CV
router.put('/update-certifications-info/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const  certifications  = req.body;


  try {
    
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour de certifications existantes avec `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          { $set: { certifications: certifications } }, // Remplace le champ `certifications` tout en conservant les autres champs
          { new: true, runValidators: true } // Retourne le document mis à jour et applique les validations
      );

      console.log("resume mDB",updatedResume)
      res.status(200).json({
          success: true,
          message: "Certifications mises à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour des informations d'experiences." });
  }
});


// Route pour mettre à jour les hobbies d'un CV
router.put('/update-hobbies-info/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const  hobbies  = req.body;


  try {
    
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour des hobbies existants avec `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          { $set: { hobbies: hobbies } }, // Remplace le champ `hobbies` tout en conservant les autres champs
          { new: true, runValidators: true } // Retourne le document mis à jour et applique les validations
      );

      console.log("resume mDB",updatedResume)
      res.status(200).json({
          success: true,
          message: "hobbies mis à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour des informations d'experiences." });
  }
});


// Route pour mettre à jour les langue d'un CV
router.put('/update-languages-info/:resumeId', async (req, res) => {
  const { resumeId } = req.params;
  const  languages  = req.body;


  try {
    
      const resume = await Resume.findById(resumeId);
      if (!resume) {
          return res.status(404).json({ success: false, error: 'CV introuvable.' });
      }

      // Mise à jour des langue existantes avec `$set`
      const updatedResume = await Resume.findByIdAndUpdate(
          resumeId,
          { $set: { languages: languages } }, // Remplace le champ `languages` tout en conservant les autres champs
          { new: true, runValidators: true } // Retourne le document mis à jour et applique les validations
      );

      console.log("resume mDB",updatedResume)
      res.status(200).json({
          success: true,
          message: "Langues mises à jour avec succès.",
          data: updatedResume
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Une erreur est survenue lors de la mise à jour des informations d'experiences." });
  }
});



// Supprimer un utilisateur
router.delete('/delete-resume/:id', async (req, res) => {
   

    try {
        
        const deletedResume = await Resume.findByIdAndDelete(req.params.id);
       
        if (!deletedResume) {
            return res.status(404).json({ success: false, message: 'CV introuvable.' });
        }
       
        res.status(200).json({ success: true, message: 'CV supprimé avec succès.' });
        

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});





  
module.exports = router;