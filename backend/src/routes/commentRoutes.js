const express = require("express");
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
  likeComment,
  getCommentById,
  getReplies,
} = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.post("/:postId", authMiddleware, upload.single("image"), addComment);

router.get("/:postId", getComments);
router.delete("/:id", authMiddleware, deleteComment);
router.put("/:id/like", authMiddleware, likeComment);

router.get("/detail/:id", getCommentById);
router.get("/replies/:id", getReplies);

module.exports = router;
