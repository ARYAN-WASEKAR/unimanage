import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export interface ISuperAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: "SUPER_ADMIN" | "ADMIN";
  status: "active" | "inactive";
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const SuperAdminSchema = new Schema<ISuperAdmin>(
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
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN"],
      default: "SUPER_ADMIN",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

SuperAdminSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

SuperAdminSchema.methods["comparePassword"] = async function (this: any, candidatePassword: string): Promise<boolean> {
  const pwd = this.get ? this.get("password") : this.password;
  if (!pwd) return false;
  return bcrypt.compare(candidatePassword, pwd);
};

SuperAdminSchema.methods["toJSON"] = function (this: any) {
  const obj = this.toObject ? this.toObject() : { ...this };
  delete obj.password;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
};

export const SuperAdmin =
  (mongoose.models["SuperAdmin"] as mongoose.Model<ISuperAdmin>) ||
  mongoose.model<ISuperAdmin>("SuperAdmin", SuperAdminSchema);
