const Collection = require("../models/Collection");
const Save = require("../models/Save");

const getCollections = async (req, res) => {
  try {
    const userId = req.user._id;

    const collections = await Collection.find({ user: userId }).sort(
      "-createdAt",
    );

    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error("Koleksiyon getirme hatası:", error);
    res
      .status(500)
      .json({ success: false, message: "Klasörler getirilemedi." });
  }
};

const createCollection = async (req, res) => {
  try {
    const nameData = req.body.name;

    const finalName = typeof nameData === "object" ? nameData.name : nameData;

    const userId = req.user._id;

    if (!finalName || typeof finalName !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Geçerli bir klasör ismi gerekli." });
    }

    const trimmedName = finalName.trim();

    const existing = await Collection.findOne({
      user: userId,
      name: trimmedName,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Bu isimde bir klasör zaten var." });
    }

    const collection = await Collection.create({
      name: trimmedName,
      user: userId,
    });

    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    console.error("DETAYLI HATA:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const collection = await Collection.findOne({ _id: id, user: userId });

    if (!collection) {
      return res
        .status(404)
        .json({ success: false, message: "Klasör bulunamadı." });
    }

    await Save.updateMany(
      { user: userId, collectionIds: id },
      { $pull: { collectionIds: id } },
    );

    await collection.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Klasör başarıyla silindi." });
  } catch (error) {
    console.error("Koleksiyon silme hatası:", error);
    res
      .status(500)
      .json({ success: false, message: "Klasör silinirken hata oluştu." });
  }
};

module.exports = {
  getCollections,
  createCollection,
  deleteCollection,
};
