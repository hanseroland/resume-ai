const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

// 1. Index TTL : Nettoyage automatique par MongoDB
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 2. vérifier un objet token qu'on vient de fetch
RefreshTokenSchema.statics.verifyExpiration = function (tokenDoc) {
    return tokenDoc.expiresAt.getTime() < Date.now();
};

// 3. Méthode d'instance
// Exemple : if (myToken.isExpired()) { ... }
RefreshTokenSchema.methods.isExpired = function () {
    return this.expiresAt.getTime() < Date.now();
};

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);