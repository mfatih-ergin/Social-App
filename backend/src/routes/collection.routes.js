const express = require("express");
const router = express.Router();
const {
  getCollections,
  createCollection,
  deleteCollection,
} = require("../controllers/collection.controller");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getCollections);
router.post("/", protect, createCollection);
router.delete("/:id", protect, deleteCollection);

module.exports = router;
