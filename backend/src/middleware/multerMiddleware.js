const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user._id : "anonymous";
    const extension = path.extname(file.originalname);

    if (file.fieldname === "profileImage") {
      cb(null, `profile_${userId}${extension}`);
    } else if (file.fieldname === "banner") {
      cb(null, `banner_${userId}${extension}`);
    } else {
      cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + extension);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum 5MB limit koyalım (opsiyonel)
});

module.exports = upload;
