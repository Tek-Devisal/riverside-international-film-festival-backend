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
const { authenticate } = require("../middlewares/auth.middleware");

//Post routes
router.post("/add", createMovie);

//Get routes
router.get("/:id", viewMovie);
router.get("/", viewAllMovie);

//Put routes
router.put("/update/:id", authenticate, editMovie);
router.put("/like/:id", authenticate, likeMovie);
router.put("/dislike/:id", authenticate, disLikeMovie);
router.put("/rate/:id", authenticate, rateMovie);

//Delete routes
router.post("/delete/:id", deleteMovie);

module.exports = router;
