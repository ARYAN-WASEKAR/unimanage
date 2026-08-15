import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { connectDB } from "../config/db.js";
import { SuperAdmin } from "../models/SuperAdmin.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "superadmin_secret_key_unimanage_2026";

// Global in-memory fallback store if MongoDB service is offline
export const memorySuperAdmins = [
  {
    id: "sa-fb-1",
    _id: "sa-fb-1",
    name: "Super Admin",
    email: "admin@unimanage.app",
    username: "superadmin",
    passwordRaw: "adminpass",
    passwordHash: "$2a$10$Z1O5vT...adminpass",
    role: "SUPER_ADMIN",
    status: "active",
    phone: "+1 800-555-0199",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFallback: true,
  },
];

/**
 * @route   POST /api/auth/login (and /api/superadmin/login)
 * @desc    Authenticate SuperAdmin & get token
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Username (or Email) and Password are required.",
    });
  }

  const queryStr = String(username).toLowerCase().trim();

  // Try MongoDB first
  try {
    const conn = await connectDB();
    if (conn) {
      const admin = await SuperAdmin.findOne({
        $or: [{ username: queryStr }, { email: queryStr }],
      }).select("+password");

      if (admin) {
        if (admin.status === "inactive") {
          return res.status(403).json({
            success: false,
            error: "Account is inactive. Access disabled.",
          });
        }

        const isMatch = await admin.comparePassword(String(password));
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            error: "Invalid username/email or password.",
          });
        }

        const token = jwt.sign(
          { id: admin._id, username: admin.username, role: admin.role },
          JWT_SECRET,
          { expiresIn: "7d" },
        );

        return res.json({
          success: true,
          message: "SuperAdmin login successful (MongoDB)!",
          token,
          user: admin.toJSON(),
        });
      }
    }
  } catch (err) {
    console.warn("[Auth Login] MongoDB connection error, checking memory store...");
  }

  // Fallback to memory store
  const fbAdmin = memorySuperAdmins.find(
    (a) => a.username === queryStr || a.email === queryStr,
  );

  if (!fbAdmin) {
    return res.status(401).json({
      success: false,
      error: "Invalid username/email or password.",
    });
  }

  if (fbAdmin.status === "inactive") {
    return res.status(403).json({
      success: false,
      error: "Account is inactive. Access disabled.",
    });
  }

  const isFbMatch =
    password === fbAdmin.passwordRaw ||
    (await bcrypt.compare(String(password), fbAdmin.passwordHash).catch(() => false));

  if (!isFbMatch) {
    return res.status(401).json({
      success: false,
      error: "Invalid username/email or password.",
    });
  }

  const token = jwt.sign(
    { id: fbAdmin.id, username: fbAdmin.username, role: fbAdmin.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  const { passwordHash, passwordRaw, ...safeUser } = fbAdmin;
  return res.json({
    success: true,
    message: "SuperAdmin login successful (Demo Mode)!",
    token,
    user: safeUser,
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user details from JWT token
 */
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
});

export default router;
