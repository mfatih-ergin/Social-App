const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Save = require("../models/Save");
const fs = require("fs");
const path = require("path");

const formatPostData = async (post, userId, savedPostIds, savedCommentIds) => {
  const postObj = post._doc || post;
  const pIdStr = postObj._id.toString();

  // 1. MANTIK: Eğer bu postun kendisi zaten bir REPOST ise ve sahibi BEN SEM, bu zaten "repostlanmış" demektir.
  const isMyDirectRepost =
    postObj.isRepost &&
    userId &&
    postObj.user?._id?.toString() === userId &&
    !postObj.text; // Alıntı değilse

  let isRepostedByMe = false;

  if (isMyDirectRepost) {
    isRepostedByMe = true;
  } else if (userId) {
    // 2. MANTIK: Eğer orijinal bir post/yorum ise, ben bunu repostladım mı?
    const repostExists = await Post.findOne({
      user: userId,
      isRepost: true,
      text: "", // Düz repost kontrolü
      image: "",
      $or: [{ parentPost: pIdStr }, { parentComment: pIdStr }],
    });
    isRepostedByMe = !!repostExists;
  }

  const likedByCurrentUser =
    userId && postObj.likes
      ? postObj.likes.some((id) => id.toString() === userId)
      : false;

  const isOwner =
    userId && postObj.user?._id
      ? postObj.user?._id?.toString() === userId
      : false;
  const isSavedByMe = savedPostIds.has(pIdStr);

  // Alıntılanan içerik (Parent) işleme
  let formattedParent = null;
  const parentSource = postObj.parentPost || postObj.parentComment;

  if (parentSource) {
    const parentIdStr = parentSource._id.toString();
    const parentSavedByMe = postObj.parentPost
      ? savedPostIds.has(parentIdStr)
      : savedCommentIds.has(parentIdStr);

    formattedParent = {
      ...(parentSource._doc || parentSource),
      likesCount: parentSource.likes ? parentSource.likes.length : 0,
      likedByCurrentUser:
        userId && parentSource.likes
          ? parentSource.likes.some((id) => id.toString() === userId)
          : false,
      isSavedByMe: parentSavedByMe,
      image: parentSource.image
        ? parentSource.image.startsWith("http")
          ? parentSource.image
          : `http://localhost:5000${parentSource.image}`
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
    likesCount: postObj.likes ? postObj.likes.length : 0,
    commentsCount: postObj.commentsCount || 0,
    repostsCount: postObj.repostsCount || 0,
    isRepost: postObj.isRepost || false,
    isRepostedByMe: isRepostedByMe, // Artık hem orijinalde hem repost sayfasında true döner
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

    // Her post için asenkron hesaplama yapıyoruz
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

    // Postu bulalım
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Yetki kontrolü
    const currentUserId = req.user._id || req.user.id;
    if (post.user.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }

    const postComments = await Comment.find({ post: post._id });

    for (const comment of postComments) {
      if (comment.image) {
        const isUsedElsewhere = await Comment.findOne({
          image: comment.image,
          _id: { $ne: comment._id },
        });
        const isUsedInPosts = await Post.findOne({ image: comment.image });

        if (!isUsedElsewhere && !isUsedInPosts) {
          const commentImagePath = path.join(
            process.cwd(),
            comment.image.startsWith("/")
              ? comment.image.slice(1)
              : comment.image,
          );
          if (fs.existsSync(commentImagePath)) {
            try {
              fs.unlinkSync(commentImagePath);
            } catch (err) {
              console.error("Yorum resmi silinirken hata:", err);
            }
          }
        }
      }
    }

    // Yorum dökümanlarını sil
    await Comment.deleteMany({ post: post._id });

    // Postun kendi resmini sil
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
          } catch (err) {
            console.error("Post dosyası silme hatası:", err);
          }
        }
      }
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      message: "Post ve bağlı tüm içerikler başarıyla silindi.",
    });
  } catch (error) {
    console.error("Silme işlemi sırasında hata:", error);
    res.status(500).json({ message: "Sunucu hatası: İşlem tamamlanamadı." });
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

const getLikedContent = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user._id.toString() : null;

    let savedPostIds = new Set();
    let savedCommentIds = new Set();
    if (currentUserId) {
      const userSaves = await Save.find({ user: currentUserId });
      savedPostIds = new Set(userSaves.map((s) => s.post?.toString()));
      savedCommentIds = new Set(userSaves.map((s) => s.comment?.toString()));
    }

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

    const formatItem = (item, isCommentType) => {
      let formattedParent = null;
      const parentSource = item.parentPost || item.parentComment;

      if (parentSource) {
        formattedParent = {
          ...parentSource,
          likesCount: parentSource.likes ? parentSource.likes.length : 0,
          likedByCurrentUser:
            currentUserId && parentSource.likes
              ? parentSource.likes.some((id) => id.toString() === currentUserId)
              : false,
          isSavedByMe: item.parentPost
            ? savedPostIds.has(parentSource._id.toString())
            : savedCommentIds.has(parentSource._id.toString()),
          image: parentSource.image
            ? parentSource.image.startsWith("http")
              ? parentSource.image
              : `http://localhost:5000${parentSource.image}`
            : null,
        };
      }

      return {
        ...item,
        userId: item.user?._id,
        username: item.user?.username,
        profileImage: item.user?.profileImage,
        likesCount: item.likes ? item.likes.length : 0,
        likedByCurrentUser: currentUserId
          ? item.likes.some((id) => id.toString() === currentUserId)
          : false,
        isSavedByMe: isCommentType
          ? savedCommentIds.has(item._id.toString())
          : savedPostIds.has(item._id.toString()),
        isComment: isCommentType,
        image: item.image
          ? item.image.startsWith("http")
            ? item.image
            : `http://localhost:5000${item.image}`
          : null,
        parentPost: item.parentPost ? formattedParent : null,
        parentComment: item.parentComment ? formattedParent : null,
      };
    };

    const formattedPosts = likedPosts.map((p) => formatItem(p, false));
    const formattedComments = likedComments.map((c) => formatItem(c, true));

    const allLiked = [...formattedPosts, ...formattedComments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json(allLiked);
  } catch (error) {
    console.error("getLikedContent Hatası:", error);
    res.status(500).json({ message: "Beğenilen içerikler getirilemedi" });
  }
};

const repostContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Frontend'den FormData veya JSON olarak gelen verileri alıyoruz
    const text = req.body?.text || "";
    // Type bilgisi gelmezse varsayılan 'post' kabul edilir
    const type = req.body?.type || "post";
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
    const userId = req.user._id || req.user.id;

    // --- 1. TOGGLE MANTIĞI (Geri Alma) ---
    // Sadece düz repostlar (metin ve resim içermeyen) toggle edilebilir
    if (!text.trim() && !imagePath) {
      const query = {
        user: userId,
        isRepost: true,
        text: "",
        image: "",
        // Dinamik alan belirleme: parentPost veya parentComment
        [type === "post" ? "parentPost" : "parentComment"]: id,
      };

      const existingRepost = await Post.findOne(query);

      if (existingRepost) {
        // findByIdAndDelete tetiklendiğinde Post.js modelindeki middleware sayacı düşürür.
        await Post.findByIdAndDelete(existingRepost._id);

        return res.status(200).json({
          action: "unrepost",
          message: "Repost başarıyla geri alındı.",
        });
      }
    }

    // --- 2. YENİ REPOST / ALINTILA OLUŞTURMA ---
    const newRepost = new Post({
      user: userId,
      text: text,
      image: imagePath,
      isRepost: true,
    });

    if (type === "post") {
      const originalPost = await Post.findById(id);
      if (!originalPost) {
        return res.status(404).json({ message: "Orijinal post bulunamadı" });
      }

      newRepost.parentPost = id;
      // Sayaç artırma (Modelde pre-save hook yoksa manuel devam)
      await Post.findByIdAndUpdate(id, { $inc: { repostsCount: 1 } });
    } else {
      // type === "comment" durumu
      const originalComment = await Comment.findById(id);
      if (!originalComment) {
        return res.status(404).json({ message: "Orijinal yorum bulunamadı" });
      }

      newRepost.parentComment = id;
      await Comment.findByIdAndUpdate(id, { $inc: { repostsCount: 1 } });
    }

    await newRepost.save();

    // Veriyi populate ederek frontend'in beklediği formatta hazırlıyoruz
    const populated = await Post.findById(newRepost._id).populate([
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

    res.status(201).json({
      ...(populated._doc || populated.toObject()),
      action: "repost",
    });
  } catch (error) {
    console.error("Repost Hatası Detay:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getExplore,
  likePost,
  deletePost,
  getPostById,
  getLikedContent,
  repostContent,
};
