import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  id?: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  status: "active" | "inactive";
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  service: "medical" | "grocery" | "beauty" | "stationery" | "combined";
  planId: string;
  startDate: string;
  expiryDate: string;
  businessName?: string;
  businessAddress?: string;
  avatar?: string;
  clerkUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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

UserSchema.methods["toJSON"] = function (this: any) {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
};

export const User =
  (mongoose.models["User"] as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
