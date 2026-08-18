import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    businessName: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
