const Comment = require("../models/Comment");
const Post = require("../models/Post");
const fs = require("fs");
const path = require("path");

const addComment = async (req, res) => {
  try {
    const { text, parentComment, postId: bodyPostId } = req.body;
    const postId = req.params.postId || bodyPostId;
    const userId = req.user.id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const comment = await Comment.create({
      post: postId,
      user: userId,
      text,
      image: imagePath,
      parentComment: parentComment || null,
    });

    if (!parentComment) {
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    } else {
      await Comment.findByIdAndUpdate(parentComment, {
        $inc: { repliesCount: 1 },
      });
    }

    const populatedComment = await comment.populate(
      "user",
      "username profileImage",
    );
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Yorum Hatası:", error);
    res.status(500).json({ message: "Yorum eklenemedi" });
  }
};

const getComments = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id.toString() : null;

    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    const formattedComments = comments.map((comment) => {
      const commentUser = comment.user || {};
      return {
        ...comment._doc,
        isOwner: currentUserId
          ? commentUser._id?.toString() === currentUserId
          : false,
        image: comment.image,
      };
    });

    res.json(formattedComments);
  } catch (error) {
    console.error("Yorum getirme hatası:", error);
    res.status(500).json({ message: "Yorumlar alınamadı" });
  }
};

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    const userId = req.user.id;
    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      likesCount: comment.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    res.status(500).json({ message: "Yorum beğenilemedi" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }

    if (!comment.parentComment) {
      await Post.findByIdAndUpdate(comment.post, {
        $inc: { commentsCount: -1 },
      });

      await Comment.deleteMany({ parentComment: commentId });
    } else {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    if (comment.image) {
      const filePath = path.join(__dirname, "..", "..", comment.image);
      fs.unlink(filePath, (err) => {
        if (err) console.error(err);
      });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Silindi" });
  } catch (error) {
    res.status(500).json({ message: "Hata oluştu" });
  }
};

const getCommentById = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id.toString() : null;

    const comment = await Comment.findById(req.params.id).populate(
      "user",
      "username profileImage",
    );

    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    const formattedComment = {
      ...comment._doc,
      isOwner: currentUserId
        ? comment.user?._id?.toString() === currentUserId
        : false,
      likedByCurrentUser: currentUserId
        ? comment.likes.includes(currentUserId)
        : false,
      likesCount: comment.likes.length,
      userId: comment.user?._id,
      username: comment.user?.username,
      profileImage: comment.user?.profileImage,
    };

    res.json(formattedComment);
  } catch (error) {
    console.error("Yorum detay hatası:", error);
    res.status(500).json({ message: "Yorum detayları alınamadı" });
  }
};

const getReplies = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id.toString() : null;

    const replies = await Comment.find({ parentComment: req.params.id })
      .populate("user", "username profileImage")
      .sort({ createdAt: 1 });

    const formattedReplies = replies.map((reply) => ({
      ...reply._doc,
      isOwner: currentUserId
        ? reply.user?._id?.toString() === currentUserId
        : false,
      likedByCurrentUser: currentUserId
        ? reply.likes.includes(currentUserId)
        : false,
      likesCount: reply.likes.length,
      userId: reply.user?._id,
      username: reply.user?.username,
      profileImage: reply.user?.profileImage,
    }));

    res.json(formattedReplies);
  } catch (error) {
    console.error("Yanıtları getirme hatası:", error);
    res.status(500).json({ message: "Yanıtlar alınamadı" });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  likeComment,
  getCommentById,
  getReplies,
};
