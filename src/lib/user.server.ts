import { createServerFn } from "@tanstack/react-start";
import type { User as UserType } from "./unimanage/types";

export interface SyncUserInput {
  clerkUserId?: string;
  email: string;
  name: string;
  username: string;
  phone?: string;
  avatar?: string;
}

// Convert Mongoose User document to 100% plain serializable object
function toPlainUser(doc: any): UserType {
  if (!doc) {
    return {
      id: `usr-${Date.now()}`,
      name: "User",
      email: "",
      phone: "+91 98765-43210",
      username: "user",
      status: "active",
      role: "USER",
      service: "combined",
      planId: "plan-comb-pro",
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      businessName: "Business Store",
      businessAddress: "MG Road, Mumbai, IN",
      createdAt: new Date().toISOString().slice(0, 10),
    };
  }

  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(obj._id || obj.id || `usr-${Date.now()}`),
    name: String(obj.name || "User"),
    email: String(obj.email || ""),
    phone: String(obj.phone || "+91 98765-43210"),
    username: String(obj.username || "user"),
    status: (obj.status as "active" | "inactive") || "active",
    role: (obj.role as "USER" | "ADMIN" | "SUPER_ADMIN") || "USER",
    service: (obj.service as any) || "combined",
    planId: String(obj.planId || "plan-comb-pro"),
    startDate: String(obj.startDate || new Date().toISOString().slice(0, 10)),
    expiryDate: String(
      obj.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    ),
    businessName: String(obj.businessName || `${obj.name || "User"}'s Store`),
    businessAddress: String(obj.businessAddress || "MG Road, Mumbai, IN"),
    avatar: obj.avatar ? String(obj.avatar) : undefined,
    createdAt: obj.createdAt
      ? new Date(obj.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  };
}

/**
 * Automatically synchronizes a logged-in user (from Clerk or credentials) into MongoDB
 * Returns the synced User record with their business & subscription details
 */
export const syncLoggedInUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as SyncUserInput)
  .handler(async ({ data }): Promise<{ user: UserType; isNew: boolean }> => {
    const emailClean = (data.email || "").toLowerCase().trim();
    const usernameClean = (data.username || (emailClean ? emailClean.split("@")[0] : "user"))
      .toLowerCase()
      .trim();
    const nameClean = data.name || "User";

    try {
      const { connectToDatabase } = await import("@/lib/db");
      const { User } = await import("@/models/User");
      await connectToDatabase();

      // Look up existing user by clerkUserId, email, or username
      const orConditions: any[] = [];
      if (data.clerkUserId) orConditions.push({ clerkUserId: data.clerkUserId });
      if (emailClean) orConditions.push({ email: emailClean });
      if (usernameClean) orConditions.push({ username: usernameClean });

      let existing = orConditions.length > 0 ? await User.findOne({ $or: orConditions }) : null;

      if (existing) {
        // Update user's latest identity & avatar
        if (data.clerkUserId && !existing.clerkUserId) existing.clerkUserId = data.clerkUserId;
        if (data.avatar && existing.avatar !== data.avatar) existing.avatar = data.avatar;
        if (data.phone && !existing.phone) existing.phone = data.phone;
        if (nameClean && existing.name !== nameClean) existing.name = nameClean;
        await existing.save();

        return { user: toPlainUser(existing), isNew: false };
      }

      // Create brand new User record in MongoDB
      const created = await User.create({
        name: nameClean,
        email: emailClean || `${usernameClean}@unimanage.app`,
        username: usernameClean,
        phone: data.phone || "+91 98765-43210",
        avatar: data.avatar || "",
        clerkUserId: data.clerkUserId || "",
        status: "active",
        role: "USER",
        service: "combined",
        planId: "plan-comb-pro",
        businessName: `${nameClean}'s Store`,
        businessAddress: "MG Road, Mumbai, IN",
        startDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      });

      console.log(`[MongoDB] Registered & Synced new user: ${created.name} (${created.email})`);
      return { user: toPlainUser(created), isNew: true };
    } catch (error: any) {
      console.warn("[User Sync] MongoDB operation failed, returning memory user representation:", error.message);
      const fallbackUser: UserType = {
        id: data.clerkUserId || `usr-${Date.now()}`,
        name: nameClean,
        email: emailClean,
        phone: data.phone || "+91 98765-43210",
        username: usernameClean,
        status: "active",
        role: "USER",
        service: "combined",
        planId: "plan-comb-pro",
        startDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        businessName: `${nameClean}'s Store`,
        businessAddress: "MG Road, Mumbai, IN",
        avatar: data.avatar,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { user: fallbackUser, isNew: true };
    }
  });

/**
 * Fetch all users from MongoDB
 */
export const getUsersListFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ users: UserType[]; fromDb: boolean }> => {
    try {
      const { connectToDatabase } = await import("@/lib/db");
      const { User } = await import("@/models/User");
      await connectToDatabase();

      const list = await User.find().sort({ createdAt: -1 });
      return { users: list.map(toPlainUser), fromDb: true };
    } catch (error: any) {
      return { users: [], fromDb: false };
    }
  },
);

/**
 * Create user from Admin Panel
 */
export const createAdminUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as Partial<UserType>)
  .handler(async ({ data }): Promise<UserType> => {
    try {
      const { connectToDatabase } = await import("@/lib/db");
      const { User } = await import("@/models/User");
      await connectToDatabase();

      const created = await User.create({
        name: data.name,
        email: (data.email || "").toLowerCase().trim(),
        username: (data.username || "").toLowerCase().trim(),
        phone: data.phone || "+91 98765-43210",
        status: data.status || "active",
        role: data.role || "USER",
        service: data.service || "combined",
        planId: data.planId || "plan-comb-pro",
        startDate: data.startDate || new Date().toISOString().slice(0, 10),
        expiryDate:
          data.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        businessName: data.businessName || `${data.name || "Business"}'s Store`,
        businessAddress: data.businessAddress || "MG Road, Mumbai, IN",
        avatar: data.avatar || "",
      });

      return toPlainUser(created);
    } catch (error: any) {
      throw new Error(error.message || "Failed to create user in database");
    }
  });

/**
 * Update user details (from Admin or User Profile)
 */
export const updateAdminUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id: string; patch: Partial<UserType> })
  .handler(async ({ data }): Promise<UserType | null> => {
    try {
      const { connectToDatabase } = await import("@/lib/db");
      const { User } = await import("@/models/User");
      await connectToDatabase();

      const isMongoId = data.id.match(/^[0-9a-fA-F]{24}$/);
      const query = isMongoId
        ? { _id: data.id }
        : {
            $or: [
              { id: data.id },
              { email: (data.patch.email || "").toLowerCase() },
              { username: (data.patch.username || "").toLowerCase() },
            ],
          };

      const updated = await User.findOneAndUpdate(query, { $set: data.patch }, { new: true });
      return updated ? toPlainUser(updated) : null;
    } catch (error: any) {
      console.warn("[User Update] MongoDB update error:", error.message);
      return null;
    }
  });

/**
 * Delete user from database
 */
export const deleteAdminUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { id: string })
  .handler(async ({ data }): Promise<boolean> => {
    try {
      const { connectToDatabase } = await import("@/lib/db");
      const { User } = await import("@/models/User");
      await connectToDatabase();

      const isMongoId = data.id.match(/^[0-9a-fA-F]{24}$/);
      const query = isMongoId ? { _id: data.id } : { id: data.id };
      await User.findOneAndDelete(query);
      return true;
    } catch (error: any) {
      console.warn("[User Delete] MongoDB delete error:", error.message);
      return false;
    }
  });
