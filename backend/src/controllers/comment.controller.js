const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Like = require("../models/Like");
const User = require("../models/User");
const Save = require("../models/Save");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const formatCommentData = (
  comment,
  userId,
  likedCommentIds,
  repostedCommentIds,
  followingList,
  userSavesMap,
) => {
  const cIdStr = comment._id.toString();
  const commentAuthorId = comment.user?._id?.toString();

  const isFollowingByMe =
    userId && commentAuthorId && userId !== commentAuthorId
      ? followingList.some((id) => id.toString() === commentAuthorId)
      : false;

  const savedData = userSavesMap.get(cIdStr);

  return {
    ...comment,
    isComment: true,
    userId: comment.user?._id,
    username: comment.user?.username,
    profileImage: comment.user?.profileImage,
    likedByCurrentUser: likedCommentIds.has(cIdStr),
    isRepostedByMe: repostedCommentIds.has(cIdStr),
    isFollowingByMe: isFollowingByMe,
    isSavedByMe: !!savedData,
    collectionIds: savedData || [],
    isOwner: userId ? commentAuthorId === userId : false,
    image: comment.image
      ? comment.image.startsWith("http")
        ? comment.image
        : `http://localhost:5000${comment.image}`
      : null,
  };
};

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, parentComment } = req.body;
    const userId = req.user._id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newComment = new Comment({
      post: postId,
      user: userId,
      text: text || "",
      image: imagePath,
      parentComment: parentComment || null,
      likesCount: 0,
    });

    await newComment.save();

    if (!parentComment) {
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    } else {
      await Comment.findByIdAndUpdate(parentComment, {
        $inc: { repliesCount: 1 },
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Yorum ekleme hatası:", error);
    res.status(500).json({ message: "Yorum eklenemedi" });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user._id.toString() : null;
    const userSavesMap = new Map();
    let followingList = [];

    if (userId) {
      const currentUser = await User.findById(userId)
        .select("following")
        .lean();
      followingList = currentUser?.following || [];

      const userSaves = await Save.find({ user: userId }).lean();
      userSaves.forEach((s) => {
        const key = (s.post || s.comment)?.toString();
        if (key) userSavesMap.set(key, s.collectionIds || [null]);
      });
    }

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

    const formattedComments = comments.map((comment) =>
      formatCommentData(
        comment,
        userId,
        likedCommentIds,
        repostedCommentIds,
        followingList,
        userSavesMap,
      ),
    );

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
    const userSavesMap = new Map();
    let followingList = [];

    if (userId) {
      const [me, userSaves] = await Promise.all([
        User.findById(userId).select("following").lean(),
        Save.find({ user: userId }).lean(),
      ]);

      followingList = me?.following || [];
      userSaves.forEach((s) => {
        const key = (s.post || s.comment)?.toString();
        if (key) userSavesMap.set(key, s.collectionIds || [null]);
      });
    }

    let isRepostedByMe = false;
    let likedByCurrentUser = false;

    if (userId) {
      const [repostExists, likeExists] = await Promise.all([
        Post.findOne({
          user: userId,
          isRepost: true,
          parentComment: cIdStr,
          $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
        }),
        Like.findOne({ user: userId, comment: cIdStr }),
      ]);
      isRepostedByMe = !!repostExists;
      likedByCurrentUser = !!likeExists;
    }

    const savedData = userSavesMap.get(cIdStr);

    res.json({
      ...commentObj,
      isComment: true,
      userId: commentObj.user?._id,
      username: commentObj.user?.username,
      profileImage: commentObj.user?.profileImage,
      likedByCurrentUser,
      isRepostedByMe,
      isFollowingByMe:
        userId &&
        commentObj.user?._id &&
        userId !== commentObj.user._id.toString()
          ? followingList.some(
              (id) => id.toString() === commentObj.user._id.toString(),
            )
          : false,
      isSavedByMe: !!savedData,
      collectionIds: savedData || [],
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
    const userSavesMap = new Map();
    let followingList = [];

    if (userId) {
      const [currentUser, userSaves] = await Promise.all([
        User.findById(userId).select("following").lean(),
        Save.find({ user: userId }).lean(),
      ]);

      followingList = currentUser?.following || [];
      userSaves.forEach((s) => {
        const key = (s.post || s.comment)?.toString();
        if (key) userSavesMap.set(key, s.collectionIds || [null]);
      });
    }

    const replies = await Comment.find({ parentComment: req.params.id })
      .populate("user", "username profileImage")
      .sort({ createdAt: 1 })
      .lean();

    let likedCommentIds = new Set();
    let repostedCommentIds = new Set();

    if (userId) {
      const [likes, reposts] = await Promise.all([
        Like.find({ user: userId, comment: { $exists: true } }),
        Post.find({
          user: userId,
          isRepost: true,
          parentComment: { $exists: true },
          $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
        }),
      ]);

      likes.forEach((l) => likedCommentIds.add(l.comment?.toString()));
      reposts.forEach((r) =>
        repostedCommentIds.add(r.parentComment?.toString()),
      );
    }

    const formattedReplies = replies.map((reply) =>
      formatCommentData(
        reply,
        userId,
        likedCommentIds,
        repostedCommentIds,
        followingList,
        userSavesMap,
      ),
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

    await Promise.all([
      Like.deleteMany({ comment: id }),
      Save.deleteMany({ comment: id }),
    ]);

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
