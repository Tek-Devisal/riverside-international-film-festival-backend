const multer = require("multer");

// MULTER FOR HANDLING FILE UPLOADS
const storage = multer.diskStorage({
  //HANDLING FILE DESTINATION
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  //HANDLING FILE NAME
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },

  //VALIDATING FILE TYPES
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },

  // HANDLING FILE SIZE LIMIT
  limits: { fileSize: 5000000 }, // 5MB
});

const upload = multer({ storage: storage });

module.exports = { upload };
