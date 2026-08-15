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
import type { ActivityLog, Payment, Plan, Service, UniData, User } from "./types";

const KEY = "unimanage.data.v1";

/**
 * Demo persistence layer. Every mutation goes through these actions, so swapping
 * localStorage for a real backend later means changing only this file.
 */
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
  log: (action: string, target: string, status?: ActivityLog["status"]) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const EMPTY: UniData = { users: [], plans: [], services: [], payments: [], logs: [] };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UniData>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let next: UniData;
    try {
      const raw = localStorage.getItem(KEY);
      next = raw ? (JSON.parse(raw) as UniData) : createSeedData();
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
        { id: `log-${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), action, admin: "Super Admin", target, status },
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
      deleteUser: (uid) =>
        setData((d) => ({ ...d, users: d.users.filter((u) => u.id !== uid) })),
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
