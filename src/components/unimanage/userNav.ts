import type { FeatureFlag } from "@/lib/unimanage/types";
import {
  Bell,
  CreditCard,
  FileText,
  FolderTree,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export interface UserNavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  feature?: FeatureFlag;
  badge?: string;
  children?: Array<{
    to: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    feature?: FeatureFlag;
  }>;
}

export const USER_NAV_ITEMS: UserNavItem[] = [
  {
    to: "/user/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    feature: "dashboard",
  },
  {
    to: "/user/inventory/products",
    label: "Inventory",
    icon: Package,
    feature: "inventory",
    children: [
      {
        to: "/user/inventory/products",
        label: "Products",
        icon: Package,
        feature: "products",
      },
      {
        to: "/user/inventory/categories",
        label: "Categories",
        icon: FolderTree,
        feature: "categories",
      },
    ],
  },
  {
    to: "/user/customers",
    label: "Customers",
    icon: Users,
    feature: "customers",
  },
  {
    to: "/user/billing",
    label: "Billing",
    icon: Receipt,
    feature: "billing",
  },
  {
    to: "/user/reports",
    label: "Reports",
    icon: FileText,
    feature: "reports",
  },
  {
    to: "/user/subscription",
    label: "Subscription",
    icon: ShieldCheck,
  },
  {
    to: "/user/payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    to: "/user/notifications",
    label: "Notifications",
    icon: Bell,
    feature: "notifications",
  },
  {
    to: "/user/profile",
    label: "Profile",
    icon: User,
  },
  {
    to: "/user/settings",
    label: "Settings",
    icon: Settings,
  },
];
