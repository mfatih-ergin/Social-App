const Comment = require("../models/Comment");
const Post = require("../models/Post");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const addComment = async (req, res) => {
  try {
    const { text, parentComment, postId: bodyPostId } = req.body;
    const postId = req.params.postId || bodyPostId;
    const userId = req.user._id || req.user.id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!text && !imagePath) {
      return res.status(400).json({ message: "Yorum içeriği boş olamaz." });
    }

    const comment = await Comment.create({
      post: postId,
      user: userId,
      text: text || "",
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
    const userId = req.user ? (req.user._id || req.user.id).toString() : null;

    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentObj = comment._doc || comment;
        const cIdStr = commentObj._id.toString();

        let isRepostedByMe = false;
        if (userId) {
          // TİP UYUŞMAZLIĞINI ÖNLEMEK İÇİN:
          // userId'yi ObjectId'ye çevirerek sorguluyoruz
          const repostExists = await Post.findOne({
            user: new mongoose.Types.ObjectId(userId),
            isRepost: true,
            parentComment: new mongoose.Types.ObjectId(cIdStr),
            $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
          });
          isRepostedByMe = !!repostExists;
        }

        return {
          ...commentObj,
          isOwner: userId ? commentObj.user?._id?.toString() === userId : false,
          likedByCurrentUser: userId
            ? commentObj.likes.some((id) => id.toString() === userId)
            : false,
          isRepostedByMe: isRepostedByMe,
          likesCount: commentObj.likes.length,
          image: commentObj.image
            ? `http://localhost:5000${commentObj.image}`
            : null,
          username: commentObj.user?.username,
          userId: commentObj.user?._id,
        };
      }),
    );

    res.json(formattedComments);
  } catch (error) {
    console.error("Yorum getirme hatası:", error);
    res.status(500).json({ message: "Yorumlar alınamadı" });
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

    const commentObj = comment._doc || comment;
    const cIdStr = commentObj._id.toString();

    let isRepostedByMe = false;
    if (userId) {
      // BURASI POSTPAGE İÇİN KRİTİK:
      const repostExists = await Post.findOne({
        user: new mongoose.Types.ObjectId(userId),
        isRepost: true,
        parentComment: new mongoose.Types.ObjectId(cIdStr),
        $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
      });
      isRepostedByMe = !!repostExists;
    }

    res.json({
      ...commentObj,
      isOwner: userId ? commentObj.user?._id?.toString() === userId : false,
      likedByCurrentUser: userId
        ? commentObj.likes.some((id) => id.toString() === userId)
        : false,
      isRepostedByMe: isRepostedByMe, // Backend'den gelen bu bilgi artık 'true' olacak
      likesCount: commentObj.likes.length,
      image: commentObj.image
        ? `http://localhost:5000${commentObj.image}`
        : null,
      username: commentObj.user?.username,
      profileImage: commentObj.user?.profileImage,
      userId: commentObj.user?._id,
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

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    const userId = (req.user._id || req.user.id).toString();
    const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();
    res.json({ likesCount: comment.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: "Yorum beğenilemedi" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Yorum bulunamadı" });

    const currentUserId = (req.user._id || req.user.id).toString();
    if (comment.user.toString() !== currentUserId) {
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
      const fullPath = path.join(
        process.cwd(),
        comment.image.startsWith("/") ? comment.image.slice(1) : comment.image,
      );
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(err);
        }
      }
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Silindi" });
  } catch (error) {
    console.error("Yorum silme hatası:", error);
    res.status(500).json({ message: "Hata oluştu" });
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
