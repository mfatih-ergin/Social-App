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
  updateUsername,
  updatePassword,
  deleteUser,
  getAllSuggestions,
  getUserSuggestions,
  searchUsers,
} = require("../controllers/user.controller");
const { protect, optional } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.get("/suggestions", protect, getUserSuggestions);
router.get("/connect", protect, getAllSuggestions);
router.get("/search", optional, searchUsers);

router.put(
  "/settings/profile",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateProfile,
);

router.put("/settings/update-username", protect, updateUsername);
router.put("/settings/update-password", protect, updatePassword);
router.put("/settings", protect, updateSettings);

router.get("/:id", protect, getUserProfile);
router.get("/:userId/userposts", protect, getUserPosts);

router.get("/:userId/followers", protect, getFollowers);
router.get("/:userId/following", protect, getFollowing);

router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);

router.delete("/:id/delete", protect, deleteUser);

module.exports = router;
