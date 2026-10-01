import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/evidencias'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'evidencia-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const permitidas = /jpeg|jpg|png|webp/;
    const extname = permitidas.test(path.extname(file.originalname).toLowerCase());
    const mimetype = permitidas.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes en formato .jpg, .jpeg, .png o .webp'));
    }
};

export const uploadEvidencia = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: fileFilter
});