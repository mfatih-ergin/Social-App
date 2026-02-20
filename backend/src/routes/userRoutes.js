const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  updateSettings,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:id", protect, getUserProfile);
router.get("/:userId/userposts", protect, getUserPosts);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.put("/settings", protect, updateSettings);
router.delete("/:id/delete", protect, deleteUser);

module.exports = router;
