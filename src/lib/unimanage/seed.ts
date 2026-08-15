import { addDays, addMonths, iso } from "./dates";
import type {
  ActivityLog,
  Payment,
  Plan,
  Service,
  ServiceKey,
  UniData,
  User,
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

// Deterministic offsets so the demo always shows a healthy mix of statuses.
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
      service: plan.service,
      planId: plan.id,
      startDate: iso(start),
      expiryDate: iso(expiry),
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

export function createSeedData(): UniData {
  const users = buildUsers();
  return {
    users,
    plans,
    services,
    payments: buildPayments(users),
    logs: buildLogs(users),
  };
}
