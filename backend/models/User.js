import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: "+91 98765-43210",
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "SUPER_ADMIN"],
      default: "USER",
    },
    service: {
      type: String,
      enum: ["medical", "grocery", "beauty", "stationery", "combined"],
      default: "combined",
    },
    planId: {
      type: String,
      default: "plan-comb-pro",
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    expiryDate: {
      type: String,
      default: () => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    },
    businessName: {
      type: String,
      default: "Business Store",
    },
    businessAddress: {
      type: String,
      default: "MG Road, Mumbai, IN",
    },
    avatar: {
      type: String,
      default: "",
    },
    clerkUserId: {
      type: String,
      default: "",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
};

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
