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

//POST ROUTES
router.post(
  "/add",
  upload.single("thumbnail"),
  authenticate,
  creator,
  createMovie
);

//GET ROUTES
router.get("/:id", authenticate, viewMovie);
router.get("/", authenticate, viewAllMovie);

//PUT ROUTES
router.put(
  "/update/:id",
  authenticate,
  upload.single("thumbnail"),
  creator,
  editMovie
);
router.put("/like/:id", authenticate, likeMovie);
router.put("/dislike/:id", authenticate, disLikeMovie);
router.put("/rate/:id", authenticate, rateMovie);

//DELETE ROUTES
router.delete("/delete/:id", authenticate, creator, deleteMovie);

module.exports = router;
