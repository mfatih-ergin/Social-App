require("dotenv").config();
const express = require("express");
const cors = require("cors");

const path = require("path");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const postRoutes = require("./src/routes/post.routes");
const commentRoutes = require("./src/routes/comment.routes");
const userRoutes = require("./src/routes/user.routes");
const saveRoutes = require("./src/routes/save.routes");
const likeRoutes = require("./src/routes/like.routes");
const collectionRoutes = require("./src/routes/collection.routes");

const app = express();
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/saves", saveRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/collections", collectionRoutes);

app.get("/", (req, res) => {
  res.send("API ÇALIŞIYOR 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
