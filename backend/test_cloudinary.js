require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary upload...');
console.log('Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'PRESENT' : 'MISSING'
});

// Create a tiny dummy text file for testing
const fs = require('fs');
fs.writeFileSync('test_upload.txt', 'Cloudinary Test File Content');

cloudinary.uploader.upload('test_upload.txt', { resource_type: 'raw', folder: 'test' })
    .then(result => {
        console.log('SUCCESS:', result.secure_url);
        fs.unlinkSync('test_upload.txt');
        process.exit(0);
    })
    .catch(error => {
        console.error('ERROR:', error);
        fs.unlinkSync('test_upload.txt');
        process.exit(1);
    });
