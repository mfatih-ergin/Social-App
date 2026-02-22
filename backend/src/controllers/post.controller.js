const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Save = require("../models/Save");
const Like = require("../models/Like");
const User = require("../models/User");

const fs = require("fs");
const path = require("path");

const formatPostData = async (
  post,
  userId,
  userSavesMap,
  currentUserFollowing = null,
) => {
  const postObj = post._doc || post;
  if (!postObj || !postObj._id) return null;
  const pIdStr = postObj._id.toString();
  const postAuthorId = postObj.user?._id || postObj.user;

  let isFollowingByMe = false;
  if (userId && postAuthorId && userId !== postAuthorId.toString()) {
    let followingList = currentUserFollowing;
    if (!followingList) {
      const me = await User.findById(userId).select("following").lean();
      followingList = me?.following || [];
    }

    isFollowingByMe = followingList.some(
      (id) => id.toString() === postAuthorId.toString(),
    );
  }

  const isMyDirectRepost =
    postObj.isRepost &&
    userId &&
    postAuthorId?.toString() === userId &&
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

  const finalMap = userSavesMap instanceof Map ? userSavesMap : new Map();
  const savedData = finalMap.get(pIdStr);
  const isSavedByMe = !!savedData;
  const collectionIds = savedData || [];

  const isOwner =
    userId && postAuthorId ? postAuthorId.toString() === userId : false;

  let formattedParent = null;
  const parentSource = postObj.parentPost || postObj.parentComment;

  if (parentSource) {
    const parentIdStr = parentSource._id.toString();
    const parentDoc = parentSource._doc || parentSource;
    const parentAuthorId = parentDoc.user?._id || parentDoc.user;

    let parentLikedByMe = false;
    let parentFollowingByMe = false;

    if (userId) {
      const parentLikeExists = await Like.findOne({
        user: userId,
        $or: [{ post: parentIdStr }, { comment: parentIdStr }],
      });
      parentLikedByMe = !!parentLikeExists;

      if (parentAuthorId && userId !== parentAuthorId.toString()) {
        let followingList = currentUserFollowing;
        if (!followingList) {
          const me = await User.findById(userId).select("following").lean();
          followingList = me?.following || [];
        }
        parentFollowingByMe = followingList.some(
          (id) => id.toString() === parentAuthorId.toString(),
        );
      }
    }

    const pSavedData = finalMap.get(parentIdStr);

    formattedParent = {
      ...parentDoc,
      likesCount: parentDoc.likesCount || 0,
      likedByCurrentUser: parentLikedByMe,
      isFollowingByMe: parentFollowingByMe,
      isSavedByMe: !!pSavedData,
      collectionIds: pSavedData || [],
      image: parentDoc.image
        ? parentDoc.image.startsWith("http")
          ? parentDoc.image
          : `http://localhost:5000${parentDoc.image}`
        : null,
    };
  }

  return {
    _id: postObj._id,
    userId: postAuthorId,
    username: postObj.user?.username,
    profileImage: postObj.user?.profileImage,
    text: postObj.text,
    image: postObj.image ? `http://localhost:5000${postObj.image}` : null,
    commentsCount: postObj.commentsCount || 0,
    repostsCount: postObj.repostsCount || 0,
    likesCount: postObj.likesCount || 0,
    isRepost: postObj.isRepost || false,
    isRepostedByMe: isRepostedByMe,
    isFollowingByMe: isFollowingByMe,
    parentPost: postObj.parentPost ? formattedParent : null,
    parentComment: postObj.parentComment ? formattedParent : null,
    likedByCurrentUser,
    isSavedByMe,
    collectionIds,
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
    console.error("Create Post Hatası:", error);
    res.status(500).json({ message: "Post oluşturulamadı" });
  }
};

const getPosts = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();
    const userSavesMap = new Map();

    if (userId) {
      const userSaves = await Save.find({ user: userId }).lean();
      userSaves.forEach((s) => {
        const key = (s.post || s.comment)?.toString();
        if (key) userSavesMap.set(key, s.collectionIds || [null]);
      });
    }

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
      posts.map((post) => formatPostData(post, userId, userSavesMap)),
    );

    res.json(postsWithInfo);
  } catch (error) {
    console.error("getPosts Hatası:", error);
    res.status(500).json({ message: "Postlar alınamadı" });
  }
};

const getExplore = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();
    const userSavesMap = new Map();

    if (userId) {
      const userSaves = await Save.find({ user: userId }).lean();
      userSaves.forEach((s) => {
        const key = (s.post || s.comment)?.toString();
        if (key) userSavesMap.set(key, s.collectionIds || [null]);
      });
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
      posts.map((post) => formatPostData(post, userId, userSavesMap)),
    );

    res.json(postsWithInfo);
  } catch (error) {
    console.error("getExplore Hatası:", error);
    res.status(500).json({ message: "Explore alınamadı" });
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

    const userSavesMap = new Map();
    if (userId) {
      const userSaves = await Save.find({ user: userId }).lean();
      userSaves.forEach((s) => {
        const key = (s.post || s.comment)?.toString();
        if (key) userSavesMap.set(key, s.collectionIds || [null]);
      });
    }

    const formatted = await formatPostData(post, userId, userSavesMap);
    res.status(200).json(formatted);
  } catch (error) {
    console.error("getPostById Hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Gönderi bulunamadı" });
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }

    if (post.image) {
      const postImagePath = path.join(process.cwd(), post.image);
      if (fs.existsSync(postImagePath)) fs.unlinkSync(postImagePath);
    }

    const comments = await Comment.find({ post: id });
    comments.forEach((comment) => {
      if (comment.image) {
        const cp = path.join(process.cwd(), comment.image);
        if (fs.existsSync(cp)) fs.unlinkSync(cp);
      }
    });

    await Promise.all([
      Like.deleteMany({ post: id }),
      Save.deleteMany({ post: id }),
      Post.deleteMany({ parentPost: id }),
      Comment.deleteMany({ post: id }),
      Like.deleteMany({ comment: { $in: comments.map((c) => c._id) } }),
    ]);

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Gönderi silindi." });
  } catch (error) {
    console.error("Post silme hatası:", error);
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
    console.error("Repost hatası:", error);
    res.status(500).json({ message: "İşlem başarısız" });
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
