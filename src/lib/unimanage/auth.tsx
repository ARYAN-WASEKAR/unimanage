import { useClerk, useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface Session {
  username: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isClerk?: boolean;
}

const DEMO = { username: "superadmin", password: "adminpass" };
const KEY = "unimanage.session";
const CLERK_PUBLISHABLE_KEY = import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"];

interface AuthValue {
  session: Session | null;
  ready: boolean;
  signIn: (username: string, password: string, remember: boolean) => Session | null;
  signOut: () => void;
  isClerkActive: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // Safe Clerk hook integration
  let clerkUser: ReturnType<typeof useUser>["user"] = null;
  let isClerkLoaded = false;
  let clerkObj: ReturnType<typeof useClerk> | null = null;

  try {
    const userRes = useUser();
    clerkUser = userRes.user;
    isClerkLoaded = userRes.isLoaded;
    clerkObj = useClerk();
  } catch {
    // ClerkProvider not mounted or not active
  }

  const isClerkConfigured = Boolean(
    CLERK_PUBLISHABLE_KEY &&
    CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
    !CLERK_PUBLISHABLE_KEY.includes("YOUR_CLERK_PUBLISHABLE_KEY_HERE")
  );

  useEffect(() => {
    let cancelled = false;

    // Check if there is an existing admin/local session in storage
    let localSession: Session | null = null;
    try {
      const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
      if (raw) localSession = JSON.parse(raw) as Session;
    } catch {
      /* ignore corrupt session */
    }

    // If Clerk is configured, wait until Clerk has finished loading before finalizing state
    if (isClerkConfigured && !isClerkLoaded) {
      if (localSession) {
        // If local admin session exists, we can activate it immediately
        setSession(localSession);
        setReady(true);
      }
      return;
    }

    if (isClerkLoaded && clerkUser) {
      const emailStr: string = clerkUser.primaryEmailAddress?.emailAddress || "";
      const usernameStr: string = (
        clerkUser.username ||
        (clerkUser.firstName ? clerkUser.firstName.toLowerCase() : "") ||
        (emailStr ? emailStr.split("@")[0] : "") ||
        "user"
      ) as string;
      const nameStr: string = (clerkUser.fullName || clerkUser.firstName || "User") as string;

      // 1. Instantly activate session to eliminate spinner delay
      const initialClerkSession: Session = {
        username: usernameStr,
        name: nameStr,
        email: emailStr,
        role: "USER",
        avatar: clerkUser.imageUrl,
        isClerk: true,
      };
      setSession(initialClerkSession);
      setReady(true);

      // 2. Perform background check to see if user has SuperAdmin role
      import("@/lib/superadmin.server")
        .then(({ verifySuperAdminAccessFn }) => verifySuperAdminAccessFn({ data: emailStr || usernameStr }))
        .then((res) => {
          if (cancelled) return;
          if (res.isSuperAdmin) {
            setSession((prev) => (prev ? { ...prev, role: res.role } : prev));
          }
        })
        .catch(() => {});

      return () => {
        cancelled = true;
      };
    }

    // Clerk is not logged in, fallback to local session if any
    setSession(localSession);
    setReady(true);

    return () => {
      cancelled = true;
    };
  }, [isClerkConfigured, isClerkLoaded, clerkUser?.id]);

  const signIn: AuthValue["signIn"] = (username, password, remember) => {
    if (username.trim().toLowerCase() !== DEMO.username || password !== DEMO.password) return null;
    const next: Session = {
      username: DEMO.username,
      name: "Super Admin",
      email: "admin@unimanage.app",
      role: "SUPER_ADMIN",
    };
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(next));
    setSession(next);
    return next;
  };

  const signOut = () => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    setSession(null);

    if (clerkObj && clerkUser) {
      clerkObj.signOut().catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        ready,
        signIn,
        signOut,
        isClerkActive: Boolean(clerkUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
