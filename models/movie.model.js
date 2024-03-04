const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    releasedDate: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
      },
    ],
    cast: [
      {
        name: String,
        image: {
          filename: String,
          contentType: String,
          data: Buffer,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
