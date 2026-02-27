const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Kullanıcı adı zorunludur"],
      unique: true,
      trim: true,
      minlength: [3, "Kullanıcı adı en az 3 karakter olmalıdır"],
      maxlength: [20, "Kullanıcı adı 20 karakterden fazla olamaz"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Kullanıcı adı sadece harf, rakam ve alt çizgi içermelidir",
      ],
    },
    email: {
      type: String,
      required: [true, "Email adresi zorunludur"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Lütfen geçerli bir email adresi giriniz",
      ],
    },
    password: {
      type: String,
      required: [true, "Şifre zorunludur"],
      minlength: [8, "Şifre en az 8 karakter olmalıdır"],
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
