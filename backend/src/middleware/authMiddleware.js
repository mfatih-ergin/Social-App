const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select(
        "username email _id followers following",
      );

      if (!req.user) {
        return res.status(401).json({ message: "Kullanıcı bulunamadı" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token geçersiz" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Token yok, yetkisiz erişim" });
  }
};

const optional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select(
      "username email _id followers following",
    );

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = { protect, optional };
