import multer from "multer";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image uploads are allowed"));
};

export const productImageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
}).array("images", 4);

