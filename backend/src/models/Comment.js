const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      // Eğer kullanıcı sadece resim atıyorsa metin zorunlu olmasın diyorsan:
      required: function () {
        return !this.image;
      },
    },
    image: {
      type: String, // Resim URL'si burada saklanacak
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

module.exports = mongoose.model("Comment", commentSchema);
