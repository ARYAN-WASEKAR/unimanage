import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedData } from "./seed";
import type {
  ActivityLog,
  Category,
  Customer,
  Invoice,
  Payment,
  Plan,
  Product,
  Service,
  UniData,
  User,
  UserNotification,
} from "./types";

const KEY = "unimanage.data.v3";

interface StoreValue extends UniData {
  hydrated: boolean;
  addUser: (u: Omit<User, "id" | "createdAt">) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addPlan: (p: Omit<Plan, "id" | "createdAt">) => Plan;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  addService: (s: Omit<Service, "id">) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  addPayment: (p: Omit<Payment, "id">) => void;
  // Product CRUD
  addProduct: (p: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Category CRUD
  addCategory: (c: Omit<Category, "id" | "createdAt">) => Category;
  deleteCategory: (id: string) => void;
  // Customer CRUD
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // Invoice CRUD
  addInvoice: (inv: Omit<Invoice, "id" | "createdAt">) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  deleteNotification: (id: string) => void;
  log: (action: string, target: string, status?: ActivityLog["status"]) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const EMPTY: UniData = {
  users: [],
  plans: [],
  services: [],
  payments: [],
  logs: [],
  products: [],
  categories: [],
  customers: [],
  invoices: [],
  notifications: [],
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UniData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let next: UniData;
    try {
      const raw = localStorage.getItem(KEY);
      next = raw ? (JSON.parse(raw) as UniData) : createSeedData();
      if (!next.products || next.products.length === 0) {
        next = createSeedData();
      }
    } catch {
      next = createSeedData();
    }
    setData(next);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

  const log = useCallback<StoreValue["log"]>((action, target, status = "success") => {
    setData((d) => ({
      ...d,
      logs: [
        {
          id: `log-${Math.random().toString(36).slice(2, 9)}`,
          at: new Date().toISOString(),
          action,
          admin: "Super Admin",
          target,
          status,
        },
        ...d.logs,
      ].slice(0, 200),
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      hydrated,
      addUser: (u) => {
        const user: User = { ...u, id: id("usr"), createdAt: new Date().toISOString().slice(0, 10) };
        setData((d) => ({ ...d, users: [user, ...d.users] }));
        log("Created a new user account", user.name);
        return user;
      },
      updateUser: (uid, patch) =>
        setData((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === uid ? { ...u, ...patch } : u)),
        })),
      deleteUser: (uid) => setData((d) => ({ ...d, users: d.users.filter((u) => u.id !== uid) })),
      addPlan: (p) => {
        const plan: Plan = { ...p, id: id("plan"), createdAt: new Date().toISOString().slice(0, 10) };
        setData((d) => ({ ...d, plans: [plan, ...d.plans] }));
        log("Created a subscription plan", plan.name);
        return plan;
      },
      updatePlan: (pid, patch) =>
        setData((d) => ({ ...d, plans: d.plans.map((p) => (p.id === pid ? { ...p, ...patch } : p)) })),
      deletePlan: (pid) => setData((d) => ({ ...d, plans: d.plans.filter((p) => p.id !== pid) })),
      addService: (s) => setData((d) => ({ ...d, services: [...d.services, { ...s, id: id("svc") }] })),
      updateService: (sid, patch) =>
        setData((d) => ({
          ...d,
          services: d.services.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
        })),
      addPayment: (p) => setData((d) => ({ ...d, payments: [{ ...p, id: id("pay") }, ...d.payments] })),

      // Product CRUD
      addProduct: (p) => {
        const prod: Product = {
          ...p,
          id: id("prod"),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setData((d) => ({ ...d, products: [prod, ...(d.products || [])] }));
        return prod;
      },
      updateProduct: (pid, patch) =>
        setData((d) => ({
          ...d,
          products: (d.products || []).map((prod) =>
            prod.id === pid
              ? { ...prod, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
              : prod,
          ),
        })),
      deleteProduct: (pid) =>
        setData((d) => ({ ...d, products: (d.products || []).filter((prod) => prod.id !== pid) })),

      // Category CRUD
      addCategory: (c) => {
        const cat: Category = {
          ...c,
          id: id("cat"),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setData((d) => ({ ...d, categories: [cat, ...(d.categories || [])] }));
        return cat;
      },
      deleteCategory: (cid) =>
        setData((d) => ({ ...d, categories: (d.categories || []).filter((cat) => cat.id !== cid) })),

      // Customer CRUD
      addCustomer: (c) => {
        const cust: Customer = {
          ...c,
          id: id("cust"),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setData((d) => ({ ...d, customers: [cust, ...(d.customers || [])] }));
        return cust;
      },
      updateCustomer: (cid, patch) =>
        setData((d) => ({
          ...d,
          customers: (d.customers || []).map((cust) =>
            cust.id === cid ? { ...cust, ...patch } : cust,
          ),
        })),
      deleteCustomer: (cid) =>
        setData((d) => ({ ...d, customers: (d.customers || []).filter((cust) => cust.id !== cid) })),

      // Invoice CRUD
      addInvoice: (inv) => {
        const newInv: Invoice = {
          ...inv,
          id: id("inv"),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setData((d) => ({ ...d, invoices: [newInv, ...(d.invoices || [])] }));
        return newInv;
      },
      updateInvoiceStatus: (invid, status) =>
        setData((d) => ({
          ...d,
          invoices: (d.invoices || []).map((inv) =>
            inv.id === invid ? { ...inv, status } : inv,
          ),
        })),

      // Notifications
      markNotificationRead: (nid) =>
        setData((d) => ({
          ...d,
          notifications: (d.notifications || []).map((n) =>
            n.id === nid ? { ...n, read: true } : n,
          ),
        })),
      markAllNotificationsRead: (uid) =>
        setData((d) => ({
          ...d,
          notifications: (d.notifications || []).map((n) =>
            n.userId === uid ? { ...n, read: true } : n,
          ),
        })),
      deleteNotification: (nid) =>
        setData((d) => ({
          ...d,
          notifications: (d.notifications || []).filter((n) => n.id !== nid),
        })),

      log,
      reset: () => setData(createSeedData()),
    }),
    [data, hydrated, log],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function usePlanMap() {
  const { plans } = useStore();
  return useMemo(() => Object.fromEntries(plans.map((p) => [p.id, p])), [plans]);
}
