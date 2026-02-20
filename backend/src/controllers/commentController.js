const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Like = require("../models/Like");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newComment = new Comment({
      post: postId,
      user: userId,
      text,
      image: imagePath,
      likesCount: 0,
    });

    await newComment.save();

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Yorum eklenemedi" });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user._id.toString() : null;

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 })
      .lean();

    let likedCommentIds = new Set();
    let repostedCommentIds = new Set();

    if (userId) {
      const [likes, reposts] = await Promise.all([
        Like.find({ user: userId, comment: { $exists: true, $ne: null } }),
        Post.find({
          user: userId,
          isRepost: true,
          parentComment: { $exists: true, $ne: null },
          $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
        }),
      ]);

      likes.forEach((l) => likedCommentIds.add(l.comment.toString()));
      reposts.forEach((r) =>
        repostedCommentIds.add(r.parentComment.toString()),
      );
    }

    const formattedComments = comments.map((comment) => {
      const cIdStr = comment._id.toString();
      return {
        ...comment,
        isComment: true,
        userId: comment.user?._id,
        username: comment.user?.username,
        profileImage: comment.user?.profileImage,

        likedByCurrentUser: likedCommentIds.has(cIdStr),
        isRepostedByMe: repostedCommentIds.has(cIdStr),

        isOwner: userId ? comment.user?._id?.toString() === userId : false,
        image: comment.image ? `http://localhost:5000${comment.image}` : null,
      };
    });

    res.json(formattedComments);
  } catch (error) {
    console.error("Yorum getirme hatası:", error);
    res.status(500).json({ message: "Yorumlar yüklenemedi" });
  }
};

const getCommentById = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id).toString() : null;

    const comment = await Comment.findById(req.params.id).populate(
      "user",
      "username profileImage",
    );

    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    const commentObj = comment.toObject();
    const cIdStr = commentObj._id.toString();

    let isRepostedByMe = false;
    if (userId) {
      const repostExists = await Post.findOne({
        user: new mongoose.Types.ObjectId(userId),
        isRepost: true,
        parentComment: new mongoose.Types.ObjectId(cIdStr),
        $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
      });
      isRepostedByMe = !!repostExists;
    }

    let likedByCurrentUser = false;
    if (userId) {
      const likeExists = await Like.findOne({
        user: userId,
        comment: cIdStr,
      });
      likedByCurrentUser = !!likeExists;
    }

    res.json({
      ...commentObj,

      isComment: true,
      userId: commentObj.user?._id,
      username: commentObj.user?.username,
      profileImage: commentObj.user?.profileImage,

      likedByCurrentUser: likedByCurrentUser,
      likesCount: commentObj.likesCount || 0,
      isRepostedByMe: isRepostedByMe,
      isOwner: userId ? commentObj.user?._id?.toString() === userId : false,

      image: commentObj.image
        ? commentObj.image.startsWith("http")
          ? commentObj.image
          : `http://localhost:5000${commentObj.image}`
        : null,
    });
  } catch (error) {
    console.error("Yorum detay hatası:", error);
    res.status(500).json({ message: "Yorum detayları alınamadı" });
  }
};

const getReplies = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id).toString() : null;

    const replies = await Comment.find({ parentComment: req.params.id })
      .populate("user", "username profileImage")
      .sort({ createdAt: 1 });

    const formattedReplies = await Promise.all(
      replies.map(async (reply) => {
        const replyObj = reply._doc || reply;
        const rIdStr = replyObj._id.toString();

        let isRepostedByMe = false;
        if (userId) {
          const repostExists = await Post.findOne({
            user: new mongoose.Types.ObjectId(userId),
            isRepost: true,
            parentComment: new mongoose.Types.ObjectId(rIdStr),
            $or: [{ text: "" }, { text: { $exists: false } }, { text: null }],
          });
          isRepostedByMe = !!repostExists;
        }

        return {
          ...replyObj,
          isOwner: userId ? replyObj.user?._id?.toString() === userId : false,
          likedByCurrentUser: userId
            ? replyObj.likes.some((id) => id.toString() === userId)
            : false,
          isRepostedByMe: isRepostedByMe,
          likesCount: replyObj.likes.length,
          image: replyObj.image
            ? `http://localhost:5000${replyObj.image}`
            : null,
          username: replyObj.user?.username,
          profileImage: replyObj.user?.profileImage,
          userId: replyObj.user?._id,
        };
      }),
    );

    res.json(formattedReplies);
  } catch (error) {
    console.error("Yanıtları getirme hatası:", error);
    res.status(500).json({ message: "Yanıtlar alınamadı" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı." });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bu yorumu silme yetkiniz yok." });
    }

    const postId = comment.post;

    if (comment.image) {
      const relativePath = comment.image.startsWith("/")
        ? comment.image.slice(1)
        : comment.image;
      const fullPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error("Yorum resmi silinirken hata:", err);
        }
      }
    }

    await Comment.findByIdAndDelete(id);

    await Like.deleteMany({ comment: id });

    if (postId) {
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });
    }

    res.status(200).json({ message: "Yorum başarıyla silindi." });
  } catch (error) {
    console.error("YORUM SİLME HATASI:", error);
    res.status(500).json({ message: "Yorum silinirken sunucu hatası oluştu." });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  getCommentById,
  getReplies,
};
