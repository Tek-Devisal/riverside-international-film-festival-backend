const Movie = require("../models/movie.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");
const userModel = require("../models/user.model.js");


const totalLikesDislikesPerCreator = asyncHandler(async (req, res) => {
  try {
    const { creatorId } = req.params;
    
    // console.log(creatorId);
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


const totalLikesDislikesPerMovie = asyncHandler(async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // console.log(creatorId);
    //VALIDATE MONGODB ID
    mongodbIdValidator(movieId);
    // Count of movies by the specific creator
    const creatorMovieCount = await Movie.countDocuments({ _id: movieId });

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
/*
*********************************************
Movies count per Genre
*********************************************
*/
const getMoviesByGenre = async (req, res) => {
  try {
    // Aggregate documents in the collection
    const genreCounts = await Movie.aggregate([
      {
        $group: {
          _id: "$genre", // Group by the 'genre' field
          count: { $sum: 1 } // Count the number of documents in each group
        }
      },
      {
        $sort: { count: -1 } // Optional: sort genres by descending count
      }
    ]);

    res.status(200).json({
      success: true,
      data: genreCounts.map(genreCount => ({
        genre: genreCount._id, // The genre name
        movieCount: genreCount.count // Number of movies in this genre
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route to get total likes and dislikes for all movies
const getAllLikesAndDislikes = async (req, res) => {
  try {
    const totals = await Movie.aggregate([
      {
        $project: {
          name: 1, // Include movie name in the result
          totalLikes: { $size: "$likes" },
          totalDislikes: { $size: "$dislikes" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Total likes and dislikes for all movies retrieved successfully!",
      data: totals
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to retrieve likes and dislikes",
      error: error.message
    });
  }
};

const countUsers = async () => {
  try {
      const userCount = await userModel.countDocuments();
      console.log(`There are ${userCount} users in the database.`);
  } catch (error) {
      console.error('Error fetching user count:', error);
  }
};

module.exports = {
    totalLikesDislikesPerCreator, 
    totalLikesDislikesPerMovie,
    getMoviesByGenre,
    getAllLikesAndDislikes,
    countUsers
};
  