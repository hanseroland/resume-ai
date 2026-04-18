const User = require("../models/User")


exports.findAll = async () => {
    return User.find().select('-password').sort({'createdAt':-1});
}


exports.findById = async (id) => {
    const user = User.findById(id).select('-password');
    if (!user) throw new Error('Utilisateur introuvable');
    return user;
}

exports.findByEmail = async (email) => {
    const user = User.findOne({email:email}).select('-password');
}

exports.count = async (filter = {}) => {
    return await User.countDocuments(filter);
};

exports.getRecentCount = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
};

exports.update = async (id, data) => {
    const updated = await User.findByIdAndUpdate(id, { $set: data }, { new: true }).select('-password');
    if (!updated) throw new Error('Utilisateur introuvable pour mise à jour');
    return updated;
};

exports.delete = async (id) => {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) throw new Error('Utilisateur introuvable');
    return deleted;
};

