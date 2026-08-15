import { subscriptionState } from "./dates";
import { SERVICE_META } from "./seed";
import type { Payment, Plan, ServiceKey, User } from "./types";

export function statusCounts(users: User[]) {
  let active = 0;
  let expiring = 0;
  let expired = 0;
  let inactive = 0;
  for (const u of users) {
    if (u.status === "inactive") inactive++;
    const s = subscriptionState(u.expiryDate);
    if (s === "active") active++;
    else if (s === "expiring") expiring++;
    else expired++;
  }
  return { active, expiring, expired, inactive };
}

export function monthlyRevenue(payments: Payment[]) {
  const now = new Date();
  const month = now.getMonth();
  return payments
    .filter((p) => p.status === "paid" && new Date(p.date).getMonth() === month)
    .reduce((sum, p) => sum + p.amount, 0);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

export function growthSeries(users: User[]) {
  const total = users.length;
  const base = Math.max(6, Math.round(total * 0.42));
  return MONTHS.map((month, i) => ({
    month,
    users: Math.round(base + ((total - base) * (i + 1)) / MONTHS.length),
  }));
}

export function revenueSeries(payments: Payment[]) {
  const paid = payments.filter((p) => p.status === "paid");
  return MONTHS.map((month, i) => {
    const monthly = paid
      .filter((p) => new Date(p.date).getMonth() === i)
      .reduce((s, p) => s + p.amount, 0);
    // Demo fallback so the chart always tells a story.
    return { month, revenue: monthly || 42000 + i * 7400 + (i % 3) * 3100 };
  });
}

export function serviceDistribution(users: User[]) {
  const keys: ServiceKey[] = ["medical", "grocery", "beauty", "stationery", "combined"];
  return keys
    .map((k) => ({
      name: SERVICE_META[k].name.replace(" Management", ""),
      value: users.filter((u) => u.service === k).length,
    }))
    .filter((d) => d.value > 0);
}

export function revenueByService(payments: Payment[]) {
  const keys: ServiceKey[] = ["medical", "grocery", "beauty", "stationery", "combined"];
  return keys
    .map((k) => ({
      name: SERVICE_META[k].name.replace(" Management", ""),
      value: payments
        .filter((p) => p.status === "paid" && p.service === k)
        .reduce((s, p) => s + p.amount, 0),
    }))
    .filter((d) => d.value > 0);
}

export function revenueByPlan(payments: Payment[], plans: Plan[]) {
  return plans
    .map((plan) => ({
      name: plan.name,
      value: payments
        .filter((p) => p.status === "paid" && p.planId === plan.id)
        .reduce((s, p) => s + p.amount, 0),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
