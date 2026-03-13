const express = require("express");
const router = express.Router();
const {
  createPost,
  updatePost,
  getHomePosts,
  getExplorePosts,
  deletePost,
  getPostById,
  repostContent,
} = require("../controllers/post.controller");
const { protect, optional } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.get("/", protect, getHomePosts);
router.get("/home", protect, getHomePosts);
router.get("/explore", optional, getExplorePosts);

router.post("/create", protect, upload.single("image"), createPost);
router.post("/repost/:id", protect, upload.single("image"), repostContent);

router.put("/:id", protect, upload.single("image"), updatePost);
router.delete("/delete/:id", protect, deletePost);

router.get("/:id", optional, getPostById);

module.exports = router;
