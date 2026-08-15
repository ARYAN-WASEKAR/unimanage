import bcrypt from "bcryptjs";
import express from "express";
import { connectDB } from "../config/db.js";
import { SuperAdmin } from "../models/SuperAdmin.js";
import { memorySuperAdmins } from "./authRoutes.js";

const router = express.Router();

/**
 * Ensures initial default SuperAdmin exists in MongoDB
 */
async function seedDefaultSuperAdmin() {
  try {
    const conn = await connectDB();
    if (conn) {
      const count = await SuperAdmin.countDocuments();
      if (count === 0) {
        console.log("[MongoDB] Seeding initial SuperAdmin account...");
        const admin = new SuperAdmin({
          name: "Super Admin",
          email: "admin@unimanage.app",
          username: "superadmin",
          password: "adminpass",
          role: "SUPER_ADMIN",
          status: "active",
          phone: "+1 800-555-0199",
        });
        await admin.save();
        console.log("[MongoDB] Initial SuperAdmin created: username 'superadmin'");
      }
    }
  } catch (err) {
    console.warn("[MongoDB Seed Warning]:", err.message);
  }
}

/**
 * @route   GET /api/superadmins
 * @desc    Get all SuperAdmins
 */
router.get("/", async (req, res) => {
  try {
    const conn = await connectDB();
    if (conn) {
      await seedDefaultSuperAdmin();
      const list = await SuperAdmin.find().sort({ createdAt: -1 });
      return res.json({
        success: true,
        source: "mongodb",
        count: list.length,
        data: list.map((doc) => doc.toJSON()),
      });
    }
  } catch (err) {
    console.warn("[MongoDB GET /api/superadmins Error]:", err.message);
  }

  // Fallback memory store
  return res.json({
    success: true,
    source: "fallback_memory_store",
    count: memorySuperAdmins.length,
    data: memorySuperAdmins.map(({ passwordHash, passwordRaw, ...u }) => u),
  });
});

/**
 * @route   POST /api/superadmins AND /api/superadmins/create AND /api/superadmin/create
 * @desc    Create a new SuperAdmin
 */
const createHandler = async (req, res) => {
  const { name, email, username, password, role, status, phone } = req.body || {};

  if (!name || !email || !username || !password) {
    return res.status(400).json({
      success: false,
      error: "Name, Email, Username, and Password are required fields.",
    });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanUsername = String(username).toLowerCase().trim();

  try {
    const conn = await connectDB();
    if (conn) {
      const existingEmail = await SuperAdmin.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: `Email '${email}' is already registered.`,
        });
      }

      const existingUsername = await SuperAdmin.findOne({ username: cleanUsername });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          error: `Username '${username}' is already taken.`,
        });
      }

      const newAdmin = new SuperAdmin({
        name: String(name).trim(),
        email: cleanEmail,
        username: cleanUsername,
        password: String(password),
        role: role || "SUPER_ADMIN",
        status: status || "active",
        phone: phone ? String(phone).trim() : "",
      });

      await newAdmin.save();
      return res.status(201).json({
        success: true,
        message: "SuperAdmin created successfully in MongoDB!",
        data: newAdmin.toJSON(),
      });
    }
  } catch (err) {
    console.warn("[MongoDB POST SuperAdmin Error]:", err.message);
  }

  // Fallback store handling
  const exists = memorySuperAdmins.some(
    (a) => a.email === cleanEmail || a.username === cleanUsername,
  );
  if (exists) {
    return res.status(409).json({
      success: false,
      error: `SuperAdmin with email '${email}' or username '${username}' already exists.`,
    });
  }

  const newId = `sa-fb-${Date.now()}`;
  const hashed = await bcrypt.hash(String(password), 10);

  const newFb = {
    id: newId,
    _id: newId,
    name: String(name).trim(),
    email: cleanEmail,
    username: cleanUsername,
    passwordHash: hashed,
    passwordRaw: String(password),
    role: role || "SUPER_ADMIN",
    status: status || "active",
    phone: phone ? String(phone).trim() : "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFallback: true,
  };

  memorySuperAdmins.unshift(newFb);
  const { passwordHash, passwordRaw, ...safeData } = newFb;
  return res.status(201).json({
    success: true,
    message: "SuperAdmin created successfully (Demo Mode)!",
    data: safeData,
  });
};

router.post("/", createHandler);
router.post("/create", createHandler);

/**
 * @route   GET /api/superadmins/:id
 * @desc    Get SuperAdmin by ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await connectDB();
    if (conn) {
      const admin = await SuperAdmin.findById(id);
      if (admin) {
        return res.json({ success: true, data: admin.toJSON() });
      }
    }
  } catch (err) {
    /* fallback below */
  }

  const fb = memorySuperAdmins.find((a) => a.id === id || a._id === id);
  if (!fb) {
    return res.status(404).json({ success: false, error: "SuperAdmin account not found." });
  }

  const { passwordHash, passwordRaw, ...safeFb } = fb;
  return res.json({ success: true, data: safeFb });
});

/**
 * @route   PUT /api/superadmins/:id
 * @desc    Update SuperAdmin account
 */
const updateHandler = async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};

  try {
    const conn = await connectDB();
    if (conn) {
      const admin = await SuperAdmin.findById(id);
      if (admin) {
        if (body.name) admin.name = String(body.name).trim();
        if (body.phone !== undefined) admin.phone = String(body.phone).trim();
        if (body.role) admin.role = body.role;
        if (body.status) admin.status = body.status;

        if (body.email && String(body.email).toLowerCase().trim() !== admin.email) {
          const dupEmail = await SuperAdmin.findOne({
            email: String(body.email).toLowerCase().trim(),
            _id: { $ne: id },
          });
          if (dupEmail) {
            return res
              .status(409)
              .json({ success: false, error: `Email '${body.email}' is already registered.` });
          }
          admin.email = String(body.email).toLowerCase().trim();
        }

        if (body.username && String(body.username).toLowerCase().trim() !== admin.username) {
          const dupUser = await SuperAdmin.findOne({
            username: String(body.username).toLowerCase().trim(),
            _id: { $ne: id },
          });
          if (dupUser) {
            return res
              .status(409)
              .json({ success: false, error: `Username '${body.username}' is already taken.` });
          }
          admin.username = String(body.username).toLowerCase().trim();
        }

        if (body.password && String(body.password).trim().length > 0) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(String(body.password).trim(), salt);
        }

        await admin.save();
        return res.json({
          success: true,
          message: "SuperAdmin updated successfully!",
          data: admin.toJSON(),
        });
      }
    }
  } catch (err) {
    /* fallback below */
  }

  const idx = memorySuperAdmins.findIndex((a) => a.id === id || a._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "SuperAdmin account not found." });
  }

  const target = memorySuperAdmins[idx];
  if (body.name) target.name = String(body.name).trim();
  if (body.phone !== undefined) target.phone = String(body.phone).trim();
  if (body.role) target.role = body.role;
  if (body.status) target.status = body.status;
  if (body.email) target.email = String(body.email).toLowerCase().trim();
  if (body.username) target.username = String(body.username).toLowerCase().trim();
  if (body.password) {
    target.passwordRaw = String(body.password);
    target.passwordHash = await bcrypt.hash(String(body.password), 10);
  }
  target.updatedAt = new Date().toISOString();

  const { passwordHash, passwordRaw, ...safeTarget } = target;
  return res.json({
    success: true,
    message: "SuperAdmin updated successfully!",
    data: safeTarget,
  });
};

router.put("/:id", updateHandler);
router.patch("/:id", updateHandler);

/**
 * @route   DELETE /api/superadmins/:id
 * @desc    Delete SuperAdmin account
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await connectDB();
    if (conn) {
      const count = await SuperAdmin.countDocuments();
      if (count <= 1) {
        return res
          .status(400)
          .json({ success: false, error: "Cannot delete the only remaining SuperAdmin account." });
      }

      const admin = await SuperAdmin.findByIdAndDelete(id);
      if (admin) {
        return res.json({
          success: true,
          message: `SuperAdmin '${admin.name}' deleted successfully.`,
        });
      }
    }
  } catch (err) {
    /* fallback below */
  }

  if (memorySuperAdmins.length <= 1) {
    return res
      .status(400)
      .json({ success: false, error: "Cannot delete the only remaining SuperAdmin account." });
  }

  const idx = memorySuperAdmins.findIndex((a) => a.id === id || a._id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "SuperAdmin account not found." });
  }

  const removed = memorySuperAdmins.splice(idx, 1)[0];
  return res.json({
    success: true,
    message: `SuperAdmin '${removed.name}' deleted successfully.`,
  });
});

export default router;
