const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    thumbnail: {
      filename: String,
      contentType: String,
      data: Buffer,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    releasedDate: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rating: Number,
    likes: Number,
    disLikes: Number,
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
