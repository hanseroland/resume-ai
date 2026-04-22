const asyncHandler = require('../middlewares/asyncHandler');
const resumeService = require('../services/resumeService');
const aiService = require('../services/aiService');


exports.model = asyncHandler(async (req,res)=> {})


exports.findAll = asyncHandler(async (req,res)=> {
    const resumes = await resumeService.findAll();
    res.status(200).json({ success: true, data: resumes });
});

exports.getById = asyncHandler(async (req,res)=> {
    const resumeId = req.params.id;
    const resume = await resumeService.getResumeById(resumeId);
    res.status(200).json({ success: true, data: resume });
});

exports.getByUserId = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const resumes = await resumeService.getUserResumes(userId);
    
    res.status(200).json({ 
        success: true, 
        message: 'CV récupérés avec succès', 
        data: resumes 
    });
});


exports.getLatest = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const resumes = await resumeService.getLatestResumes(userId);
    res.status(200).json({ success: true, data: resumes });
});

exports.getUserResumeCount = asyncHandler(async (req, res) => {
    const count = await resumeService.countByUserId(req.params.userId);
    res.status(200).json({
        success: true,
        message: 'Nombre de CV récupéré avec succès',
        count
    });
});

exports.getAllResumesCount = asyncHandler(async (req, res) => {
    const count = await resumeService.countAll();
    res.status(200).json({
        success: true,
        message: 'Nombre total de CV récupéré avec succès',
        count
    });
});

exports.create = asyncHandler(async (req, res) => {
    const { userId, title } = req.body;
    const newResume = await resumeService.createResume(userId, title);
    res.status(201).json({ success: true, data: newResume });
});


exports.delete = asyncHandler(async (req, res) => {
    const resumeId = req.params.id;
    await resumeService.deleteResume(resumeId);
    res.status(204).send({ success: true});
});


exports.getMonthlyStats = asyncHandler(async (req, res) => {
    const { year, stats } = await resumeService.getMonthlyStats();
    res.status(200).json({
        success: true,
        year,
        data: stats
    });
});

exports.getWeeklyActivityStats = asyncHandler(async (req, res) => {
    const activityData = await resumeService.getWeeklyActivityStats();

    res.status(200).json({
        success: true,
        data: activityData
    });
});


exports.getWeeklyPerformance = asyncHandler(async (req, res) => {
    const stats = await resumeService.getWeeklyPerformance();

    res.status(200).json({
        success: true,
        currentWeekCount: stats.currentWeekCount,
        performance: stats.performance
    });
});

exports.updatePersonalInfo = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, {
        "personalInfo.fullName": req.body.fullName,
        "personalInfo.jobTitle": req.body.jobTitle,
        "personalInfo.address": req.body.address,
        "personalInfo.phone": req.body.phone,
        "personalInfo.email": req.body.email
    });
    res.status(200).json({ success: true, data: updated });
});


exports.updateSummary = asyncHandler(async (req, res) => {
    const { summary } = req.body;
    const updatedResume = await resumeService.updateResumeField(req.params.resumeId, { summary });

    res.status(200).json({
        success: true,
        message: "Résumé profil mis à jour avec succès.",
        data: updatedResume
    });
});


/**
 * Géner du texte avec l'IA
 */

exports.generateAiText = asyncHandler(async (req, res) => {
    const { prompt } = req.body; // provider: 'openai' ou 'gemini'
    if (!prompt) throw new Error("Le prompt est requis.");

    const data = await aiService.generateText(prompt, 'gemini');
    
    res.status(200).json({ success: true, data });
});

exports.generateThreeSummaries = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) throw new Error("Le prompt est requis.");

    const data = await aiService.generateThreeSummaries(prompt, 'gemini');
    
    res.status(200).json({ success: true, data });
});

exports.generateExperienceList = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) throw new Error("Le prompt est requis.");

    const data = await aiService.generateExperienceList(prompt, 'gemini');
    
    res.status(200).json({ success: true, message: "Expérience générée.", data });
});


/**
 * Gestion des champs: Educations Experiences, Skills, Projects
 * Certifications, Hobbies, Languages
 */
exports.updateEducations = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, { educations: req.body });
    res.status(200).json({ success: true, message: "Éducations mises à jour.", data: updated });
});

exports.updateExperiences = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, { experiences: req.body });
    res.status(200).json({ success: true, message: "Expériences mises à jour.", data: updated });
});

exports.updateSkills = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, { skills: req.body });
    res.status(200).json({ success: true, message: "Compétences mises à jour.", data: updated });
});

exports.updateProjects = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, { projects: req.body });
    res.status(200).json({ success: true, message: "Projets mis à jour.", data: updated });
});

exports.updateCertifications = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, { certifications: req.body });
    res.status(200).json({ success: true, message: "Certifications mises à jour.", data: updated });
});

exports.updateHobbies = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, { hobbies: req.body });
    res.status(200).json({ success: true, message: "Hobbies mis à jour.", data: updated });
});

exports.updateLanguages = asyncHandler(async (req, res) => {
    const updated = await resumeService.updateResumeField(req.params.resumeId, { languages: req.body });
    res.status(200).json({ success: true, message: "Langues mises à jour.", data: updated });
});