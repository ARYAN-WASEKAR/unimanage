import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: "General" },
    sku: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
