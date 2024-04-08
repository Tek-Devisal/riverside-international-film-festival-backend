const express = require("express");
const router = express.Router();
const { authenticate, creator } = require("../middlewares/auth.middleware");
const {
  totalLikesDislikesPerCreator,
  getMoviesByGenre,
  totalLikesDislikesPerMovie,
} = require("../controllers/analytics.controller");


//Get routes
router.get("/total-likes-dislikes/:creatorId", authenticate, totalLikesDislikesPerCreator);
router.get("/total-likes-dislikes-per-movie/:movieId", authenticate, totalLikesDislikesPerMovie);
router.get("/movie-by-genre", authenticate, getMoviesByGenre);

// router.get("/:id", upload.single("thumbnail"), authenticate, viewMovie);
// router.get("/", authenticate, viewAllMovie);

// //Put routes
// router.put("/update/:id", authenticate, creator, editMovie);

// //Delete routes
// router.delete("/delete/:id", authenticate, creator, deleteMovie);

module.exports = router;
