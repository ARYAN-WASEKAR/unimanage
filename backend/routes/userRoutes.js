import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

// GET /api/users - Fetch All Users
router.get("/", async (req, res) => {
  try {
    const list = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users or /api/users/sync - Upsert User
router.post(["/", "/sync"], async (req, res) => {
  const body = req.body || {};
  const emailClean = (body.email || "").toLowerCase().trim();
  const usernameClean = (body.username || (emailClean ? emailClean.split("@")[0] : "user"))
    .toLowerCase()
    .trim();

  try {
    const orConditions = [];
    if (body.clerkUserId) orConditions.push({ clerkUserId: body.clerkUserId });
    if (emailClean) orConditions.push({ email: emailClean });
    if (usernameClean) orConditions.push({ username: usernameClean });

    let existing = orConditions.length > 0 ? await User.findOne({ $or: orConditions }) : null;

    if (existing) {
      if (body.name) existing.name = body.name;
      if (body.phone) existing.phone = body.phone;
      if (body.avatar) existing.avatar = body.avatar;
      if (body.service) existing.service = body.service;
      if (body.planId) existing.planId = body.planId;
      if (body.businessName) existing.businessName = body.businessName;
      if (body.businessAddress) existing.businessAddress = body.businessAddress;
      await existing.save();
      return res.json({ success: true, message: "User synced successfully", data: existing });
    }

    const created = await User.create({
      name: body.name || "User",
      email: emailClean || `${usernameClean}@unimanage.app`,
      username: usernameClean,
      phone: body.phone || "+91 98765-43210",
      avatar: body.avatar || "",
      clerkUserId: body.clerkUserId || "",
      status: body.status || "active",
      role: body.role || "USER",
      service: body.service || "combined",
      planId: body.planId || "plan-comb-pro",
      businessName: body.businessName || `${body.name || "User"}'s Store`,
      businessAddress: body.businessAddress || "MG Road, Mumbai, IN",
      startDate: body.startDate || new Date().toISOString().slice(0, 10),
      expiryDate: body.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });

    return res.status(201).json({ success: true, message: "User created & synced", data: created });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/users/:id - Update User
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id - Delete User
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
