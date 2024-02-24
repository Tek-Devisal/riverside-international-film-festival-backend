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
router.put("/update", authenticate, editMovie);
router.put("/like", authenticate, likeMovie);
router.put("/dislike", authenticate, disLikeMovie);
router.put("/rate", authenticate, rateMovie);

//Delete routes
router.post("/delete", deleteMovie);

module.exports = router;
