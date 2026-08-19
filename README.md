# 🚀 UniManage — Unified Business & SuperAdmin Platform

![UniManage Banner](https://img.shields.io/badge/UniManage-v2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.2-cyan?style=for-the-badge&logo=react)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.168-orange?style=for-the-badge)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Live-green?style=for-the-badge&logo=mongodb)
![Clerk Auth](https://img.shields.io/badge/Clerk_Auth-Active-purple?style=for-the-badge&logo=clerk)

**UniManage** is a modern, enterprise-ready full-stack business management platform designed to unify customer operations and multi-tenant administrative controls into a seamless, high-performance web suite.

---

## ✨ Features & Modules

### 🔐 1. Dual-Portal Authentication
- **User Login (Customer Portal)**: Live Clerk authentication with Google OAuth, Magic Links, Passkeys, and multi-factor security.
- **Admin Login (Management Portal)**: Dedicated SuperAdmin gateway with role-based access control (RBAC), BCrypt password hashing, and active status checks.

### 🏢 2. Multi-Service Business Suites
Tailored workflows for multiple retail & service industries:
- 🏥 **Medical Management**: Clinics, pharmacies, patient records, and prescription inventory.
- 🛒 **Grocery Management**: Multi-outlet stock tracking, supplier ledgers, and daily sales.
- 💄 **Beauty Management**: Salon appointment scheduling, stylist allocation, and cosmetics inventory.
- ✏️ **Stationery Management**: Product catalogues, bulk ordering, and season demand planning.
- 🧩 **Combined Management**: Bundled full-suite operational tools for enterprise outlets.

### 🛡️ 3. SuperAdmin Control Room (`/admin/*`)
- **Database Status Monitor**: Real-time cluster status tracking, node latency, and connection URI verification.
- **SuperAdmin Account Management**: Complete CRUD operations for administrators with export options (CSV).
- **Subscription Plan Builder**: Create, activate, and manage monthly/quarterly/yearly plans.
- **System Activity Logs**: Audit logs capturing all administrative actions across the platform.

### 💼 4. Customer Workspace (`/user/*`)
- **Interactive Dashboard**: KPI summaries (revenue, product counts, active subscription status, days remaining).
- **Inventory & Products**: Product cataloguing with low-stock alerts, category tags, and SKU generation.
- **Customer CRM**: Client list management, contact information, and billing histories.
- **Invoicing & Payments**: Professional billing invoice creation with export and payment status tracking.

### ⚡ 5. High-Availability Database Sync Engine
- **Live MongoDB Atlas Integration**: Connects directly to cloud-hosted MongoDB Atlas clusters.
- **Resilient Fallback Mode**: Zero-downtime architecture featuring automatic fallback to an in-memory store if Atlas network access is interrupted.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Radix UI Primitives, Lucide Icons, Sonner Toasts.
- **Framework & Routing**: TanStack Start (SSR), TanStack Router (File-based route code splitting), TanStack Query.
- **Database**: MongoDB Atlas, Mongoose 9.
- **Authentication**: Clerk Authentication (`@clerk/clerk-react`) + Internal Role Verification.
- **Backend API**: Express.js (Node.js API Server).

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm** or **bun**
- **MongoDB Atlas Account** (Free M0 Cluster or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/ARYAN-WASEKAR/unimanage.git
cd unimanage
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup (`.env`)
Create a `.env` file in the root directory:

```env
# Clerk Authentication Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_CLERK_SECRET_KEY

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/unimanage?retryWrites=true&w=majority
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### 5. Run Express API Server (Optional Backend)
```bash
npm run server
```

---

## 🌐 Connecting to MongoDB Atlas

1. Log in to **[cloud.mongodb.com](https://cloud.mongodb.com)**.
2. Under **SECURITY** in the left sidebar, click **Network Access**.
3. Click **`+ ADD IP ADDRESS`** -> Click **`ALLOW ACCESS FROM ANYWHERE`** (`0.0.0.0/0`) -> Click **Confirm**.
4. Under **Database Access**, create a database user with `Read and write to any database` permissions.
5. Paste your connection string into `.env` under `MONGODB_URI`.

---

## 📦 Project Structure

```text
unimanage/
├── backend/                  # Express API Server & Models
│   ├── config/db.js          # MongoDB Express Connection
│   └── server.js             # Express REST Endpoints
├── src/
│   ├── components/           # Reusable UI & Page Components
│   │   ├── ui/               # Radix UI + Tailwind Primitives
│   │   ├── unimanage/        # App Shells (AdminShell, UserShell)
│   │   └── LoginPage.tsx     # Split View Auth Component
│   ├── lib/                  # Utility Libraries & State
│   │   ├── db.ts             # Mongoose Connection Handler
│   │   ├── superadmin.server.ts # TanStack Server Functions
│   │   └── unimanage/        # Auth, Store, Theme Providers
│   ├── models/               # Mongoose Database Schemas
│   │   └── SuperAdmin.ts
│   └── routes/               # TanStack Router File Routes
│       ├── index.tsx         # Main Landing / Login Route
│       ├── admin.tsx         # SuperAdmin Protected Layout
│       ├── user.tsx          # User Protected Layout
│       └── ...
├── vite.config.ts            # Vite + TanStack Start Config
└── package.json
```

---

## 📜 Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite + TanStack Start dev server at `http://localhost:8080` |
| `npm run server` | Starts standalone Express API server at `http://localhost:5001` |
| `npm run build` | Builds production-optimized client, SSR, and Nitro bundles |
| `npx tsc --noEmit` | Runs full TypeScript type check across codebase |

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center="align">
  Crafted with ❤️ for <b>UniManage Platform</b>.
</p>
