const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getFollowers,
  getFollowing,
  updateProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  updateSettings,
  deleteUser,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.get("/:id", protect, getUserProfile);
router.get("/:userId/userposts", protect, getUserPosts);

router.get("/:userId/followers", protect, getFollowers);
router.get("/:userId/following", protect, getFollowing);

router.put(
  "/settings/profile",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateProfile,
);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.put("/settings", protect, updateSettings);
router.delete("/:id/delete", protect, deleteUser);

module.exports = router;
