const Save = require("../models/Save");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like"); // Yeni Beğeni modelini ekledik

/**
 * İçeriği kaydet veya kaydı kaldır
 */
const toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user._id || req.user.id;

    const query = { user: userId };
    if (type === "comment") {
      query.comment = id;
    } else {
      query.post = id;
    }

    const existingSave = await Save.findOne(query);

    if (existingSave) {
      await Save.findByIdAndDelete(existingSave._id);
      return res.status(200).json({
        saved: false,
        message: "Kaydedilenlerden kaldırıldı",
      });
    } else {
      const newSave = new Save({
        user: userId,
        post: type === "post" ? id : null,
        comment: type === "comment" ? id : null,
      });
      await newSave.save();
      return res.status(201).json({
        saved: true,
        message: "Kaydedildi",
      });
    }
  } catch (error) {
    console.error("Save Toggle Hatası:", error);
    res.status(500).json({ message: "İşlem başarısız" });
  }
};

const getSavedContent = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // 1. Kontrol Set'lerini Hazırla (Like ve Repost durumları için)
    let myLikedIds = new Set();
    let repostedPostIds = new Set();
    let repostedCommentIds = new Set();

    const [userLikes, myReposts] = await Promise.all([
      Like.find({ user: userId }),
      Post.find({
        user: userId,
        isRepost: true,
        $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
      }).select("parentPost parentComment"),
    ]);

    userLikes.forEach((l) => {
      if (l.post) myLikedIds.add(l.post.toString());
      if (l.comment) myLikedIds.add(l.comment.toString());
    });

    myReposts.forEach((rp) => {
      if (rp.parentPost) repostedPostIds.add(rp.parentPost.toString());
      if (rp.parentComment) repostedCommentIds.add(rp.parentComment.toString());
    });

    // 2. Kaydedilen İçerikleri Getir
    const savedContent = await Save.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "post",
        populate: [
          { path: "user", select: "username profileImage" },
          {
            path: "parentPost",
            populate: { path: "user", select: "username profileImage" },
          },
          {
            path: "parentComment",
            populate: { path: "user", select: "username profileImage" },
          },
        ],
      })
      .populate({
        path: "comment",
        populate: { path: "user", select: "username profileImage" },
      })
      .lean();

    // 3. Verileri Formatla
    const formattedContent = savedContent
      .map((saveDoc) => {
        const isComment = !!saveDoc.comment;
        const item = isComment ? saveDoc.comment : saveDoc.post;

        if (!item) return null; // Silinmiş içerik kontrolü

        const itemIdStr = item._id.toString();
        const parent = item.parentPost || item.parentComment;
        const originalId = parent ? parent._id.toString() : itemIdStr;

        // Alıntı (Quote) Kontrolü
        const isQuote =
          item.isRepost && item.text && item.text.trim().length > 0;

        return {
          ...item,
          isComment,
          userId: item.user?._id,
          username: item.user?.username,
          profileImage: item.user?.profileImage,

          // BEĞENİ DURUMU (Senkronize)
          likesCount: item.likesCount || 0,
          likedByCurrentUser: isQuote
            ? myLikedIds.has(itemIdStr)
            : myLikedIds.has(itemIdStr) || myLikedIds.has(originalId),

          // KAYDETME DURUMU (Zaten kaydedilenlerdeyiz, o yüzden true)
          isSavedByMe: true,

          // REPOST DURUMU (KRİTİK EKSİK BURASIYDI)
          isRepostedByMe: item.parentComment
            ? repostedCommentIds.has(originalId)
            : repostedPostIds.has(originalId),

          image: item.image
            ? item.image.startsWith("http")
              ? item.image
              : `http://localhost:5000${item.image}`
            : null,

          isOwner: item.user?._id?.toString() === userId,
        };
      })
      .filter(Boolean);

    res.json(formattedContent);
  } catch (error) {
    console.error("getSavedContent Hatası:", error);
    res.status(500).json({ message: "Kaydedilen içerikler getirilemedi." });
  }
};

module.exports = { toggleSave, getSavedContent };
