const Save = require("../models/Save");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const Collection = require("../models/Collection");
const mongoose = require("mongoose");

const toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, collectionIds } = req.body;
    const userId = req.user._id || req.user.id;

    const query = { user: userId };
    if (type === "comment") {
      query.comment = id;
    } else {
      query.post = id;
    }

    let existingSave = await Save.findOne(query);

    if (!collectionIds || collectionIds.length === 0) {
      if (existingSave) {
        await Save.findByIdAndDelete(existingSave._id);
      }
      return res.status(200).json({ saved: false, message: "Kaldırıldı" });
    }

    const finalIds = collectionIds
      .map((cid) => {
        if (cid === null || cid === "null") return null;
        if (mongoose.Types.ObjectId.isValid(cid)) {
          return new mongoose.Types.ObjectId(cid);
        }
        return null;
      })
      .filter((val, index, self) => self.indexOf(val) === index);

    if (existingSave) {
      existingSave.collectionIds = finalIds;
      existingSave.markModified("collectionIds");
      await existingSave.save();

      return res.status(200).json({
        saved: true,
        data: existingSave,
        message: "Güncellendi",
      });
    } else {
      const newSave = await Save.create({
        user: userId,
        post: type === "post" ? id : null,
        comment: type === "comment" ? id : null,
        collectionIds: finalIds,
      });

      return res.status(201).json({
        saved: true,
        data: newSave,
        message: "Kaydedildi",
      });
    }
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({ message: "Hata oluştu" });
  }
};

const getSavedContent = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { collectionName } = req.query;

    let saveQuery = { user: userId };

    if (collectionName) {
      if (collectionName === "Tümü") {
        saveQuery.collectionIds = { $in: [null] };
      } else {
        const folder = await Collection.findOne({
          user: userId,
          name: collectionName.trim(),
        });

        if (folder) {
          saveQuery.collectionIds = { $in: [folder._id] };
        } else {
          return res.json([]);
        }
      }
    }

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

    const savedContent = await Save.find(saveQuery)
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

    const formattedContent = savedContent
      .map((saveDoc) => {
        const isComment = !!saveDoc.comment;
        const item = isComment ? saveDoc.comment : saveDoc.post;
        if (!item) return null;

        const itemIdStr = item._id.toString();
        const parent = item.parentPost || item.parentComment;
        const originalId = parent ? parent._id.toString() : itemIdStr;
        const isQuote =
          item.isRepost && item.text && item.text.trim().length > 0;

        return {
          ...item,
          isComment,
          userId: item.user?._id,
          username: item.user?.username,
          profileImage: item.user?.profileImage,
          likesCount: item.likesCount || 0,
          likedByCurrentUser: isQuote
            ? myLikedIds.has(itemIdStr)
            : myLikedIds.has(itemIdStr) || myLikedIds.has(originalId),
          isSavedByMe:
            saveDoc.collectionIds && saveDoc.collectionIds.length > 0,
          collectionIds: saveDoc.collectionIds || [],
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
