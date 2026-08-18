import { addDays, addMonths, iso } from "./dates";
import type {
  ActivityLog,
  Category,
  Customer,
  Invoice,
  Payment,
  Plan,
  Product,
  Service,
  ServiceKey,
  UniData,
  User,
  UserNotification,
} from "./types";

export const SERVICE_META: Record<ServiceKey, { name: string; emoji: string; tone: string }> = {
  medical: { name: "Medical Management", emoji: "🏥", tone: "blue" },
  grocery: { name: "Grocery Management", emoji: "🛒", tone: "emerald" },
  beauty: { name: "Beauty Management", emoji: "💄", tone: "violet" },
  stationery: { name: "Stationery Management", emoji: "✏️", tone: "amber" },
  combined: { name: "Combined Management", emoji: "🧩", tone: "indigo" },
};

const services: Service[] = [
  {
    id: "svc-medical",
    key: "medical",
    name: "Medical Management",
    emoji: "🏥",
    description: "Clinics, pharmacies and diagnostic labs — records, inventory and billing.",
    enabled: true,
  },
  {
    id: "svc-grocery",
    key: "grocery",
    name: "Grocery Management",
    emoji: "🛒",
    description: "Stock, suppliers and daily sales for neighbourhood grocery stores.",
    enabled: true,
  },
  {
    id: "svc-beauty",
    key: "beauty",
    name: "Beauty Management",
    emoji: "💄",
    description: "Salon appointments, stylists and product inventory in one place.",
    enabled: true,
  },
  {
    id: "svc-stationery",
    key: "stationery",
    name: "Stationery Management",
    emoji: "✏️",
    description: "Catalogue, bulk orders and school-season demand planning.",
    enabled: true,
  },
  {
    id: "svc-combined",
    key: "combined",
    name: "Combined Management",
    emoji: "🧩",
    description: "Everything UniManage offers, bundled for multi-store businesses.",
    enabled: true,
  },
];

const plans: Plan[] = [
  {
    id: "plan-med-basic",
    name: "Medical Basic",
    service: "medical",
    description: "Everything a small clinic needs to get organised.",
    price: 499,
    period: "monthly",
    features: ["Up to 3 staff accounts", "Patient records", "Basic billing", "Email support"],
    active: true,
    createdAt: "2026-01-12",
  },
  {
    id: "plan-med-pro",
    name: "Medical Pro",
    service: "medical",
    description: "For busy practices that need depth and speed.",
    price: 999,
    period: "monthly",
    features: [
      "Unlimited users",
      "Advanced analytics",
      "Medical records",
      "Priority support",
      "Inventory automation",
    ],
    active: true,
    createdAt: "2026-01-12",
  },
  {
    id: "plan-gro-basic",
    name: "Grocery Basic",
    service: "grocery",
    description: "Simple stock and sales tracking for a single store.",
    price: 299,
    period: "monthly",
    features: ["Single outlet", "Stock alerts", "Daily sales report"],
    active: true,
    createdAt: "2026-01-18",
  },
  {
    id: "plan-gro-pro",
    name: "Grocery Pro",
    service: "grocery",
    description: "Multi-outlet grocery operations with supplier tools.",
    price: 599,
    period: "monthly",
    features: ["Up to 5 outlets", "Supplier ledger", "Advanced analytics", "Priority support"],
    active: true,
    createdAt: "2026-01-18",
  },
  {
    id: "plan-bea-basic",
    name: "Beauty Basic",
    service: "beauty",
    description: "Appointments and stylist schedules made painless.",
    price: 399,
    period: "monthly",
    features: ["Appointment calendar", "Up to 4 stylists", "SMS reminders"],
    active: true,
    createdAt: "2026-02-02",
  },
  {
    id: "plan-bea-pro",
    name: "Beauty Pro",
    service: "beauty",
    description: "Full salon suite with loyalty and campaigns.",
    price: 799,
    period: "monthly",
    features: ["Unlimited stylists", "Loyalty programme", "Campaign tools", "Priority support"],
    active: true,
    createdAt: "2026-02-02",
  },
  {
    id: "plan-sta-basic",
    name: "Stationery Basic",
    service: "stationery",
    description: "Catalogue and order basics for small shops.",
    price: 299,
    period: "monthly",
    features: ["Product catalogue", "Order tracking", "Email support"],
    active: true,
    createdAt: "2026-02-14",
  },
  {
    id: "plan-sta-pro",
    name: "Stationery Pro",
    service: "stationery",
    description: "Bulk ordering and season planning for distributors.",
    price: 699,
    period: "monthly",
    features: ["Bulk orders", "Season forecasting", "Advanced analytics", "Priority support"],
    active: true,
    createdAt: "2026-02-14",
  },
  {
    id: "plan-com-growth",
    name: "Combined Growth",
    service: "combined",
    description: "Two or more services bundled at a friendlier price.",
    price: 1499,
    period: "quarterly",
    features: ["All services", "Unified dashboard", "Advanced analytics", "Priority support"],
    active: true,
    createdAt: "2026-03-01",
  },
  {
    id: "plan-com-enterprise",
    name: "Combined Enterprise",
    service: "combined",
    description: "For groups running many outlets across categories.",
    price: 8999,
    period: "yearly",
    features: [
      "Unlimited everything",
      "Dedicated success manager",
      "Custom reports",
      "99.9% uptime SLA",
      "Onboarding assistance",
    ],
    active: false,
    createdAt: "2026-03-20",
  },
];

const NAMES: Array<[string, string]> = [
  ["Rahul Sharma", "rahul"],
  ["Priya Nair", "priya"],
  ["Amit Verma", "amit"],
  ["Sneha Iyer", "sneha"],
  ["Vikram Desai", "vikram"],
  ["Ananya Bose", "ananya"],
  ["Karan Mehta", "karan"],
  ["Divya Rao", "divya"],
  ["Rohit Kulkarni", "rohit"],
  ["Meera Joshi", "meera"],
  ["Arjun Pillai", "arjun"],
  ["Fatima Sheikh", "fatima"],
  ["Nikhil Chawla", "nikhil"],
  ["Ishita Ghosh", "ishita"],
  ["Manish Patel", "manish"],
  ["Tanya Bhatt", "tanya"],
  ["Suresh Reddy", "suresh"],
  ["Neha Kapoor", "neha"],
  ["Aditya Menon", "aditya"],
  ["Pooja Singh", "pooja"],
  ["Harsh Vardhan", "harsh"],
  ["Ritika Jain", "ritika"],
  ["Sameer Qureshi", "sameer"],
  ["Lakshmi Prasad", "lakshmi"],
  ["Gaurav Malhotra", "gaurav"],
  ["Kavya Suresh", "kavya"],
  ["Imran Ali", "imran"],
  ["Shreya Dutta", "shreya"],
];

const EXPIRY_OFFSETS = [
  380, 210, -12, 5, 96, 22, -45, 140, 3, 61, 28, 190, -6, 74, 15, 250, 9, 120, -30, 41,
  310, 18, 88, -3, 165, 26, 52, 400,
];

function buildUsers(): User[] {
  const today = new Date();
  return NAMES.map(([name, handle], i) => {
    const plan = plans[i % plans.length]!;
    const offset = EXPIRY_OFFSETS[i % EXPIRY_OFFSETS.length]!;
    const expiry = addDays(today, offset);
    const start = addMonths(expiry, -6);
    return {
      id: `usr-${i + 1}`,
      name,
      email: `${handle}@example.com`,
      phone: `+91 9${(800000000 + i * 1234567).toString().slice(0, 9)}`,
      username: handle,
      status: i % 9 === 4 ? "inactive" : "active",
      role: "USER",
      service: plan.service,
      planId: plan.id,
      startDate: iso(start),
      expiryDate: iso(expiry),
      businessName: `${name.split(" ")[0]}'s ${plan.service.toUpperCase()} Store`,
      businessAddress: `Suite ${100 + i * 4}, MG Road, Mumbai, IN`,
      createdAt: iso(addDays(start, -3)),
    } satisfies User;
  });
}

function buildPayments(users: User[]): Payment[] {
  const methods: Payment["method"][] = ["UPI", "Card", "Net Banking", "Wallet"];
  const statuses: Payment["status"][] = [
    "paid",
    "paid",
    "paid",
    "pending",
    "paid",
    "failed",
    "paid",
    "refunded",
  ];
  const out: Payment[] = [];
  const today = new Date();
  for (let i = 0; i < 36; i++) {
    const user = users[i % users.length]!;
    const plan = plans.find((p) => p.id === user.planId)!;
    out.push({
      id: `pay-${i + 1}`,
      txnId: `TXN-2026-${(4820 + i * 7).toString().padStart(5, "0")}`,
      userId: user.id,
      planId: plan.id,
      service: plan.service,
      amount: plan.price,
      date: iso(addDays(today, -(i * 5 + 1))),
      method: methods[i % methods.length]!,
      status: statuses[i % statuses.length]!,
    });
  }
  return out;
}

function buildLogs(users: User[]): ActivityLog[] {
  const now = Date.now();
  const seeds: Array<[string, string, ActivityLog["status"]]> = [
    ["Created a new user account", users[0]!.name, "success"],
    ["Updated the Medical Pro plan", "Medical Pro", "success"],
    ["Assigned Grocery Pro subscription", users[1]!.name, "success"],
    ["Deactivated an account", users[4]!.name, "warning"],
    ["Renewed a subscription", users[3]!.name, "success"],
    ["Deleted a user account", "Amit Kumar", "warning"],
    ["Created the Combined Growth plan", "Combined Growth", "success"],
    ["Payment retry failed", "TXN-2026-04862", "failed"],
    ["Enabled the Beauty Management service", "Beauty Management", "success"],
    ["Exported the monthly revenue report", "August 2026", "success"],
  ];
  return seeds.map((s, i) => ({
    id: `log-${i + 1}`,
    at: new Date(now - (i + 1) * 3600_000 * 5).toISOString(),
    action: s[0]!,
    admin: "Super Admin",
    target: s[1]!,
    status: s[2]!,
  }));
}

function buildProducts(users: User[]): Product[] {
  const sampleProducts = [
    { name: "Paracetamol 500mg (10s)", category: "Medicines", price: 45, stock: 120, low: 20 },
    { name: "Amoxicillin 250mg", category: "Antibiotics", price: 110, stock: 14, low: 20 },
    { name: "Basmati Rice 5kg", category: "Grains", price: 450, stock: 45, low: 10 },
    { name: "Fortune Sunflower Oil 1L", category: "Oils", price: 165, stock: 8, low: 15 },
    { name: "Matte Lipstick Coral", category: "Cosmetics", price: 399, stock: 25, low: 5 },
    { name: "Hair Care Serum 100ml", category: "Hair Care", price: 549, stock: 4, low: 10 },
    { name: "Classmate Notebook A4", category: "Paper", price: 85, stock: 200, low: 30 },
    { name: "Reynolds Ballpen (Blue)", category: "Pens", price: 10, stock: 500, low: 50 },
  ];

  const out: Product[] = [];
  let counter = 1;
  users.forEach((user) => {
    sampleProducts.forEach((p, idx) => {
      out.push({
        id: `prod-${counter}`,
        userId: user.id,
        name: p.name,
        category: p.category,
        sku: `SKU-${1000 + counter}`,
        price: p.price,
        stock: p.stock + (counter % 10),
        lowStockThreshold: p.low,
        description: `High quality item for ${user.businessName || "store"}.`,
        createdAt: iso(addDays(new Date(), -counter)),
      });
      counter++;
    });
  });
  return out;
}

function buildCategories(users: User[]): Category[] {
  const cats = ["Medicines", "Antibiotics", "Grains", "Oils", "Cosmetics", "Hair Care", "Paper", "Pens"];
  const out: Category[] = [];
  let counter = 1;
  users.forEach((user) => {
    cats.forEach((c) => {
      out.push({
        id: `cat-${counter}`,
        userId: user.id,
        name: c,
        description: `All items under ${c}`,
        createdAt: iso(addDays(new Date(), -10)),
      });
      counter++;
    });
  });
  return out;
}

function buildCustomers(users: User[]): Customer[] {
  const clientNames = ["Aarav Gupta", "Sunita Sharma", "Rakesh Verma", "Deepa Mehta", "Kunal Shah"];
  const out: Customer[] = [];
  let counter = 1;
  users.forEach((user) => {
    clientNames.forEach((cName, idx) => {
      out.push({
        id: `cust-${counter}`,
        userId: user.id,
        name: cName,
        email: `${cName.toLowerCase().replace(" ", ".")}@client.com`,
        phone: `+91 99${(10000000 + counter * 54321).toString().slice(0, 8)}`,
        businessName: `${cName} Enterprise`,
        address: `${12 + idx} Commercial Hub, Bandra West`,
        createdAt: iso(addDays(new Date(), -idx * 3)),
      });
      counter++;
    });
  });
  return out;
}

function buildInvoices(users: User[]): Invoice[] {
  const statuses: Invoice["status"][] = ["PAID", "PAID", "PENDING", "OVERDUE", "CANCELLED"];
  const out: Invoice[] = [];
  let counter = 1;
  const today = new Date();
  users.forEach((user) => {
    for (let i = 1; i <= 3; i++) {
      out.push({
        id: `inv-${counter}`,
        userId: user.id,
        customerId: `cust-${counter}`,
        customerName: `Client ${counter}`,
        invoiceNumber: `INV-2026-${(100 + counter).toString()}`,
        items: [
          { description: "Product Supply / Service", quantity: 2, unitPrice: 250, total: 500 },
          { description: "Maintenance & Handling", quantity: 1, unitPrice: 150, total: 150 },
        ],
        totalAmount: 650,
        status: statuses[counter % statuses.length]!,
        date: iso(addDays(today, -i * 4)),
        dueDate: iso(addDays(today, i * 10)),
        createdAt: iso(addDays(today, -i * 4)),
      });
      counter++;
    }
  });
  return out;
}

function buildNotifications(users: User[]): UserNotification[] {
  const out: UserNotification[] = [];
  let counter = 1;
  users.forEach((user) => {
    out.push(
      {
        id: `notif-${counter++}`,
        userId: user.id,
        title: "Welcome to UniManage!",
        message: "Your subscription and business workspace are active.",
        type: "system",
        read: true,
        createdAt: iso(addDays(new Date(), -15)),
      },
      {
        id: `notif-${counter++}`,
        userId: user.id,
        title: "Low Stock Alert",
        message: "Fortune Sunflower Oil stock is below the threshold limit (8 remaining).",
        type: "stock",
        read: false,
        createdAt: iso(addDays(new Date(), -2)),
      },
      {
        id: `notif-${counter++}`,
        userId: user.id,
        title: "Payment Received",
        message: "Your recent subscription renewal payment of ₹999 was processed successfully.",
        type: "payment",
        read: false,
        createdAt: iso(addDays(new Date(), -1)),
      },
    );
  });
  return out;
}

export function createSeedData(): UniData {
  return {
    users: [],
    plans,
    services,
    payments: [],
    logs: [],
    products: [],
    categories: [],
    customers: [],
    invoices: [],
    notifications: [],
  };
}
