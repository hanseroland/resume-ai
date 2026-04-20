const asyncHandler = require('../middlewares/asyncHandler');
const userService = require('../services/userService');
const passwordService = require('../utils/passwordService');
const mongoose = require('mongoose');


exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.findAll();
    res.status(200).json({ success: true, data: users });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
    const user = await userService.findById(req.user.userId);
    res.status(200).json({ success: true, data: user });
});


exports.getStats = asyncHandler(async (req, res) => {
    const [total, admins, recent] = await Promise.all([
        userService.count(),
        userService.count({ isAdmin: true }),
        userService.getRecentCount()
    ]);
    
    res.status(200).json({ 
        success: true, 
        data: { total, admins, recent } 
    });
});

exports.getUserById = asyncHandler(async (req, res) => {
    const user = await userService.findById(req.params.id);
    res.status(200).json({ success: true, data: user });
});

exports.createUser = asyncHandler(async (req, res) => {
    const { email, password, isAdmin } = req.body;
    
    const existing = await userService.findByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email déjà utilisé.' });

    const hashedPassword = await passwordService.hashPassword(password);
    const user = await userService.update(null, { 
        email, 
        password: hashedPassword, 
        isAdmin: isAdmin || false 
    });

    res.status(201).json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'ID invalide.' });
    }
    const updated = await userService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
});

exports.updatePicture = asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier.' });

    const basePath = `${req.protocol}://${req.get('host')}/public/profile/`;
    const imagePath = `${basePath}${req.file.filename}`;

    const updated = await userService.update(req.params.id, { profilePicture: imagePath });
    
    res.status(200).json({ success: true, data: updated });
});

exports.deleteUser = asyncHandler(async (req, res) => {
    await userService.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Utilisateur supprimé.' });
});