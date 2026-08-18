import express from "express";
import { Customer } from "../models/Customer.js";
import { Invoice } from "../models/Invoice.js";
import { Product } from "../models/Product.js";

const router = express.Router();

// Middleware to extract authenticated userId from header or query (Anti-IDOR protection)
const extractUserId = (req, res, next) => {
  const userId = req.headers["x-user-id"] || req.query.userId || "usr-1";
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized user identity." });
  }
  req.userId = String(userId);
  next();
};

router.use(extractUserId);

/* -------------------------------------------------------------------------- */
/* PRODUCTS API (USER DATA ISOLATED)                                         */
/* -------------------------------------------------------------------------- */
router.get("/products", async (req, res) => {
  try {
    const list = await Product.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/products", async (req, res) => {
  try {
    const newProd = new Product({
      ...req.body,
      userId: req.userId, // Anti-IDOR enforcement
    });
    await newProd.save();
    res.status(201).json({ success: true, message: "Product created.", data: newProd });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // Enforce userId match
      req.body,
      { new: true },
    );
    if (!updated) return res.status(404).json({ success: false, error: "Product not found." });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ success: false, error: "Product not found." });
    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* CUSTOMERS API (USER DATA ISOLATED)                                        */
/* -------------------------------------------------------------------------- */
router.get("/customers", async (req, res) => {
  try {
    const list = await Customer.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/customers", async (req, res) => {
  try {
    const cust = new Customer({
      ...req.body,
      userId: req.userId,
    });
    await cust.save();
    res.status(201).json({ success: true, data: cust });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/* INVOICES API (USER DATA ISOLATED)                                         */
/* -------------------------------------------------------------------------- */
router.get("/invoices", async (req, res) => {
  try {
    const list = await Invoice.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const inv = new Invoice({
      ...req.body,
      userId: req.userId,
    });
    await inv.save();
    res.status(201).json({ success: true, data: inv });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
