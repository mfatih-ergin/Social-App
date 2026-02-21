const express = require("express");
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
  getCommentById,
  getReplies,
} = require("../controllers/comment.controller");
const { protect, optional } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.post("/:postId", protect, upload.single("image"), addComment);

router.get("/:postId", optional, getComments);

router.delete("/:id", protect, deleteComment);

router.get("/detail/:id", optional, getCommentById);
router.get("/replies/:id", optional, getReplies);

module.exports = router;
