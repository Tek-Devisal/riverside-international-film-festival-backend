const express = require("express");
const router = express.Router();

const {
  createMovie,
  editMovie,
  deleteMovie,
  viewMovie,
  viewAllMovie,
  rateMovie,
  disLikeMovie,
  likeMovie,
} = require("../controllers/movie.controller");
const { upload } = require("../middlewares/multer.middleware");
const { authenticate } = require("../middlewares/auth.middleware");

//Post routes
router.post("/add", upload.single("thumbnail"), createMovie);

//Get routes
router.get("/:id", upload.single("thumbnail"), viewMovie);
router.get("/", viewAllMovie);

//Put routes
router.put("/update/:id", editMovie);
router.put("/like/:id", likeMovie);
router.put("/dislike/:id", disLikeMovie);
router.put("/rate/:id", rateMovie);

//Delete routes
router.delete("/delete/:id", deleteMovie);

module.exports = router;
