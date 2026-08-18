export type ServiceKey = "medical" | "grocery" | "beauty" | "stationery" | "combined";

export type AccountStatus = "active" | "inactive";

export type BillingPeriod = "monthly" | "quarterly" | "half-yearly" | "yearly" | "custom";

export type SubscriptionState = "active" | "expiring" | "expired";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export type FeatureFlag =
  | "dashboard"
  | "inventory"
  | "products"
  | "categories"
  | "customers"
  | "billing"
  | "reports"
  | "analytics"
  | "advanced_reports"
  | "notifications";

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
  role: UserRole;
  service: ServiceKey;
  planId: string;
  startDate: string;
  expiryDate: string;
  businessName?: string;
  businessAddress?: string;
  avatar?: string;
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

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  businessName?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";
  date: string;
  dueDate: string;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "expiry" | "payment" | "stock" | "system";
  read: boolean;
  createdAt: string;
}

export interface UniData {
  users: User[];
  plans: Plan[];
  services: Service[];
  payments: Payment[];
  logs: ActivityLog[];
  products: Product[];
  categories: Category[];
  customers: Customer[];
  invoices: Invoice[];
  notifications: UserNotification[];
}
