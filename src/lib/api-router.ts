import { connectToDatabase, getMongoDbStatus } from "@/lib/db";
import { SuperAdmin } from "@/models/SuperAdmin";
import bcrypt from "bcryptjs";

// In-memory fallback store for API testing when local MongoDB service is off
const fallbackAdminsStore: any[] = [
  {
    id: "64f1a2b3c4d5e6f7a8b9c0d1",
    _id: "64f1a2b3c4d5e6f7a8b9c0d1",
    name: "Super Admin",
    email: "admin@unimanage.app",
    username: "superadmin",
    passwordHash: "$2a$10$Z1O5vT...adminpass",
    passwordRaw: "adminpass",
    role: "SUPER_ADMIN",
    status: "active",
    phone: "+1 800-555-0199",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFallback: true,
  },
];

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  const method = request.method.toUpperCase();

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

  if (method === "OPTIONS") {
    return json({ ok: true });
  }

  try {
    // 1. GET /api/status - DB Status
    if (pathname === "/api/status" && method === "GET") {
      try {
        await connectToDatabase();
        return json({ success: true, ...getMongoDbStatus() });
      } catch (err: any) {
        return json({
          success: true,
          connected: false,
          state: 0,
          mode: "fallback_demo_mode",
          uri: process.env["MONGODB_URI"] || "mongodb://127.0.0.1:27017/unimanage",
          message: "MongoDB service is offline. Running in-memory demo API mode.",
        });
      }
    }

    // 2. POST /api/superadmins/login - SuperAdmin Login
    if (pathname === "/api/superadmins/login" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { username, password } = body || {};

      if (!username || !password) {
        return json(
          { success: false, error: "Username (or Email) and Password are required." },
          400,
        );
      }

      const queryStr = String(username).toLowerCase().trim();

      // Try MongoDB first
      try {
        await connectToDatabase();
        const admin = await SuperAdmin.findOne({
          $or: [{ username: queryStr }, { email: queryStr }],
        }).select("+password");

        if (admin) {
          if (admin.status === "inactive") {
            return json({ success: false, error: "Account is inactive. Access disabled." }, 403);
          }
          const isMatch = await admin.comparePassword(String(password));
          if (!isMatch) {
            return json({ success: false, error: "Invalid username/email or password." }, 401);
          }
          return json({
            success: true,
            message: "SuperAdmin login successful (MongoDB)!",
            token: `jwt_superadmin_${admin._id}_${Date.now()}`,
            user: admin.toJSON(),
          });
        }
      } catch {
        console.log("[API] MongoDB offline, verifying login via fallback store...");
      }

      // Fallback check
      const fbAdmin = fallbackAdminsStore.find(
        (a) => a.username === queryStr || a.email === queryStr,
      );

      if (!fbAdmin) {
        return json({ success: false, error: "Invalid username/email or password." }, 401);
      }

      if (fbAdmin.status === "inactive") {
        return json({ success: false, error: "Account is inactive. Access disabled." }, 403);
      }

      const isFbMatch =
        password === fbAdmin.passwordRaw ||
        (await bcrypt.compare(String(password), fbAdmin.passwordHash).catch(() => false));

      if (!isFbMatch) {
        return json({ success: false, error: "Invalid username/email or password." }, 401);
      }

      const { passwordHash, passwordRaw, ...safeUser } = fbAdmin;
      return json({
        success: true,
        message: "SuperAdmin login successful (Demo Fallback Mode)!",
        token: `jwt_superadmin_demo_${fbAdmin.id}_${Date.now()}`,
        user: safeUser,
      });
    }

    // 3. GET /api/superadmins - List SuperAdmins
    if (pathname === "/api/superadmins" && method === "GET") {
      try {
        await connectToDatabase();
        const list = await SuperAdmin.find().sort({ createdAt: -1 });
        return json({
          success: true,
          source: "mongodb",
          count: list.length,
          data: list.map((doc) => doc.toJSON()),
        });
      } catch {
        return json({
          success: true,
          source: "fallback_demo_store",
          count: fallbackAdminsStore.length,
          data: fallbackAdminsStore.map(({ passwordHash, passwordRaw, ...u }) => u),
        });
      }
    }

    // 4. POST /api/superadmins - Create SuperAdmin
    if (pathname === "/api/superadmins" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { name, email, username, password, role, status, phone } = body || {};

      if (!name || !email || !username || !password) {
        return json(
          { success: false, error: "Name, Email, Username, and Password are required." },
          400,
        );
      }

      const cleanEmail = String(email).toLowerCase().trim();
      const cleanUsername = String(username).toLowerCase().trim();

      try {
        await connectToDatabase();
        const existingEmail = await SuperAdmin.findOne({ email: cleanEmail });
        if (existingEmail)
          return json({ success: false, error: `Email '${email}' is already registered.` }, 409);

        const existingUsername = await SuperAdmin.findOne({ username: cleanUsername });
        if (existingUsername)
          return json({ success: false, error: `Username '${username}' is already taken.` }, 409);

        const newAdmin = new SuperAdmin({
          name: String(name).trim(),
          email: cleanEmail,
          username: cleanUsername,
          password: String(password),
          role: role || "SUPER_ADMIN",
          status: status || "active",
          phone: phone ? String(phone).trim() : "",
        });

        await newAdmin.save();
        return json(
          {
            success: true,
            message: "SuperAdmin created successfully in MongoDB!",
            data: newAdmin.toJSON(),
          },
          201,
        );
      } catch (err: any) {
        if (err.message && err.message.includes("already registered")) throw err;

        // Fallback store insert
        const exists = fallbackAdminsStore.some(
          (a) => a.email === cleanEmail || a.username === cleanUsername,
        );
        if (exists) {
          return json(
            {
              success: false,
              error: `SuperAdmin with email '${email}' or username '${username}' already exists.`,
            },
            409,
          );
        }

        const newId = `64f${Date.now().toString(16).padStart(21, "0")}`;
        const hashed = await bcrypt.hash(String(password), 10);

        const newFb = {
          id: newId,
          _id: newId,
          name: String(name).trim(),
          email: cleanEmail,
          username: cleanUsername,
          passwordHash: hashed,
          passwordRaw: String(password),
          role: role || "SUPER_ADMIN",
          status: status || "active",
          phone: phone ? String(phone).trim() : "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFallback: true,
        };

        fallbackAdminsStore.unshift(newFb);
        const { passwordHash, passwordRaw, ...safeData } = newFb;
        return json(
          {
            success: true,
            message: "SuperAdmin created successfully (Demo Mode)!",
            data: safeData,
          },
          201,
        );
      }
    }

    // 5. GET /api/superadmins/:id
    const getMatch = pathname.match(/^\/api\/superadmins\/([a-f0-9A-Z_-]+)$/i);
    if (getMatch && method === "GET") {
      const id = getMatch[1];
      try {
        await connectToDatabase();
        const admin = await SuperAdmin.findById(id);
        if (admin) return json({ success: true, data: admin.toJSON() });
      } catch {
        /* fallback below */
      }

      const fb = fallbackAdminsStore.find((a) => a.id === id || a._id === id);
      if (!fb) return json({ success: false, error: "SuperAdmin not found." }, 404);
      const { passwordHash, passwordRaw, ...safeFb } = fb;
      return json({ success: true, data: safeFb });
    }

    // 6. PUT/PATCH /api/superadmins/:id
    const putMatch = pathname.match(/^\/api\/superadmins\/([a-f0-9A-Z_-]+)$/i);
    if (putMatch && (method === "PUT" || method === "PATCH")) {
      const id = putMatch[1];
      const body = await request.json().catch(() => ({}));

      try {
        await connectToDatabase();
        const admin = await SuperAdmin.findById(id);
        if (admin) {
          if (body.name) admin.name = String(body.name).trim();
          if (body.phone !== undefined) admin.phone = String(body.phone).trim();
          if (body.role) admin.role = body.role;
          if (body.status) admin.status = body.status;
          if (body.email) admin.email = String(body.email).toLowerCase().trim();
          if (body.username) admin.username = String(body.username).toLowerCase().trim();

          if (body.password && String(body.password).trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(String(body.password).trim(), salt);
          }

          await admin.save();
          return json({
            success: true,
            message: "SuperAdmin updated successfully!",
            data: admin.toJSON(),
          });
        }
      } catch {
        /* fallback below */
      }

      const idx = fallbackAdminsStore.findIndex((a) => a.id === id || a._id === id);
      if (idx === -1) return json({ success: false, error: "SuperAdmin not found." }, 404);

      const target = fallbackAdminsStore[idx];
      if (body.name) target.name = String(body.name).trim();
      if (body.phone !== undefined) target.phone = String(body.phone).trim();
      if (body.role) target.role = body.role;
      if (body.status) target.status = body.status;
      if (body.email) target.email = String(body.email).toLowerCase().trim();
      if (body.username) target.username = String(body.username).toLowerCase().trim();
      if (body.password) {
        target.passwordRaw = String(body.password);
        target.passwordHash = await bcrypt.hash(String(body.password), 10);
      }
      target.updatedAt = new Date().toISOString();

      const { passwordHash, passwordRaw, ...safeTarget } = target;
      return json({ success: true, message: "SuperAdmin updated successfully!", data: safeTarget });
    }

    // 7. DELETE /api/superadmins/:id
    const delMatch = pathname.match(/^\/api\/superadmins\/([a-f0-9A-Z_-]+)$/i);
    if (delMatch && method === "DELETE") {
      const id = delMatch[1];

      try {
        await connectToDatabase();
        const totalCount = await SuperAdmin.countDocuments();
        if (totalCount <= 1)
          return json(
            { success: false, error: "Cannot delete the only remaining SuperAdmin account." },
            400,
          );

        const admin = await SuperAdmin.findByIdAndDelete(id);
        if (admin)
          return json({
            success: true,
            message: `SuperAdmin '${admin.name}' deleted successfully.`,
          });
      } catch {
        /* fallback below */
      }

      if (fallbackAdminsStore.length <= 1) {
        return json(
          { success: false, error: "Cannot delete the only remaining SuperAdmin account." },
          400,
        );
      }

      const idx = fallbackAdminsStore.findIndex((a) => a.id === id || a._id === id);
      if (idx === -1) return json({ success: false, error: "SuperAdmin not found." }, 404);

      const removed = fallbackAdminsStore.splice(idx, 1)[0];
      return json({ success: true, message: `SuperAdmin '${removed.name}' deleted successfully.` });
    }

    return json({ success: false, error: `API endpoint ${method} ${pathname} not found.` }, 404);
  } catch (error: any) {
    console.error(`[API Router Error]`, error);
    return json({ success: false, error: error.message || "Internal Server Error" }, 500);
  }
}
