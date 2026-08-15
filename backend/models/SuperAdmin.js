import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const SuperAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
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

SuperAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

SuperAdminSchema.methods.comparePassword = async function (candidatePassword) {
  const pwd = this.password || this.get("password");
  if (!pwd) return false;
  return bcrypt.compare(candidatePassword, pwd);
};

SuperAdminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  return obj;
};

export const SuperAdmin =
  mongoose.models.SuperAdmin || mongoose.model("SuperAdmin", SuperAdminSchema);
