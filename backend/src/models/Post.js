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
    likesCount: { type: Number, default: 0 },
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

postSchema.pre("findOneAndDelete", async function () {
  const docToDel = await this.model.findOne(this.getQuery());

  if (docToDel) {
    try {
      await mongoose.model("Like").deleteMany({ post: docToDel._id });
      //console.log(`${docToDel._id} postuna ait beğeniler temizlendi.`);

      await mongoose.model("Save").deleteMany({ post: docToDel._id });
      //console.log(`${docToDel._id} postuna ait kaydedilenler temizlendi.`);

      await mongoose.model("Comment").deleteMany({ post: docToDel._id });
      //console.log(`${docToDel._id} postuna ait yorumlar temizlendi.`);

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
        //console.log(`${docToDel._id} bir reposttu, parent sayacı düşürüldü.`);
      }
    } catch (err) {
      //console.error("Post silinirken ilişkili veriler temizlenemedi:", err);
    }
  }
});

module.exports = mongoose.model("Post", postSchema);
