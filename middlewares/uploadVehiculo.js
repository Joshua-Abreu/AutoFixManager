import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "public/uploads/vehiculos");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes en formato .jpg, .jpeg, .png o .webp.'));
    }
};

export const uploadVehiculo = multer({
    storage: storage,
    fileFilter: fileFilter
});
