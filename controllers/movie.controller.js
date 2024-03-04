const Movie = require("../models/movie.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");

/*******************************************************************
 * CREATE A MOVIE
 *  ******************************************************************/
const createMovie = asyncHandler(async (req, res) => {
  try {
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
    const { thumbnail } = req.file.path;
    const creatorId = req.user._id;

    //REQUIRED FIELDS
    if (!name || !duration || !releasedDate || !description) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //VALIDATE MONGODB ID
    mongodbIdValidator(creatorId);

    //CHECK IF MOVIE ALREADY EXIST
    if (await Movie.findOne({ name }))
      return res.status(400).json({
        success: false,
        message: "Movie already exists!",
      });

    //CREATE NEW MOVIE
    new Movie({
      thumbnail,
      creatorId,
      name,
      duration,
      releasedDate,
      description,
      rating,
      likes,
      disLikes,
      cast,
    }).save();

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Movie added successfully!",
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
    const { thumbnail } = req.file.path;
    const creatorId = req.user._id;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(creatorId);

    const movie = await Movie.findById(id);

    if (movie.creatorId !== creatorId) {
      return res.status(400).json({
        success: false,
        message: "You are not the creator of this movie!",
      });
    }

    //UPDATE A MOVIE
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      {
        thumbnail,
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

    if (!updatedMovie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Movie updated!",
      data: updatedMovie,
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
    const creatorId = req.user._id;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(creatorId);

    const movie = await Movie.findById(id);

    if (movie.creatorId !== creatorId) {
      return res.status(400).json({
        success: false,
        message: "You are not the creator of this movie!",
      });
    }

    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
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
      data: movies,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * LIKE A MOVIE
 * ******************************************************************/
const likeMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(userId);

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    // Check if the user already disliked the movie
    const dislikeIndex = movie.dislikes.indexOf(userId);
    if (dislikeIndex !== -1) {
      movie.dislikes.splice(dislikeIndex, 1);
    }

    // Check if the user already liked the movie
    const likeIndex = movie.likes.indexOf(userId);
    if (likeIndex === -1) {
      movie.likes.push(userId);
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
    const userId = req.user._id;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(userId);

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(400).json({
        success: false,
        message: "Movie do not exist!",
      });
    }

    // Check if the user already liked the movie
    const likeIndex = movie.likes.indexOf(userId);
    if (likeIndex !== -1) {
      movie.likes.splice(likeIndex, 1);
    }

    // Check if the user already disliked the movie
    const dislikeIndex = movie.dislikes.indexOf(userId);
    if (dislikeIndex === -1) {
      movie.dislikes.push(userId);
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
 * RATE A MOVIE
 * ******************************************************************/
const rateMovie = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(userId);

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

module.exports = {
  createMovie,
  editMovie,
  deleteMovie,
  viewMovie,
  viewAllMovie,
  likeMovie,
  disLikeMovie,
  rateMovie,
};
