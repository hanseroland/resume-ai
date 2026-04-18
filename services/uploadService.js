const multer = require('multer');
const fs = require('fs');
const path = require('path');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Format d\'image invalide (PNG, JPG, JPEG uniquement)');

        if (isValid) {
            uploadError = null;
        }

        const uploadPath = './public/profile/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(uploadError, uploadPath);
    },
    filename: function (req, file, cb) {
        
        const nameWithoutExt = path.parse(file.originalname).name.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        
        cb(null, `${nameWithoutExt}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 2 } 
});

module.exports = uploadOptions;