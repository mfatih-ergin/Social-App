const express = require("express");
const router = express.Router();
const {
  toggleLike,
  getLikedContent,
} = require("../controllers/like.controller");
const { protect } = require("../middleware/authMiddleware");

router.post("/like", protect, toggleLike);

router.get("/user/:userId", protect, getLikedContent);

module.exports = router;
