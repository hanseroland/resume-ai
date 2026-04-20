const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadMediaToCloudinary = async (filePath, resourceType = 'image', folder = 'resume-ai') => {
    try {
        const options = {
            folder: folder,
            resource_type: resourceType, // Crucial: 'image' or 'video'
            
        };

        const result = await cloudinary.uploader.upload(filePath, options);

        return {
            success: true,
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        console.error(`Erreur lors de l'upload ${resourceType} sur Cloudinary :`, error);
        // Cloudinary renvoie des erreurs avec `error.message` et `error.http_code`
        return {
            success: false,
            message: error.message || "Erreur inconnue lors de l'upload sur Cloudinary."
        };
    }
};


const deleteMediaFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        // La destruction nécessite le bon 'resource_type' si ce n'est pas 'image'
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

        if (result.result === 'ok') {
            return { success: true, message: "Média supprimé de Cloudinary." };
        } else {
            console.warn(`Cloudinary deletion not 'ok' for public_id: ${publicId}. Result:`, result);
            return { success: false, message: result.result || "Échec de la suppression du média sur Cloudinary." };
        }
    } catch (error) {
        console.error(`Erreur lors de la suppression du média ${resourceType} sur Cloudinary :`, error);
        return { success: false, message: error.message || "Erreur inconnue lors de la suppression sur Cloudinary." };
    }
};

module.exports = {
    uploadMediaToCloudinary, // Renommez ou gardez l'ancien nom
    deleteMediaFromCloudinary // Renommez ou gardez l'ancien nom
};