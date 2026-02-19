const express = require("express");
const router = express.Router();
const {
  toggleSave,
  getSavedContent,
} = require("../controllers/saveController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/toggle/:id", authMiddleware, toggleSave);

router.get("/", authMiddleware, getSavedContent);

module.exports = router;
