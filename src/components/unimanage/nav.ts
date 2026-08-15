import {
  Activity,
  BarChart3,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
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
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Today at a glance" },
  { to: "/admin/superadmins", label: "Super Admins", icon: ShieldCheck, description: "Manage MongoDB SuperAdmin accounts" },
  { to: "/admin/users", label: "Users", icon: Users, description: "Manage your users" },
  { to: "/admin/plans", label: "Subscription Plans", icon: Package, description: "Pricing and packaging" },
  { to: "/admin/services", label: "Services", icon: Sparkles, description: "What UniManage offers" },
  { to: "/admin/payments", label: "Payments", icon: CreditCard, description: "Money in, month by month" },
  { to: "/admin/expiring", label: "Expiring Plans", icon: CalendarClock, description: "Who needs a nudge" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, description: "Growth and revenue" },
  { to: "/admin/logs", label: "Activity Logs", icon: Activity, description: "Every admin action" },
  { to: "/admin/settings", label: "Settings", icon: Settings, description: "Your workspace" },
];

