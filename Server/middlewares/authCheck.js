const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.authCheck = async (req, res, next) => {
  try {

    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    const token = headerToken.split(" ")[1];

    let decode;
    try {
      decode = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ message: "Invalid or Expired Token" });
    }

    req.user = decode;

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (!user.enabled) {
      return res.status(403).json({ message: "Access Denied: Account Disabled" });
    }

    next();
  } catch (err) {
    console.error("AuthCheck Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.adminCheck = async (req, res, next) => {
  try {
    // ตรวจสอบ Email ของผู้ใช้ที่ Login
    const { email } = req.user;
    const adminUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!adminUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (adminUser.role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admin Only" });
    }

    next();
  } catch (err) {
    console.error("AdminCheck Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};