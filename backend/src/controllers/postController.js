const Post = require("../models/Post");
const Comment = require("../models/Comment");
const fs = require("fs");
const path = require("path");

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

    const posts = await Post.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    const postsWithLikeInfo = posts.map((post) => {
      const likedByCurrentUser = userId
        ? post.likes.some((id) => id.toString() === userId)
        : false;

      const isOwner = userId ? post.user._id.toString() === userId : false;

      return {
        _id: post._id,
        userId: post.user._id,
        username: post.user.username,
        text: post.text,
        image: post.image ? `http://localhost:5000${post.image}` : null,
        likesCount: post.likes.length,
        commentsCount: post.commentsCount || 0,
        likedByCurrentUser,
        isOwner: isOwner,
        createdAt: post.createdAt,
      };
    });

    res.json(postsWithLikeInfo);
  } catch (error) {
    res.status(500).json({ message: "Postlar alınamadı" });
  }
};

const getExplore = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();

    const posts = await Post.find()
      .populate("user", "username")
      .sort({ createdAt: -1 });

    const postsWithLikeInfo = posts.map((post) => {
      const likedByCurrentUser = userId
        ? post.likes.some((id) => id.toString() === userId)
        : false;

      const isOwner = userId ? post.user._id.toString() === userId : false;

      return {
        _id: post._id,
        userId: post.user._id,
        username: post.user.username,
        text: post.text,
        image: post.image ? `http://localhost:5000${post.image}` : null,
        likesCount: post.likes.length,
        commentsCount: post.commentsCount || 0,
        likedByCurrentUser,
        isOwner: isOwner,
        createdAt: post.createdAt,
      };
    });

    res.json(postsWithLikeInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Explore alınamadı" });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    const userId = req.user._id.toString();

    const alreadyLiked = post.likes.some(
      (likedUserId) => likedUserId.toString() === userId,
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Like işlemi başarısız" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    const currentUserId = req.user.id || req.user._id;
    if (post.user.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Yetkin yok" });
    }

    if (post.image) {
      const imagePath = path.join(process.cwd(), post.image);
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(imagePath, (err) => {
            if (err) console.error("Resim dosyası silinirken hata:", err);
          });
        }
      });
    }

    const Comment = require("../models/Comment");
    await Comment.deleteMany({ post: post._id });

    await post.deleteOne();

    res.status(200).json({ message: "Post ve bağlı tüm yorumlar silindi" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: "Post silinemedi" });
  }
};

const getLikedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    const likedPosts = await Post.find({ likes: userId })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    const formattedPosts = likedPosts.map((post) => {
      return {
        _id: post._id,
        userId: post.user._id,
        username: post.user.username,
        profileImage: post.user.profileImage,
        text: post.text,
        image: post.image ? `http://localhost:5000${post.image}` : null,
        likesCount: post.likes.length,
        commentsCount: post.commentsCount || 0,
        likedByCurrentUser: currentUserId
          ? post.likes.some((id) => id.toString() === currentUserId)
          : false,
        isOwner: post.user._id.toString() === currentUserId,
        createdAt: post.createdAt,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: "Beğenilen postlar getirilemedi",
      error: error.message,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate(
      "user",
      "username profileImage",
    );

    if (!post) {
      console.log(`Hata: ${id} ID'li post veritabanında mevcut değil.`);
      return res.status(404).json({ message: "Gönderi bulunamadı" });
    }

    const currentUserId = req.user ? req.user.id || req.user._id : null;

    const postOwnerId = post.user?._id || post.userId;

    const formattedPost = {
      ...post._doc,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.commentsCount || 0,

      isOwner:
        currentUserId && postOwnerId
          ? postOwnerId.toString() === currentUserId.toString()
          : false,

      likedByCurrentUser:
        currentUserId && post.likes
          ? post.likes.some((l) => l.toString() === currentUserId.toString())
          : false,
    };

    return res.status(200).json(formattedPost);
  } catch (error) {
    console.error("Post getirme hatası (Server):", error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Geçersiz gönderi kimliği" });
    }
    return res.status(500).json({ message: "Sunucu hatası" });
  }
};

const getLikedContent = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    const likedPosts = await Post.find({ likes: userId })
      .populate("user", "username profileImage")
      .lean();

    const likedComments = await Comment.find({ likes: userId })
      .populate("user", "username profileImage")
      .lean();

    const formattedPosts = likedPosts.map((p) => {
      const likedByCurrentUser = p.likes.some(
        (id) => id.toString() === currentUserId,
      );
      const isOwner = p.user?._id?.toString() === currentUserId;

      return {
        _id: p._id,
        userId: p.user?._id,
        username: p.user?.username,
        profileImage: p.user?.profileImage,
        text: p.text,
        image: p.image ? `http://localhost:5000${p.image}` : null,
        likesCount: p.likes.length,
        commentsCount: p.commentsCount || 0,
        likedByCurrentUser: likedByCurrentUser,
        isOwner: isOwner,
        createdAt: p.createdAt,
        isComment: false,
      };
    });

    const formattedComments = likedComments.map((c) => {
      const likedByCurrentUser = c.likes.some(
        (id) => id.toString() === currentUserId,
      );
      const isOwner = c.user?._id?.toString() === currentUserId;

      return {
        _id: c._id,
        userId: c.user?._id,
        username: c.user?.username,
        profileImage: c.user?.profileImage,
        text: c.text,
        image: c.image ? `http://localhost:5000${c.image}` : null,
        likesCount: c.likes.length,
        repliesCount: 0,
        likedByCurrentUser: likedByCurrentUser,
        isOwner: isOwner,
        createdAt: c.createdAt,
        isComment: true,
      };
    });

    const allLiked = [...formattedPosts, ...formattedComments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json(allLiked);
  } catch (error) {
    console.error("getLikedContent Hatası:", error);
    res.status(500).json({ message: "Beğeniler getirilemedi" });
  }
};

module.exports = {
  createPost,
  getPosts,
  getExplore,
  likePost,
  deletePost,
  /*getLikedPosts,*/
  getPostById,
  getLikedContent,
};
