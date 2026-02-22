const User = require("../models/User");
const Post = require("../models/Post");
const Save = require("../models/Save");
const Like = require("../models/Like");
const path = require("path");
const fs = require("fs");

const getUserProfile = async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username profileImage")
      .populate("following", "username profileImage")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const formatImageUrl = (url) => {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    user.profileImage = formatImageUrl(user.profileImage);
    user.banner = formatImageUrl(user.banner);

    if (user.followers) {
      user.followers = user.followers.map((f) => ({
        ...f,
        profileImage: formatImageUrl(f.profileImage),
      }));
    }

    res.json(user);
  } catch (error) {
    console.error("getUserProfile Hatası:", error);
    res
      .status(500)
      .json({ message: "Profil bilgileri getirilirken hata oluştu." });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, birthday } = req.body;
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    let updateFields = { username, bio, birthday };

    const cleanupOldFile = (oldUrl, newFileName) => {
      if (oldUrl && oldUrl.includes("/uploads/")) {
        const oldFileNameWithQuery = oldUrl.split("/").pop();
        const oldFileName = oldFileNameWithQuery.split("?")[0];

        if (oldFileName !== newFileName) {
          const filePath = path.join(__dirname, "../../uploads", oldFileName);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (err) {
              console.error("Eski dosya silinirken hata:", err);
            }
          }
        }
      }
    };

    if (req.files) {
      if (req.files.profileImage) {
        const newFileName = req.files.profileImage[0].filename;
        cleanupOldFile(user.profileImage, newFileName);
        // ?v= ekleyerek tarayıcıyı cache'i yenilemeye zorluyoruz
        updateFields.profileImage = `${baseUrl}/uploads/${newFileName}?v=${Date.now()}`;
      }

      if (req.files.banner) {
        const newFileName = req.files.banner[0].filename;
        cleanupOldFile(user.banner, newFileName);
        updateFields.banner = `${baseUrl}/uploads/${newFileName}?v=${Date.now()}`;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .select("-password")
      .populate("followers", "username profileImage")
      .populate("following", "username profileImage");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Bu kullanıcı adı zaten alınmış. Lütfen farklı bir tane deneyin.",
      });
    }

    res.status(500).json({
      message: "Profil güncellenirken sunucu tarafında bir hata oluştu.",
    });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user
      ? (req.user._id || req.user.id).toString()
      : null;

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    let savedPostIds = new Set();
    let myLikedIds = new Set();
    let repostedPostIds = new Set();
    let repostedCommentIds = new Set();

    if (currentUserId) {
      const [userSaves, userLikes, myReposts] = await Promise.all([
        Save.find({ user: currentUserId }),
        Like.find({ user: currentUserId }),
        Post.find({
          user: currentUserId,
          isRepost: true,
          $or: [{ text: "" }, { text: null }, { text: { $exists: false } }],
        }).select("parentPost parentComment"),
      ]);

      userSaves.forEach((s) => {
        if (s.post) savedPostIds.add(s.post.toString());
        if (s.comment) savedPostIds.add(s.comment.toString());
      });

      userLikes.forEach((l) => {
        if (l.post) myLikedIds.add(l.post.toString());
        if (l.comment) myLikedIds.add(l.comment.toString());
      });

      myReposts.forEach((rp) => {
        if (rp.parentPost) repostedPostIds.add(rp.parentPost.toString());
        if (rp.parentComment)
          repostedCommentIds.add(rp.parentComment.toString());
      });
    }

    const posts = await Post.find({ user: userId })
      .populate("user", "username profileImage")
      .populate({
        path: "parentPost",
        populate: { path: "user", select: "username profileImage" },
      })
      .populate({
        path: "parentComment",
        populate: { path: "user", select: "username profileImage" },
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map((post) => {
      const pIdStr = post._id.toString();
      const isQuote = post.isRepost && post.text && post.text.trim().length > 0;
      const parent = post.parentPost || post.parentComment;
      const originalContentId = parent ? parent._id.toString() : pIdStr;

      let formattedParent = null;
      if (parent) {
        const parentId = parent._id.toString();

        let parentImageUrl = null;
        if (parent.image) {
          parentImageUrl = parent.image.startsWith("http")
            ? parent.image
            : `${baseUrl}${parent.image.startsWith("/") ? "" : "/"}${parent.image}`;
        }

        formattedParent = {
          ...parent,
          likesCount: parent.likesCount || 0,
          likedByCurrentUser: myLikedIds.has(parentId),
          isSavedByMe: savedPostIds.has(parentId),
          isRepostedByMe: post.parentComment
            ? repostedCommentIds.has(parentId)
            : repostedPostIds.has(parentId),
          image: parentImageUrl,
        };
      }

      const isLiked = isQuote
        ? myLikedIds.has(pIdStr)
        : myLikedIds.has(pIdStr) || myLikedIds.has(originalContentId);

      let postImageUrl = null;
      if (post.image) {
        postImageUrl = post.image.startsWith("http")
          ? post.image
          : `${baseUrl}${post.image.startsWith("/") ? "" : "/"}${post.image}`;
      }

      return {
        ...post,
        userId: post.user?._id,
        username: post.user?.username,
        profileImage: post.user?.profileImage,
        likesCount: post.likesCount || 0,
        likedByCurrentUser: isLiked,
        isSavedByMe: isQuote
          ? savedPostIds.has(pIdStr)
          : savedPostIds.has(pIdStr) || savedPostIds.has(originalContentId),
        isRepostedByMe: post.parentComment
          ? repostedCommentIds.has(originalContentId)
          : repostedPostIds.has(originalContentId),
        isOwner: currentUserId
          ? post.user?._id?.toString() === currentUserId
          : false,
        image: postImageUrl,
        parentPost: post.parentPost ? formattedParent : null,
        parentComment: post.parentComment ? formattedParent : null,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("getUserPosts Hatası:", error);
    res.status(500).json({ message: "Postlar yüklenirken bir hata oluştu." });
  }
};

const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Kendini takip edemezsin" });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      currentUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(currentUser._id);
    } else {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? "Takipten çıkıldı" : "Takip edildi",
    });
  } catch (error) {
    console.error("FOLLOW ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Kendini takipten çıkamazsın" });
    }

    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
    });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id },
    });

    res.json({ message: "Takip bırakıldı" });
  } catch (error) {
    console.error("UNFOLLOW ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!theme || !["light", "dark"].includes(theme)) {
      return res
        .status(400)
        .json({ message: "Geçersiz veya eksik tema seçimi" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { "settings.theme": theme } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(updatedUser.settings);
  } catch (error) {
    console.error("Ayarlar Güncelleme Hatası:", error);
    res
      .status(500)
      .json({ message: "Ayarlar güncellenirken sunucu hatası oluştu" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    await User.findByIdAndDelete(userId);
    await Post.deleteMany({ user: userId });

    res.json({ message: "Kullanıcı ve tüm gönderileri silindi" });
  } catch (error) {
    console.error("Kullanıcı Silme Hatası:", error);
    res
      .status(500)
      .json({ message: "Kullanıcı silinirken sunucu hatası oluştu" });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  updateSettings,
  deleteUser,
};
