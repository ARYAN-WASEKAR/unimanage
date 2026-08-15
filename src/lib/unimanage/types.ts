export type ServiceKey = "medical" | "grocery" | "beauty" | "stationery" | "combined";

export type AccountStatus = "active" | "inactive";

export type BillingPeriod = "monthly" | "quarterly" | "half-yearly" | "yearly" | "custom";

export type SubscriptionState = "active" | "expiring" | "expired";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface Service {
  id: string;
  key: ServiceKey;
  name: string;
  emoji: string;
  description: string;
  enabled: boolean;
}

export interface Plan {
  id: string;
  name: string;
  service: ServiceKey;
  description: string;
  price: number;
  period: BillingPeriod;
  features: string[];
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  status: AccountStatus;
  service: ServiceKey;
  planId: string;
  startDate: string;
  expiryDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  txnId: string;
  userId: string;
  planId: string;
  service: ServiceKey;
  amount: number;
  date: string;
  method: "UPI" | "Card" | "Net Banking" | "Wallet";
  status: PaymentStatus;
}

export interface ActivityLog {
  id: string;
  at: string;
  action: string;
  admin: string;
  target: string;
  status: "success" | "warning" | "failed";
}

export interface UniData {
  users: User[];
  plans: Plan[];
  services: Service[];
  payments: Payment[];
  logs: ActivityLog[];
}
