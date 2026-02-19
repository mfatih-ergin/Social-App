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

    const postsWithLikeInfo = posts.map((post) => {
      const likedByCurrentUser = userId
        ? post.likes.some((id) => id.toString() === userId)
        : false;
      const isOwner = userId ? post.user._id.toString() === userId : false;

      let formattedParent = null;
      const parentSource = post.parentPost || post.parentComment;

      if (parentSource) {
        formattedParent = {
          ...(parentSource._doc || parentSource),
          likesCount: parentSource.likes ? parentSource.likes.length : 0,
          likedByCurrentUser:
            userId && parentSource.likes
              ? parentSource.likes.some((id) => id.toString() === userId)
              : false,
          image: parentSource.image
            ? parentSource.image.startsWith("http")
              ? parentSource.image
              : `http://localhost:5000${parentSource.image}`
            : null,
        };
      }

      return {
        _id: post._id,
        userId: post.user?._id,
        username: post.user?.username,
        profileImage: post.user?.profileImage,
        text: post.text,
        image: post.image ? `http://localhost:5000${post.image}` : null,
        likesCount: post.likes.length,
        commentsCount: post.commentsCount || 0,
        repostsCount: post.repostsCount || 0,
        isRepost: post.isRepost || false,
        parentPost: post.parentPost ? formattedParent : null,
        parentComment: post.parentComment ? formattedParent : null,

        likedByCurrentUser,
        isOwner: isOwner,
        createdAt: post.createdAt,
      };
    });

    res.json(postsWithLikeInfo);
  } catch (error) {
    console.error("getPosts Hatası:", error);
    res.status(500).json({ message: "Postlar alınamadı" });
  }
};

const getExplore = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();

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

    const postsWithLikeInfo = posts.map((post) => {
      const likedByCurrentUser = userId
        ? post.likes.some((id) => id.toString() === userId)
        : false;

      const isOwner = userId ? post.user._id.toString() === userId : false;

      return {
        _id: post._id,
        userId: post.user._id,
        username: post.user.username,
        profileImage: post.user.profileImage,
        text: post.text,
        image: post.image ? `http://localhost:5000${post.image}` : null,
        likesCount: post.likes.length,
        commentsCount: post.commentsCount || 0,
        repostsCount: post.repostsCount || 0,
        isRepost: post.isRepost || false,
        parentPost: post.parentPost || null,
        parentComment: post.parentComment || null,
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
    const { id } = req.params;
    const userId = req.user._id.toString();

    let target = await Post.findById(id);
    let isComment = false;

    if (!target) {
      target = await Comment.findById(id);
      isComment = true;
    }

    if (!target) {
      return res.status(404).json({ message: "İçerik bulunamadı" });
    }

    const alreadyLiked = target.likes.some(
      (likedUserId) => likedUserId.toString() === userId,
    );

    if (alreadyLiked) {
      target.likes = target.likes.filter((id) => id.toString() !== userId);
    } else {
      target.likes.push(userId);
    }

    await target.save();

    res.json({
      likesCount: target.likes.length,
      liked: !alreadyLiked,
      isComment,
    });
  } catch (error) {
    console.error("LIKE HATASI:", error);
    res.status(500).json({ message: "Beğeni işlemi başarısız" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    const currentUserId = req.user._id || req.user.id;
    if (post.user.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }

    if (post.isRepost) {
      if (post.parentPost) {
        await Post.findByIdAndUpdate(post.parentPost, {
          $inc: { repostsCount: -1 },
        });
      } else if (post.parentComment) {
        await Comment.findByIdAndUpdate(post.parentComment, {
          $inc: { repostsCount: -1 },
        });
      }
    }

    if (post.image) {
      const isUsedElsewhereInPosts = await Post.findOne({
        image: post.image,
        _id: { $ne: post._id },
      });
      const isUsedInComments = await Comment.findOne({ image: post.image });

      if (!isUsedElsewhereInPosts && !isUsedInComments) {
        const relativePath = post.image.startsWith("/")
          ? post.image.slice(1)
          : post.image;
        const fullPath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            console.log(
              "Dosya başka yerde kullanılmadığı için sistemden silindi:",
              fullPath,
            );
          } catch (err) {
            console.error("Dosya silme hatası:", err);
          }
        }
      } else {
        console.log(
          "Dosya orijinal postta veya başka bir yerde kullanılıyor, fiziksel silme atlandı.",
        );
      }
    }

    await Comment.deleteMany({ post: post._id });

    await post.deleteOne();

    res.status(200).json({ message: "Post başarıyla silindi." });
  } catch (error) {
    console.error("Silme işlemi sırasında hata:", error);
    res.status(500).json({ message: "Sunucu hatası: Post silinemedi." });
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

    if (!post) {
      console.log(`Hata: ${id} ID'li içerik Post koleksiyonunda yok.`);
      return res.status(404).json({ message: "Gönderi bulunamadı" });
    }

    const currentUserId = req.user ? req.user.id || req.user._id : null;
    const postOwnerId = post.user?._id || post.userId;

    const formattedImage = post.image
      ? post.image.startsWith("http")
        ? post.image
        : `http://localhost:5000${post.image}`
      : null;

    const formattedPost = {
      ...post._doc,
      image: formattedImage,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.commentsCount || 0,
      repostsCount: post.repostsCount || 0,

      isOwner:
        currentUserId && postOwnerId
          ? postOwnerId.toString() === currentUserId.toString()
          : false,

      likedByCurrentUser:
        currentUserId && post.likes
          ? post.likes.some((l) => l.toString() === currentUserId.toString())
          : false,
    };

    if (
      formattedPost.parentPost &&
      formattedPost.parentPost.image &&
      !formattedPost.parentPost.image.startsWith("http")
    ) {
      formattedPost.parentPost.image = `http://localhost:5000${formattedPost.parentPost.image}`;
    }
    if (
      formattedPost.parentComment &&
      formattedPost.parentComment.image &&
      !formattedPost.parentComment.image.startsWith("http")
    ) {
      formattedPost.parentComment.image = `http://localhost:5000${formattedPost.parentComment.image}`;
    }

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
      .populate({
        path: "parentPost",
        populate: { path: "user", select: "username profileImage" },
      })
      .populate({
        path: "parentComment",
        populate: { path: "user", select: "username profileImage" },
      })
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
        repostsCount: p.repostsCount || 0,
        isRepost: p.isRepost || false,
        parentPost: p.parentPost || null,
        parentComment: p.parentComment || null,
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

const repostContent = async (req, res) => {
  try {
    const { id } = req.params;

    const text = req.body?.text || "";
    const type = req.body?.type || "post";
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const userId = req.user._id || req.user.id;

    const newRepost = new Post({
      user: userId,
      text: text,
      image: imagePath,
      isRepost: true,
    });

    if (type === "post") {
      const originalPost = await Post.findById(id);
      if (!originalPost)
        return res.status(404).json({ message: "Post bulunamadı" });

      newRepost.parentPost = id;
      await Post.findByIdAndUpdate(id, { $inc: { repostsCount: 1 } });
    } else if (type === "comment") {
      const originalComment = await Comment.findById(id);
      if (!originalComment)
        return res.status(404).json({ message: "Yorum bulunamadı" });

      newRepost.parentComment = id;
      await Comment.findByIdAndUpdate(id, { $inc: { repostsCount: 1 } });
    }

    await newRepost.save();

    const populated = await newRepost.populate([
      { path: "user", select: "username profileImage" },
      {
        path: "parentPost",
        populate: { path: "user", select: "username profileImage" },
      },
      {
        path: "parentComment",
        populate: { path: "user", select: "username profileImage" },
      },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    console.error("REPOST HATASI:", error);
    res.status(500).json({ message: error.message });
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
  repostContent,
};
