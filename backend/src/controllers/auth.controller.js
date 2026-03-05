const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const formatUserUrls = (user) => {
  if (!user) return null;
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const formatUrl = (url) =>
    url && !url.startsWith("http")
      ? `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
      : url;

  return {
    ...user,
    profileImage: formatUrl(user.profileImage),
    banner: formatUrl(user.banner),
  };
};

const getFullUser = async (id) => {
  const user = await User.findById(id)
    .select("-password -followers -following")
    .lean();

  if (!user) return null;

  const userWithCounts = await User.findById(id)
    .select("followers following")
    .lean();

  const finalUser = {
    ...user,
    followersCount: userWithCounts.followers?.length || 0,
    followingCount: userWithCounts.following?.length || 0,
  };

  return formatUserUrls(finalUser);
};

const getMe = async (req, res) => {
  try {
    const user = await getFullUser(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Oturum doğrulanamadı" });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tüm alanlar zorunlu" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      const field = userExists.email === email ? "Email" : "Kullanıcı adı";
      return res.status(400).json({ message: `${field} zaten kullanımda.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const fullUser = await getFullUser(user._id);
    res.status(201).json({ token, user: fullUser });
  } catch (error) {
    console.error("REGISTER HATASI:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages[0] });
    }

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Kullanıcı adı veya email zaten mevcut." });
    }

    res.status(500).json({ message: "Kayıt sırasında sunucu hatası oluştu." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const fullUser = await getFullUser(user._id);
    res.json({ token, user: fullUser });
  } catch (error) {
    console.error("LOGIN HATASI:", error);
    res.status(500).json({ message: "Giriş yapılırken sunucu hatası oluştu." });
  }
};

module.exports = { register, login, getMe };
