import type { SubscriptionState, User } from "./types";

export function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function subscriptionState(expiry: string): SubscriptionState {
  const d = daysUntil(expiry);
  if (d < 0) return "expired";
  if (d <= 30) return "expiring";
  return "active";
}

export function userState(user: User): SubscriptionState | "inactive" {
  if (user.status === "inactive") return "inactive";
  return subscriptionState(user.expiryDate);
}

export function remainingLabel(expiry: string) {
  const d = daysUntil(expiry);
  if (d < 0) return `Ended ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} ago`;
  if (d === 0) return "Ends today";
  return `${d} day${d === 1 ? "" : "s"} remaining`;
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(isoStr: string) {
  return new Date(isoStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export function monthsForPeriod(period: string) {
  switch (period) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "half-yearly":
      return 6;
    case "yearly":
      return 12;
    default:
      return 1;
  }
}
