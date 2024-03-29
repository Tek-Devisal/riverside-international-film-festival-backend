const multer = require("multer");

// Configure multer to use memory storage
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
  });

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB
});

module.exports = { upload };
