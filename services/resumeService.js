const Resume = require('../models/Resume');
const User = require('../models/User');

exports.getResumeById = async (id) => {
    const resume = await Resume.findById(id);
    if (!resume) throw new Error('CV introuvable');
    return resume;
};

exports.findAll = async () => {
    return await Resume.find().sort({'createdAt':-1});
};


exports.getUserResumes = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur introuvable');
    return await Resume.find({ userId });
};


exports.getLatestResumes = async (userId) => {
    return await Resume.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3);
};


exports.createResume = async (userId, title) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Utilisateur introuvable');

    const newResume = new Resume({
        userId,
        title,
        personalInfo: { email: user.email },
    });

    const savedResume = await newResume.save();

    await User.findByIdAndUpdate(userId, { $push: { resumes: savedResume._id } });

    return savedResume;
};

exports.countByUserId = async (userId) => {
    return await Resume.countDocuments({ userId });
};

exports.countAll = async () => {
    return await Resume.countDocuments();
};

exports.updateResumeField = async (resumeId, fieldData) => {
    const updatedResume = await Resume.findByIdAndUpdate(
        resumeId,
        { $set: fieldData },
        { new: true, runValidators: true }
    );
    if (!updatedResume) throw new Error('CV introuvable pour mise à jour');
    return updatedResume;
};

exports.getMonthlyStats = async () => {
    const currentYear = new Date().getFullYear();

    const stats = await Resume.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lte: new Date(`${currentYear}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    return {
        year: currentYear,
        stats
    };
};

exports.getWeeklyActivityStats = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const stats = await Resume.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
    ]);

    const daysMap = { 1: 'Dim', 2: 'Lun', 3: 'Mar', 4: 'Mer', 5: 'Jeu', 6: 'Ven', 7: 'Sam' };
    
    // Formatage pour Recharts
    const formatted = Object.keys(daysMap).map(num => {
        const found = stats.find(s => s._id === parseInt(num));
        return { day: daysMap[num], value: found ? found.count : 0 };
    });

    // On réorganise pour commencer par Lundi
    return [...formatted.slice(1), formatted[0]];
};


exports.getWeeklyPerformance = async () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentWeekCount, lastWeekCount] = await Promise.all([
        Resume.countDocuments({ createdAt: { $gte: oneWeekAgo, $lte: now } }),
        Resume.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } })
    ]);

    let performance = 0;
    if (lastWeekCount > 0) {
        performance = ((currentWeekCount - lastWeekCount) / lastWeekCount) * 100;
    } else if (currentWeekCount > 0) {
        performance = 100;
    }

    return { currentWeekCount, performance: Math.round(performance) };
};

exports.deleteResume = async (id) => {
    const deleted = await Resume.findByIdAndDelete(id);
    if (!deleted) throw new Error('CV introuvable');
    
    // Optionnel : Retirer l'ID du CV dans le document User
    await User.findByIdAndUpdate(deleted.userId, { $pull: { resumes: id } });
    
    return deleted;
};