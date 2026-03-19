require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
console.log('Initializing Cloudinary with Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rd_collection',
        // Removing strict format check temporarily to debug
        // allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return file.fieldname + '-' + uniqueSuffix;
        }
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    console.log('File Filter processing:', file.originalname, 'Mime:', file.mimetype);
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        console.log('File accepted by filter');
        return cb(null, true);
    } else {
        console.error('File rejected by filter:', file.originalname, 'Mime:', file.mimetype);
        cb(new Error('Only images (jpg, jpeg, png) and PDFs are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB for Cloudinary
    fileFilter: fileFilter
});

module.exports = upload;
