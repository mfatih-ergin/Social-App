const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profileImage: {
      type: String,
      default: process.env.DEFAULT_AVATAR_URL,
    },
    banner: {
      type: String,
      default: process.env.DEFAULT_BANNER_URL,
    },
    bio: {
      type: String,
      maxlength: 160,
      default: "Merhaba! Ben Social App kullanıyorum.",
    },
    birthday: {
      type: Date,
      default: null,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
