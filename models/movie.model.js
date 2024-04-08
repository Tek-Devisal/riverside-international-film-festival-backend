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
    genre: {
      type: String,
      trim: true,
      required: false,
      default: "action"
    },
    thumbnail: {
      filename: String,
      contentType: String,
      // data: Buffer,
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
    original_language:{
      type: String, 
      required: false,
      default: "English"
    },
    directors:{
      type: String,
      required: false
    },
    country_origin:{
      type: String, 
      required: false, 
      default: "United States"
    },
    trailer:{
      type: String, 
      required: false, 
    },
    socials:{
        website: String, 
        twitter: String,
        facebook: String,
        instagram: String
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
          // data: Buffer,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
