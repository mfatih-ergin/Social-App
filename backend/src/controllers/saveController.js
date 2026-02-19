const Save = require("../models/Save");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user._id || req.user.id;

    // Dinamik sorgu oluşturma
    const query = { user: userId };
    if (type === "comment") {
      query.comment = id;
    } else {
      query.post = id;
    }

    const existingSave = await Save.findOne(query);

    if (existingSave) {
      await Save.findByIdAndDelete(existingSave._id);
      return res
        .status(200)
        .json({ saved: false, message: "Kaydedilenlerden kaldırıldı" });
    } else {
      const newSave = new Save({
        user: userId,
        post: type === "post" ? id : null,
        comment: type === "comment" ? id : null,
      });
      await newSave.save();
      return res.status(201).json({ saved: true, message: "Kaydedildi" });
    }
  } catch (error) {
    console.error("Save Toggle Hatası:", error);
    res.status(500).json({ message: "İşlem başarısız" });
  }
};

const getSavedContent = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const savedItems = await Save.find({ user: userId })
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
      .sort({ createdAt: -1 });

    const formattedSaves = savedItems.map((item) => {
      if (item.post) {
        const postObj = item.post._doc || item.post;
        return {
          ...item._doc,
          post: {
            ...postObj,
            likesCount: postObj.likes ? postObj.likes.length : 0,
            likedByCurrentUser: postObj.likes
              ? postObj.likes.some((id) => id.toString() === userId.toString())
              : false,
            isSavedByMe: true,
            image: postObj.image
              ? postObj.image.startsWith("http")
                ? postObj.image
                : `http://localhost:5000${postObj.image}`
              : null,
            isComment: false,
          },
        };
      }

      if (item.comment) {
        const commentObj = item.comment._doc || item.comment;
        return {
          ...item._doc,
          comment: {
            ...commentObj,
            likesCount: commentObj.likes ? commentObj.likes.length : 0,
            likedByCurrentUser: commentObj.likes
              ? commentObj.likes.some(
                  (id) => id.toString() === userId.toString(),
                )
              : false,
            isSavedByMe: true,
            isComment: true,
          },
        };
      }
      return item;
    });

    res.status(200).json(formattedSaves);
  } catch (error) {
    console.error("getSavedContent Hatası:", error);
    res.status(500).json({ message: "Kaydedilenler getirilemedi" });
  }
};

module.exports = { toggleSave, getSavedContent };
