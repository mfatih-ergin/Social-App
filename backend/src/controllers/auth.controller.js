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
    .select("-password")
    .populate("followers", "username profileImage")
    .populate("following", "username profileImage")
    .lean();

  return formatUserUrls(user);
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
      return res.status(400).json({ message: "Kullanıcı zaten mevcut" });
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
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Geçersiz bilgiler" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const fullUser = await getFullUser(user._id);
    res.json({ token, user: fullUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getMe };
