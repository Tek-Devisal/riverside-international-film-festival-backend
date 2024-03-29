const Movie = require("../models/movie.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");


const totalLikesDislikesPerCreator = asyncHandler(async (req, res) => {
  try {
    const { creatorId } = req.params;
    
    console.log(creatorId);
    //VALIDATE MONGODB ID
    mongodbIdValidator(creatorId);
    // Count of movies by the specific creator
    const creatorMovieCount = await Movie.countDocuments({ creatorId: creatorId });

    // Total count of movies in the database
    const totalMovieCount = await Movie.countDocuments({});

    // Calculate percentages
    const creatorMoviePercentage = (creatorMovieCount / totalMovieCount) * 100;

    // Construct additional analytics as before (likes vs dislikes, etc.)
    const moviesByCreator = await Movie.find({ creatorId: creatorId });

    // Example: Calculate the total likes and dislikes for the creator's movies
    let totalLikes = 0;
    let totalDislikes = 0;
    moviesByCreator.forEach(movie => {
      totalLikes += movie.likes.length; // Assuming 'likes' is an array of user IDs
      totalDislikes += movie.dislikes.length; // Assuming 'dislikes' is an array of user IDs
    });

    const likePercentage = (totalLikes / (totalLikes + totalDislikes)) * 100;
    const dislikePercentage = (totalDislikes / (totalLikes + totalDislikes)) * 100;

    res.status(200).json({
      success: true,
      data: [{
        creatorMovieCount,
        totalMovieCount,
        creatorMoviePercentage,
        totalLikes,
        totalDislikes,
        likePercentage,
        dislikePercentage,
        // Include other analytics here
      },]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = {
    totalLikesDislikesPerCreator
};
  