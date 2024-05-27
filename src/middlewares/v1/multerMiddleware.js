import multer from "multer";

const storageForFile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/files");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadFile = multer({
  storage: storageForFile,
});

const storageForImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadImage = multer({
  storage: storageForImage,
});

export { uploadFile, uploadImage };
