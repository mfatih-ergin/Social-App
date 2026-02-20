const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Save = require("../models/Save");
const Like = require("../models/Like");
const fs = require("fs");
const path = require("path");

const formatPostData = async (post, userId, savedPostIds, savedCommentIds) => {
  const postObj = post._doc || post;
  const pIdStr = postObj._id.toString();

  const isMyDirectRepost =
    postObj.isRepost &&
    userId &&
    postObj.user?._id?.toString() === userId &&
    !postObj.text;

  let isRepostedByMe = false;
  if (isMyDirectRepost) {
    isRepostedByMe = true;
  } else if (userId) {
    const repostExists = await Post.findOne({
      user: userId,
      isRepost: true,
      text: "",
      image: "",
      $or: [{ parentPost: pIdStr }, { parentComment: pIdStr }],
    });
    isRepostedByMe = !!repostExists;
  }

  let likedByCurrentUser = false;
  if (userId) {
    const likeExists = await Like.findOne({ user: userId, post: pIdStr });
    likedByCurrentUser = !!likeExists;
  }

  const isOwner =
    userId && postObj.user?._id
      ? postObj.user?._id?.toString() === userId
      : false;

  const isSavedByMe = savedPostIds.has(pIdStr);

  let formattedParent = null;
  const parentSource = postObj.parentPost || postObj.parentComment;

  if (parentSource) {
    const parentIdStr = parentSource._id.toString();

    let parentLikedByMe = false;
    if (userId) {
      const parentLikeExists = await Like.findOne({
        user: userId,
        $or: [{ post: parentIdStr }, { comment: parentIdStr }],
      });
      parentLikedByMe = !!parentLikeExists;
    }

    const parentSavedByMe = postObj.parentPost
      ? savedPostIds.has(parentIdStr)
      : savedCommentIds.has(parentIdStr);

    const parentDoc = parentSource._doc || parentSource;

    formattedParent = {
      ...parentDoc,
      likesCount: parentDoc.likesCount || 0,
      likedByCurrentUser: parentLikedByMe,
      isSavedByMe: parentSavedByMe,
      image: parentDoc.image
        ? parentDoc.image.startsWith("http")
          ? parentDoc.image
          : `http://localhost:5000${parentDoc.image}`
        : null,
    };
  }

  return {
    _id: postObj._id,
    userId: postObj.user?._id,
    username: postObj.user?.username,
    profileImage: postObj.user?.profileImage,
    text: postObj.text,
    image: postObj.image ? `http://localhost:5000${postObj.image}` : null,
    commentsCount: postObj.commentsCount || 0,
    repostsCount: postObj.repostsCount || 0,
    likesCount: postObj.likesCount || 0,
    isRepost: postObj.isRepost || false,
    isRepostedByMe: isRepostedByMe,
    parentPost: postObj.parentPost ? formattedParent : null,
    parentComment: postObj.parentComment ? formattedParent : null,
    likedByCurrentUser,
    isSavedByMe,
    isOwner: isOwner,
    createdAt: postObj.createdAt,
  };
};

const createPost = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { text } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    if (!text && !imagePath) {
      return res
        .status(400)
        .json({ message: "Post içeriği tamamen boş olamaz." });
    }

    const post = await Post.create({
      user: userId,
      text: text || "",
      image: imagePath,
      likesCount: 0,
    });

    res.status(201).json({
      _id: post._id,
      username: req.user.username,
      text: post.text,
      image: post.image,
      likesCount: 0,
      commentsCount: 0,
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ message: "Post oluşturulamadı" });
  }
};

const getPosts = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userSaves = await Save.find({ user: userId });
    const savedPostIds = new Set(userSaves.map((s) => s.post?.toString()));
    const savedCommentIds = new Set(
      userSaves.map((s) => s.comment?.toString()),
    );

    const posts = await Post.find()
      .populate("user", "username email profileImage")
      .populate({
        path: "parentPost",
        populate: { path: "user", select: "username profileImage" },
      })
      .populate({
        path: "parentComment",
        populate: { path: "user", select: "username profileImage" },
      })
      .sort({ createdAt: -1 });

    const postsWithInfo = await Promise.all(
      posts.map((post) =>
        formatPostData(post, userId, savedPostIds, savedCommentIds),
      ),
    );

    res.json(postsWithInfo);
  } catch (error) {
    res.status(500).json({ message: "Postlar alınamadı" });
  }
};

const getExplore = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();
    let savedPostIds = new Set();
    let savedCommentIds = new Set();

    if (userId) {
      const userSaves = await Save.find({ user: userId });
      savedPostIds = new Set(userSaves.map((s) => s.post?.toString()));
      savedCommentIds = new Set(userSaves.map((s) => s.comment?.toString()));
    }

    const posts = await Post.find()
      .populate("user", "username profileImage")
      .populate({
        path: "parentPost",
        populate: { path: "user", select: "username profileImage" },
      })
      .populate({
        path: "parentComment",
        populate: { path: "user", select: "username profileImage" },
      })
      .sort({ createdAt: -1 });

    const postsWithInfo = await Promise.all(
      posts.map((post) =>
        formatPostData(post, userId, savedPostIds, savedCommentIds),
      ),
    );

    res.json(postsWithInfo);
  } catch (error) {
    res.status(500).json({ message: "Explore alınamadı" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Gönderi bulunamadı" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bu işlemi yapmak için yetkiniz yok" });
    }

    try {
      await Like.deleteMany({ post: id });
      console.log(`${id} postuna ait beğeniler temizlendi.`);

      await Save.deleteMany({ post: id });
      console.log(`${id} postuna ait kaydedilenler temizlendi.`);

      await Post.deleteMany({ parentPost: id });
      console.log(`${id} postuna ait repostlar temizlendi.`);

      await Comment.deleteMany({ post: id });
      console.log(`${id} postuna ait yorumlar temizlendi.`);
    } catch (dbErr) {
      console.error("İlişkili veriler silinirken hata:", dbErr);
    }

    await Post.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Gönderi ve ilişkili tüm veriler başarıyla silindi" });
  } catch (error) {
    console.error("Post silme hatası (Detaylı):", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id?.toString();

    const post = await Post.findById(id)
      .populate("user", "username profileImage")
      .populate({
        path: "parentPost",
        populate: { path: "user", select: "username profileImage" },
      })
      .populate({
        path: "parentComment",
        populate: { path: "user", select: "username profileImage" },
      });

    if (!post) return res.status(404).json({ message: "Gönderi bulunamadı" });

    let savedPostIds = new Set();
    let savedCommentIds = new Set();
    if (userId) {
      const userSaves = await Save.find({ user: userId });
      savedPostIds = new Set(userSaves.map((s) => s.post?.toString()));
      savedCommentIds = new Set(userSaves.map((s) => s.comment?.toString()));
    }

    const formatted = await formatPostData(
      post,
      userId,
      savedPostIds,
      savedCommentIds,
    );
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const repostContent = async (req, res) => {
  try {
    const { id } = req.params;
    const text = req.body?.text || "";
    const type = req.body?.type || "post";
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
    const userId = req.user._id || req.user.id;

    if (!text.trim() && !imagePath) {
      const query = {
        user: userId,
        isRepost: true,
        text: "",
        image: "",
        [type === "post" ? "parentPost" : "parentComment"]: id,
      };

      const existingRepost = await Post.findOne(query);
      if (existingRepost) {
        await Post.findByIdAndDelete(existingRepost._id);
        return res.status(200).json({ action: "unrepost" });
      }
    }

    const newRepost = new Post({
      user: userId,
      text: text,
      image: imagePath,
      isRepost: true,
    });

    if (type === "post") {
      newRepost.parentPost = id;
      await Post.findByIdAndUpdate(id, { $inc: { repostsCount: 1 } });
    } else {
      newRepost.parentComment = id;
      await Comment.findByIdAndUpdate(id, { $inc: { repostsCount: 1 } });
    }

    await newRepost.save();
    res.status(201).json({ action: "repost" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getExplore,
  deletePost,
  getPostById,
  repostContent,
};
