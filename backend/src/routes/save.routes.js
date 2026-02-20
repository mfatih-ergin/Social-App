const express = require("express");
const router = express.Router();
const {
  toggleSave,
  getSavedContent,
} = require("../controllers/saveController");
const { protect } = require("../middleware/authMiddleware");

router.post("/toggle/:id", protect, toggleSave);

router.get("/", protect, getSavedContent);

module.exports = router;
