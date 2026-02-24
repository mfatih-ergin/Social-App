const express = require("express");
const router = express.Router();
const {
  createPost,
  updatePost,
  getPosts,
  getExplore,
  deletePost,
  getPostById,
  repostContent,
} = require("../controllers/post.controller");
const { protect, optional } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.get("/", protect, getPosts);
router.get("/home", protect, getPosts);
router.get("/explore", optional, getExplore);

router.post("/create", protect, upload.single("image"), createPost);
router.post("/repost/:id", protect, upload.single("image"), repostContent);

router.put("/:id", protect, upload.single("image"), updatePost);
router.delete("/delete/:id", protect, deletePost);

router.get("/:id", optional, getPostById);

module.exports = router;
