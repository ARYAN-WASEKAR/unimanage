import {
  Activity,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview and metrics" },
  { to: "/admin/superadmins", label: "Super Admins", icon: ShieldCheck, description: "Manage SuperAdmin accounts" },
  { to: "/admin/users", label: "Users", icon: Users, description: "Manage customer accounts" },
  { to: "/admin/plans", label: "Subscription Plans", icon: Package, description: "Pricing and packaging" },
  { to: "/admin/logs", label: "Activity Logs", icon: Activity, description: "System & admin activity" },
  { to: "/admin/settings", label: "Settings", icon: Settings, description: "Profile and workspace configuration" },
];
