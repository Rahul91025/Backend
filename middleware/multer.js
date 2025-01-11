import multer from 'multer';

const storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, file.originalname); // Or customize file naming as needed
    },
});

const upload = multer({ storage: storage });

export default upload;
