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

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || "admin@unimanage.app";
      const clerkSession: Session = {
        username:
          clerkUser.username ||
          clerkUser.firstName?.toLowerCase() ||
          email.split("@")[0] ||
          "superadmin",
        name: clerkUser.fullName || clerkUser.firstName || "Super Admin",
        email,
        role: "SUPER_ADMIN",
        avatar: clerkUser.imageUrl,
        isClerk: true,
      };
      setSession(clerkSession);
      setReady(true);
      return;
    }

    try {
      const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore corrupt session */
    }
    setReady(true);
  }, [isClerkLoaded, clerkUser]);

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
