const User = require("../models/User");
const Post = require("../models/Post");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username profileImage")
      .populate("following", "username profileImage");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

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
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => {
      const formattedImage = post.image
        ? post.image.startsWith("http")
          ? post.image
          : `http://localhost:5000${post.image}`
        : null;

      if (
        post.parentPost &&
        post.parentPost.image &&
        !post.parentPost.image.startsWith("http")
      ) {
        post.parentPost.image = `http://localhost:5000${post.parentPost.image}`;
      }
      if (
        post.parentComment &&
        post.parentComment.image &&
        !post.parentComment.image.startsWith("http")
      ) {
        post.parentComment.image = `http://localhost:5000${post.parentComment.image}`;
      }

      return {
        _id: post._id,
        userId: post.user?._id,
        username: post.user?.username,
        profileImage: post.user?.profileImage,
        text: post.text,
        image: formattedImage,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.commentsCount || 0,
        repostsCount: post.repostsCount || 0,
        isRepost: post.isRepost || false,
        parentPost: post.parentPost || null,
        parentComment: post.parentComment || null,
        likedByCurrentUser: post.likes.some(
          (id) => id.toString() === currentUserId,
        ),
        isOwner: post.user?._id.toString() === currentUserId,
        createdAt: post.createdAt,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("getUserPosts Hatası:", error);
    res.status(500).json({ message: "Kullanıcı postları getirilemedi" });
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
  getUserPosts,
  followUser,
  unfollowUser,
  updateSettings,
  deleteUser,
};
