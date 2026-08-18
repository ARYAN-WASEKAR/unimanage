import type { FeatureFlag, Plan, User } from "./types";

export const ALL_FEATURES: FeatureFlag[] = [
  "dashboard",
  "inventory",
  "products",
  "categories",
  "customers",
  "billing",
  "reports",
  "analytics",
  "advanced_reports",
  "notifications",
];

// Default features mapped to plans if plan features array doesn't specify explicit keys
export function getPlanFeatures(plan?: Plan | null): FeatureFlag[] {
  if (!plan) return ["dashboard", "notifications"];
  const list: FeatureFlag[] = ["dashboard", "notifications"];

  const planName = plan.name.toLowerCase();

  if (planName.includes("pro") || planName.includes("growth") || planName.includes("enterprise")) {
    return [
      "dashboard",
      "inventory",
      "products",
      "categories",
      "customers",
      "billing",
      "reports",
      "analytics",
      "advanced_reports",
      "notifications",
    ];
  }

  // Basic plans
  list.push("inventory", "products", "categories", "customers", "billing", "reports");
  return list;
}

export function hasFeature(user: User | null, plan: Plan | null, feature: FeatureFlag): boolean {
  if (!user) return false;
  // SuperAdmin has access to everything
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;

  const features = getPlanFeatures(plan);
  return features.includes(feature);
}

export function getUserSubscriptionState(user: User | null): "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" {
  if (!user) return "EXPIRED";
  if (user.status === "inactive") return "EXPIRED";

  const expiry = new Date(user.expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));

  if (diffDays < 0) return "EXPIRED";
  if (diffDays <= 7) return "EXPIRING_SOON";
  return "ACTIVE";
}
