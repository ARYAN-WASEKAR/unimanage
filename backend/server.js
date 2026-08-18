import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB, getDbState } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend client
app.use(cors());

// Parse incoming JSON body
app.use(express.json());

// Initialize MongoDB Connection
connectDB();

// Root & Health Check Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "UniManage Express Backend API Server is Running",
    status: "online",
    db: getDbState(),
    endpoints: {
      authLogin: "POST /api/auth/login",
      superAdminLogin: "POST /api/superadmin/login",
      superAdminCreate: "POST /api/superadmin/create (or POST /api/superadmins)",
      superAdminsList: "GET /api/superadmins",
      superAdminUpdate: "PUT /api/superadmins/:id",
      superAdminDelete: "DELETE /api/superadmins/:id",
      healthCheck: "GET /api/health",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    db: getDbState(),
  });
});

// Clerk Webhook Listener Endpoint
app.post("/api/webhooks/clerk", (req, res) => {
  const event = req.body || {};
  const eventType = event.type || "unknown";
  console.log(`[Clerk Webhook Received]: ${eventType}`, event.data?.id || "");
  
  if (eventType === "user.created") {
    console.log(`[Clerk Webhook] New user created: ${event.data?.email_addresses?.[0]?.email_address || ""}`);
  } else if (eventType === "user.deleted") {
    console.log(`[Clerk Webhook] User deleted: ${event.data?.id}`);
  }

  return res.json({ success: true, received: true, type: eventType });
});

import userPortalRoutes from "./routes/userPortalRoutes.js";

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/superadmin", authRoutes); // Aliased for /api/superadmin/login
app.use("/api/superadmin", superAdminRoutes); // Aliased for /api/superadmin/create
app.use("/api/superadmins", superAdminRoutes);
app.use("/api/user", userPortalRoutes);

// Start Express Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  🚀 Express Backend Server running on port ${PORT}`);
  console.log(`  ➜ Local API: http://localhost:${PORT}/api/superadmins`);
  console.log(`  ➜ Login API: http://localhost:${PORT}/api/superadmin/login`);
  console.log(`=================================================`);
});
