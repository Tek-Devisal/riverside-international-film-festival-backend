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
const {
  authenticate,
  admin,
  creator,
} = require("../middlewares/auth.middleware");

//Post routes
router.post(
  "/add",
  upload.single("thumbnail"),
  authenticate,
  creator,
  createMovie
);

//Get routes
router.get("/:id", upload.single("thumbnail"), authenticate, viewMovie);
router.get("/", authenticate, viewAllMovie);

//Put routes
router.put("/update/:id", authenticate, creator, editMovie);
router.put("/like/:id", authenticate, likeMovie);
router.put("/dislike/:id", authenticate, disLikeMovie);
router.put("/rate/:id", authenticate, rateMovie);

//Delete routes
router.delete("/delete/:id", authenticate, creator, deleteMovie);

module.exports = router;
