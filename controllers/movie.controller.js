const Movie = require("../models/movie.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");
const path = require("path"); // Import the 'path' module
const fs = require("fs");
//const isReviewed = product.reviews.find(
//(rev) => rev.user._id === req.user._id
//);

/*******************************************************************
 * CREATE A MOVIE
 *  ******************************************************************/
const createMovie = asyncHandler(async (req, res) => {
  try {
    const {
      creatorId,
      name,
      duration,
      genre,
      releasedDate,
      description,
      original_language,
      directors,
      country_origin,
      trailer,
      socials,
      ratings,
      likes,
      dislikes,
      cast,
    } = req.body;

    // Access the uploaded file details
    const { originalname, mimetype, buffer } = req.file;

    // REQUIRED FIELDS
    if (!name || !duration || !releasedDate || !description) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    // CHECK IF MOVIE ALREADY EXISTS
    if (await Movie.findOne({ name })) {
      return res.status(400).json({
        success: false,
        message: "Movie already exists!",
      });
    }

    // Save the file to the specified folder
    const targetPath = path.join(__dirname, "..", "uploads", originalname);
    fs.writeFileSync(targetPath, buffer);

    // CREATE NEW MOVIE
    const savedMovie = new Movie({
      thumbnail: {
        filename: originalname,
        contentType: mimetype,
        // data: buffer,
      },
      creatorId,
      name,
      duration,
      genre,
      releasedDate,
      description,
      original_language,
      directors,
      country_origin,
      trailer,
      socials,
      ratings,
      likes,
      dislikes,
      cast,
    });
    
    await savedMovie.save();

    // SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Movie added successfully!",
      data: savedMovie
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/*******************************************************************
 * EDIT A MOVIE
 *  ******************************************************************/
const editMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      duration,
      releasedDate,
      description,
      rating,
      likes,
      disLikes,
      cast,
    } = req.body;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    //UPDATE A MOVIE
    const update = await Movie.findByIdAndUpdate(
      id,
      {
        // thumbnail: {
        //   filename: req.file.originalname,
        //   contentType: req.file.mimetype,
        //   data: req.file.buffer,
        // },
        name,
        duration,
        releasedDate,
        description,
        rating,
        likes,
        disLikes,
        cast,
      },
      { new: true }
    );

    if (!update) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Movie updated!",
      data: update,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * DELETE A MOVIE
 *  ******************************************************************/
const deleteMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully!",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VIEW A MOVIE
 *  ******************************************************************/
const viewMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VIEW ALL MOVIE
 * ******************************************************************/
const viewAllMovie = asyncHandler(async (req, res) => {
  try {
    const movies = await Movie.find();

    if (movies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There is no movies stored yet!",
      });
    }

    res.status(200).json({
      success: true,
      // data: movies,
      data: movies,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/********************************************************************
 * VIEW ALL MOVIE BY GENRE
 * ******************************************************************/
const viewAllMovieByGenre = asyncHandler(async (req, res) => {
  try {
    const { genre, creatorId } = req.body;
    
    console.log(genre, creatorId);
    
    // Initialize an empty query object
    let query = {};

    // Conditionally add genre to the query if it's not 'all'
    if (genre && genre.toLowerCase() !== 'all') {
      query.genre = genre;
    }

    // Conditionally add creatorId to the query if it's provided
    if (creatorId) {
      query.creatorId = creatorId;
    }
  
    // Use the query object directly in the find() method
    const movies = await Movie.find(query);
  
    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies found matching the criteria!",
      });
    }
  
    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


// const viewAllMovieByGenreV2 = asyncHandler(async (req, res) => {
//   try {
//     const { genre } = req.body;
    
//     console.log(genre)
    
//     // Build the query conditionally based on the genre parameter
//     let query = {};
//     if (genre && genre.toLowerCase() !== 'all') {
//       query.genre = genre;
//     }
  
//     // Use the query object directly in the find() method
//     const movies = await Movie.find(query);
  
//     if (movies.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No movies found!",
//       });
//     }

//     // Extract movie IDs
//     const movieIds = movies.map(movie => movie._id);

//     // Find tickets and schedules related to these movies
//     const ticketsPromise = ticketModel.find({ movieId: { $in: movieIds } })
//                                  .populate('creatorId', 'username email')
//                                  .populate('scheduleId');
//     const schedulesPromise = scheduleModel.find({ movieId: { $in: movieIds } })
//                                       .populate('creatorId', 'username email');

//     const [tickets, schedules] = await Promise.all([movies, ticketsPromise, schedulesPromise]);

//     // Respond with tickets and schedules related to movies of the specified genre
//     res.status(200).json({
//       success: true,
//       data: {
//         tickets: tickets,
//         schedules: schedules,
//       },
//     });

//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
  
// });

/*******************************************************************
 * LIKE A MOVIE
 * ******************************************************************/
const likeMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { _id } = req.user;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(_id);

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    // Check if the user already disliked the movie
    const dislikeIndex = movie.dislikes.indexOf(_id);
    if (dislikeIndex !== -1) {
      movie.dislikes.splice(dislikeIndex, 1);
    }

    // Check if the user already liked the movie
    const likeIndex = movie.likes.indexOf(_id);
    if (likeIndex === -1) {
      movie.likes.push(_id);
    }

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie liked successfully",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * DISLIKE A MOVIE
 * ******************************************************************/
const disLikeMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { _id } = req.user;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(_id);

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    // Check if the user already liked the movie
    const likeIndex = movie.likes.indexOf(_id);
    if (likeIndex !== -1) {
      movie.likes.splice(likeIndex, 1);
    }

    // Check if the user already disliked the movie
    const dislikeIndex = movie.dislikes.indexOf(_id);
    if (dislikeIndex === -1) {
      movie.dislikes.push(_id);
    }

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie disliked successfully",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * RATING A MOVIE
 * ******************************************************************/
const rateMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { _id } = req.user;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(_id);

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    const userRatingIndex = movie.ratings.findIndex(
      (item) => item.userId.toString() === userId
    );
    if (userRatingIndex !== -1) {
      // User already rated the movie, update the rating
      movie.ratings[userRatingIndex].rating = rating;
    } else {
      // User hasn't rated the movie yet, add new rating
      movie.ratings.push({ userId, rating });
    }

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie rated successfully",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});


const viewLikesAndDislikes = asyncHandler(async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findById(movieId).select('likes dislikes').exec();

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    // Count the number of likes and dislikes
    const likesCount = movie.likes.length;
    const dislikesCount = movie.dislikes.length;

    res.json({
      success: true,
      data: {
        likes: movie.likes,
        dislikes: movie.dislikes,
        likesCount,
        dislikesCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = {
  createMovie,
  editMovie,
  deleteMovie,
  viewMovie,
  viewAllMovie,
  likeMovie,
  disLikeMovie,
  rateMovie,
  viewAllMovieByGenre,
  viewLikesAndDislikes
};
