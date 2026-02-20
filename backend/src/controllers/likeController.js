const Like = require("../models/Like");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Save = require("../models/Save");

const toggleLike = async (req, res) => {
  try {
    const { postId, commentId } = req.body;
    const userId = req.user._id;

    const isComment = !!commentId;
    const targetId = isComment ? commentId : postId;
    const Model = isComment ? Comment : Post;
    const query = isComment
      ? { user: userId, comment: commentId }
      : { user: userId, post: postId };

    if (!targetId) {
      return res.status(400).json({ message: "Hedef ID gerekli." });
    }

    const existingLike = await Like.findOne(query);

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      const updatedTarget = await Model.findByIdAndUpdate(
        targetId,
        { $inc: { likesCount: -1 } },
        { new: true },
      );

      return res.status(200).json({
        liked: false,
        likesCount: updatedTarget ? updatedTarget.likesCount : 0,
        isComment,
      });
    } else {
      const newLike = new Like({
        user: userId,
        post: isComment ? null : postId,
        comment: isComment ? commentId : null,
      });
      await newLike.save();
      const updatedTarget = await Model.findByIdAndUpdate(
        targetId,
        { $inc: { likesCount: 1 } },
        { new: true },
      );

      return res.status(201).json({
        liked: true,
        likesCount: updatedTarget ? updatedTarget.likesCount : 0,
        isComment,
      });
    }
  } catch (error) {
    console.error("toggleLike Hatası:", error);
    res.status(500).json({ message: "Beğeni işlemi sırasında hata oluştu." });
  }
};

const getLikedContent = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user
      ? (req.user._id || req.user.id).toString()
      : null;

    let savedPostIds = new Set();
    let savedCommentIds = new Set();
    let myLikes = new Set();
    let repostedPostIds = new Set();
    let repostedCommentIds = new Set();

    if (currentUserId) {
      const [userSaves, likesByMe, myReposts] = await Promise.all([
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
        if (s.comment) savedCommentIds.add(s.comment.toString());
      });

      likesByMe.forEach((l) => {
        if (l.post) myLikes.add(l.post.toString());
        if (l.comment) myLikes.add(l.comment.toString());
      });

      myReposts.forEach((rp) => {
        if (rp.parentPost) repostedPostIds.add(rp.parentPost.toString());
        if (rp.parentComment)
          repostedCommentIds.add(rp.parentComment.toString());
      });
    }

    const userLikes = await Like.find({ user: userId })
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
        populate: [
          { path: "user", select: "username profileImage" },
          {
            path: "post",
            select: "text image user",
            populate: { path: "user", select: "username" },
          },
        ],
      })
      .lean();

    const formattedContent = userLikes
      .map((likeDoc) => {
        const isComment = !!likeDoc.comment;
        const item = isComment ? likeDoc.comment : likeDoc.post;

        if (!item) return null;

        const itemIdStr = item._id.toString();
        const parent = item.parentPost || item.parentComment;
        const originalId = parent
          ? (parent._id || parent).toString()
          : itemIdStr;

        const isPlainRepost =
          item.isRepost && (!item.text || item.text.trim().length === 0);

        const isSelfRepost =
          isPlainRepost &&
          parent &&
          item.user._id.toString() === parent.user?._id?.toString();

        if (isSelfRepost) return null;

        const isQuote =
          item.isRepost && item.text && item.text.trim().length > 0;

        let formattedParent = null;
        if (parent && typeof parent === "object") {
          const pId = parent._id.toString();
          formattedParent = {
            ...parent,
            likesCount: parent.likesCount || 0,
            likedByCurrentUser: myLikes.has(pId),
            isSavedByMe: savedPostIds.has(pId) || savedCommentIds.has(pId),
            isRepostedByMe: item.parentComment
              ? repostedCommentIds.has(pId)
              : repostedPostIds.has(pId),
            image: parent.image
              ? parent.image.startsWith("http")
                ? parent.image
                : `http://localhost:5000${parent.image}`
              : null,
          };
        }

        return {
          ...item,
          isComment,
          userId: item.user?._id,
          username: item.user?.username,
          profileImage: item.user?.profileImage,
          likesCount: item.likesCount || 0,

          likedByCurrentUser: isQuote
            ? myLikes.has(itemIdStr)
            : myLikes.has(itemIdStr) || myLikes.has(originalId),

          isSavedByMe: isComment
            ? savedCommentIds.has(itemIdStr)
            : savedPostIds.has(itemIdStr),
          isRepostedByMe: isComment
            ? repostedCommentIds.has(itemIdStr)
            : repostedPostIds.has(itemIdStr),

          parentPost: item.parentPost ? formattedParent : null,
          parentComment: item.parentComment ? formattedParent : null,

          image: item.image
            ? item.image.startsWith("http")
              ? item.image
              : `http://localhost:5000${item.image}`
            : null,

          isOwner: item.user?._id?.toString() === currentUserId,
        };
      })
      .filter(Boolean);

    res.json(formattedContent);
  } catch (error) {
    console.error("getLikedContent Hatası:", error);
    res.status(500).json({ message: "İçerikler getirilemedi." });
  }
};

module.exports = { toggleLike, getLikedContent };
