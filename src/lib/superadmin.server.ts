import { createServerFn } from "@tanstack/react-start";

export interface CreateSuperAdminInput {
  name: string;
  email: string;
  username: string;
  password: string;
  role?: "SUPER_ADMIN" | "ADMIN";
  status?: "active" | "inactive";
  phone?: string;
}

export interface UpdateSuperAdminInput {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  role?: "SUPER_ADMIN" | "ADMIN";
  status?: "active" | "inactive";
  phone?: string;
}

export interface SuperAdminResponse {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "SUPER_ADMIN" | "ADMIN";
  status: "active" | "inactive";
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isFallback?: boolean;
}

// Global in-memory fallback store if MongoDB service is not started on host machine
const fallbackAdmins: SuperAdminResponse[] = [
  {
    id: "sa-fallback-1",
    name: "Super Admin",
    email: "admin@unimanage.app",
    username: "superadmin",
    role: "SUPER_ADMIN",
    status: "active",
    phone: "+1 800-555-0199",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFallback: true,
  },
  {
    id: "sa-fallback-2",
    name: "Operations Admin",
    email: "ops@unimanage.app",
    username: "opsadmin",
    role: "ADMIN",
    status: "active",
    phone: "+1 800-555-0244",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isFallback: true,
  },
];

export const checkDbStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const { connectToDatabase, getMongoDbStatus } = await import("@/lib/db");
  try {
    await connectToDatabase();
    return getMongoDbStatus();
  } catch (error: any) {
    return {
      connected: false,
      state: 0,
      uri: process.env["MONGODB_URI"] || "mongodb://127.0.0.1:27017/unimanage",
      error: error.message || "Could not connect to MongoDB server on 127.0.0.1:27017",
    };
  }
});

export const getSuperAdminsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ admins: SuperAdminResponse[]; isFallback: boolean }> => {
    const { connectToDatabase } = await import("@/lib/db");
    const { SuperAdmin } = await import("@/models/SuperAdmin");

    try {
      await connectToDatabase();
      const count = await SuperAdmin.countDocuments();
      if (count === 0) {
        const defaultAdmin = new SuperAdmin({
          name: "Super Admin",
          email: "admin@unimanage.app",
          username: "superadmin",
          password: "adminpass",
          role: "SUPER_ADMIN",
          status: "active",
          phone: "+1 800-555-0199",
        });
        await defaultAdmin.save();
      }
      const list = await SuperAdmin.find().sort({ createdAt: -1 });
      return {
        admins: list.map(
          (doc) => (doc.toJSON ? doc.toJSON() : (doc as any)) as unknown as SuperAdminResponse,
        ),
        isFallback: false,
      };
    } catch (err) {
      console.warn("[MongoDB] Operating in fallback mode:", err);
      return {
        admins: [...fallbackAdmins],
        isFallback: true,
      };
    }
  },
);

export const getSuperAdminByIdFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data }): Promise<SuperAdminResponse | null> => {
    const { connectToDatabase } = await import("@/lib/db");
    const { SuperAdmin } = await import("@/models/SuperAdmin");

    try {
      await connectToDatabase();
      const admin = await SuperAdmin.findById(data);
      if (!admin) return null;
      return (admin.toJSON ? admin.toJSON() : (admin as any)) as unknown as SuperAdminResponse;
    } catch {
      return fallbackAdmins.find((a) => a.id === data) || null;
    }
  });

export const createSuperAdminFn = createServerFn({ method: "POST" })
  .validator((input: CreateSuperAdminInput) => input)
  .handler(async ({ data }): Promise<SuperAdminResponse> => {
    const { connectToDatabase } = await import("@/lib/db");
    const { SuperAdmin } = await import("@/models/SuperAdmin");

    try {
      await connectToDatabase();

      const existingEmail = await SuperAdmin.findOne({ email: data.email.toLowerCase().trim() });
      if (existingEmail) {
        throw new Error(`A SuperAdmin with email '${data.email}' already exists.`);
      }

      const existingUsername = await SuperAdmin.findOne({
        username: data.username.toLowerCase().trim(),
      });
      if (existingUsername) {
        throw new Error(`A SuperAdmin with username '${data.username}' already exists.`);
      }

      const newAdmin = new SuperAdmin({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        username: data.username.toLowerCase().trim(),
        password: data.password,
        role: data.role || "SUPER_ADMIN",
        status: data.status || "active",
        phone: data.phone?.trim() || "",
      });

      await newAdmin.save();
      return (newAdmin.toJSON ? newAdmin.toJSON() : (newAdmin as any)) as unknown as SuperAdminResponse;
    } catch (err: any) {
      if (err.message && err.message.includes("already exists")) {
        throw err;
      }
      // Fallback create
      const exists = fallbackAdmins.some(
        (a) =>
          a.email === data.email.toLowerCase().trim() ||
          a.username === data.username.toLowerCase().trim(),
      );
      if (exists) {
        throw new Error(`SuperAdmin with email or username already exists.`);
      }

      const newFallback: SuperAdminResponse = {
        id: `sa-fb-${Date.now()}`,
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        username: data.username.toLowerCase().trim(),
        role: data.role || "SUPER_ADMIN",
        status: data.status || "active",
        phone: data.phone?.trim() || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFallback: true,
      };
      fallbackAdmins.unshift(newFallback);
      return newFallback;
    }
  });

export const updateSuperAdminFn = createServerFn({ method: "POST" })
  .validator((payload: { id: string; input: UpdateSuperAdminInput }) => payload)
  .handler(async ({ data }): Promise<SuperAdminResponse> => {
    const { connectToDatabase } = await import("@/lib/db");
    const { SuperAdmin } = await import("@/models/SuperAdmin");
    const bcrypt = await import("bcryptjs");

    const { id, input } = data;

    try {
      await connectToDatabase();
      const admin = await SuperAdmin.findById(id);
      if (admin) {
        if (input.email && input.email.toLowerCase().trim() !== admin.email) {
          const existingEmail = await SuperAdmin.findOne({
            email: input.email.toLowerCase().trim(),
            _id: { $ne: id },
          });
          if (existingEmail) {
            throw new Error(`Email '${input.email}' is already in use by another SuperAdmin.`);
          }
          admin.email = input.email.toLowerCase().trim();
        }

        if (input.username && input.username.toLowerCase().trim() !== admin.username) {
          const existingUsername = await SuperAdmin.findOne({
            username: input.username.toLowerCase().trim(),
            _id: { $ne: id },
          });
          if (existingUsername) {
            throw new Error(`Username '${input.username}' is already in use by another SuperAdmin.`);
          }
          admin.username = input.username.toLowerCase().trim();
        }

        if (input.name !== undefined) admin.name = input.name.trim();
        if (input.role !== undefined) admin.role = input.role;
        if (input.status !== undefined) admin.status = input.status;
        if (input.phone !== undefined) admin.phone = input.phone.trim();

        if (input.password && input.password.trim().length > 0) {
          const salt = await bcrypt.default.genSalt(10);
          admin.password = await bcrypt.default.hash(input.password.trim(), salt);
        }

        await admin.save();
        return (admin.toJSON ? admin.toJSON() : (admin as any)) as unknown as SuperAdminResponse;
      }
    } catch (err: any) {
      if (err.message && err.message.includes("in use")) throw err;
    }

    // Fallback update
    const idx = fallbackAdmins.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`SuperAdmin with ID '${id}' not found.`);

    const target = fallbackAdmins[idx]!;
    const updated: SuperAdminResponse = {
      ...target,
      name: input.name !== undefined ? input.name.trim() : target.name,
      email: input.email !== undefined ? input.email.toLowerCase().trim() : target.email,
      username:
        input.username !== undefined ? input.username.toLowerCase().trim() : target.username,
      role: input.role !== undefined ? input.role : target.role,
      status: input.status !== undefined ? input.status : target.status,
      phone: input.phone !== undefined ? input.phone.trim() : target.phone || "",
      updatedAt: new Date().toISOString(),
    };
    fallbackAdmins[idx] = updated;
    return updated;
  });

export const deleteSuperAdminFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }): Promise<{ success: boolean; id: string }> => {
    const { connectToDatabase } = await import("@/lib/db");
    const { SuperAdmin } = await import("@/models/SuperAdmin");

    try {
      await connectToDatabase();
      const totalCount = await SuperAdmin.countDocuments();
      if (totalCount <= 1) {
        throw new Error("Cannot delete the only remaining SuperAdmin account.");
      }
      const admin = await SuperAdmin.findByIdAndDelete(data);
      if (admin) return { success: true, id: data };
    } catch (err: any) {
      if (err.message && err.message.includes("only remaining")) throw err;
    }

    // Fallback delete
    if (fallbackAdmins.length <= 1) {
      throw new Error("Cannot delete the only remaining SuperAdmin account.");
    }

    const idx = fallbackAdmins.findIndex((a) => a.id === data);
    if (idx !== -1) {
      fallbackAdmins.splice(idx, 1);
    }
    return { success: true, id: data };
  });
