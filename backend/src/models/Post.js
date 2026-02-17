const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, trim: true },
    image: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },

    isRepost: { type: Boolean, default: false },

    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    repostsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.pre("findOneAndDelete", async function (next) {
  const docToDel = await this.model.findOne(this.getQuery());
  if (docToDel) {
    await mongoose.model("Comment").deleteMany({ post: docToDel._id });

    if (docToDel.isRepost) {
      if (docToDel.parentPost) {
        await mongoose.model("Post").findByIdAndUpdate(docToDel.parentPost, {
          $inc: { repostsCount: -1 },
        });
      } else if (docToDel.parentComment) {
        await mongoose
          .model("Comment")
          .findByIdAndUpdate(docToDel.parentComment, {
            $inc: { repostsCount: -1 },
          });
      }
    }
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
