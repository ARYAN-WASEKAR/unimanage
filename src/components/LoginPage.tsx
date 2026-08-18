import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/unimanage/auth";
import { verifySuperAdminAccessFn } from "@/lib/superadmin.server";
import { useTheme } from "@/lib/unimanage/theme";
import { useStore } from "@/lib/unimanage/store";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CLERK_PUBLISHABLE_KEY = import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"];
const CLERK_APPEARANCE = {
  elements: {
    rootBox: "w-full shadow-none",
    card: "bg-transparent shadow-none border-none p-0 w-full",
  },
};

export function LoginPage() {
  const { signIn } = useAuth();
  const { theme, toggle } = useTheme();
  const { log } = useStore();
  const navigate = useNavigate();

  // Mode state: 'split' on desktop, or toggle between 'user' and 'admin' on mobile
  const [activePortal, setActivePortal] = useState<"user" | "admin" | "both">("both");
  const [clerkSubMode, setClerkSubMode] = useState<"signin" | "signup">("signin");

  // Admin Login form fields
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const hasValidClerkKey =
    CLERK_PUBLISHABLE_KEY &&
    CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
    !CLERK_PUBLISHABLE_KEY.includes("YOUR_CLERK_PUBLISHABLE_KEY_HERE");

  // Stable tab switcher handler
  const handlePortalSwitch = (portal: "user" | "admin" | "both") => {
    setActivePortal(portal);
    setAdminError(null);
  };

  // Handle Admin Sign In
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const cleanInput = adminIdentifier.trim();
    if (!cleanInput || !adminPassword) {
      toast.warning("Please enter your Admin username/email and password.");
      return;
    }

    setAdminLoading(true);

    try {
      // 1. Verify SuperAdmin Role against database/whitelist
      const accessCheck = await verifySuperAdminAccessFn({ data: cleanInput });

      if (!accessCheck.isSuperAdmin) {
        setAdminLoading(false);
        const errMsg = "Access Denied: This account does not have administrator privileges. Please use User Login.";
        setAdminError(errMsg);
        log("ADMIN_ACCESS_DENIED", cleanInput, "failed");
        toast.error("Access Denied: Administrator privileges required.");
        return;
      }

      if (accessCheck.status === "inactive") {
        setAdminLoading(false);
        const errMsg = "Account Inactive: Your administrator account has been deactivated. Contact the SuperAdmin.";
        setAdminError(errMsg);
        log("ADMIN_LOGIN_FAILED", cleanInput, "warning");
        toast.error("Account Inactive.");
        return;
      }

      // 2. Perform authentication
      const result = signIn(cleanInput, adminPassword, rememberMe);
      setAdminLoading(false);

      if (!result) {
        const errMsg = "Invalid credentials. Please check your admin username and password.";
        setAdminError(errMsg);
        log("ADMIN_LOGIN_FAILED", cleanInput, "failed");
        toast.error("Invalid admin credentials.");
        return;
      }

      log("ADMIN_LOGIN_SUCCESS", result.username, "success");
      toast.success("Welcome back to Admin Control Room 👋");
      navigate({ to: "/admin/dashboard" });
    } catch (err: any) {
      setAdminLoading(false);
      setAdminError("Authentication error. Please try again.");
      toast.error("Admin sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      {/* GLOBAL BRAND HEADER & PORTAL TOGGLE */}
      <header className="h-20 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-md">
            U
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-lg leading-tight">UniManage</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Unified Management Platform</p>
          </div>
        </div>

        {/* COMPACT PORTAL SELECTOR TOGGLE */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border">
          <Button
            type="button"
            size="sm"
            variant={activePortal === "user" ? "default" : "ghost"}
            onClick={() => handlePortalSwitch("user")}
            className="h-8 text-xs font-semibold rounded-xl gap-1.5 px-3.5"
          >
            <User className="size-3.5" /> User Login
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activePortal === "admin" ? "default" : "ghost"}
            onClick={() => handlePortalSwitch("admin")}
            className="h-8 text-xs font-semibold rounded-xl gap-1.5 px-3.5"
          >
            <ShieldCheck className="size-3.5" /> Admin Login
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activePortal === "both" ? "secondary" : "ghost"}
            onClick={() => handlePortalSwitch("both")}
            className="h-8 text-xs font-semibold rounded-xl hidden lg:inline-flex px-3"
          >
            Split View
          </Button>
        </div>

        {/* THEME TOGGLE */}
        <Button variant="ghost" size="icon" onClick={toggle} className="size-9 rounded-xl">
          {theme === "dark" ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4" />}
        </Button>
      </header>

      {/* MAIN DUAL PORTAL SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="text-center space-y-2 mb-8 max-w-xl mx-auto">
          <Badge variant="outline" className="text-xs px-3 py-1 font-semibold border-primary/30 text-primary">
            Welcome to UniManage
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Choose your portal to sign in
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Separate authentication portals for business customers and system administrators.
          </p>
        </div>

        {/* DUAL PORTAL GRID */}
        <div
          className={`grid gap-6 sm:gap-8 transition-all ${
            activePortal === "user"
              ? "grid-cols-1 max-w-lg mx-auto w-full"
              : activePortal === "admin"
              ? "grid-cols-1 max-w-lg mx-auto w-full"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          {/* USER LOGIN PORTAL */}
          {(activePortal === "both" || activePortal === "user") && (
            <Card className="rounded-3xl border-2 border-border shadow-lg bg-card overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all">
              <CardHeader className="bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-transparent border-b border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-emerald-600 text-white border-none font-bold text-[10px] px-2.5 py-0.5 gap-1 uppercase tracking-wider">
                    <User className="size-3" /> Customer Portal
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Business Accounts
                  </span>
                </div>
                <CardTitle className="text-xl font-black text-foreground">USER LOGIN</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Access your UniManage business account, inventory, and billing workspace
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4 flex-1">
                {hasValidClerkKey ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 border-b border-border/60 pb-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={clerkSubMode === "signin" ? "default" : "outline"}
                        onClick={() => setClerkSubMode("signin")}
                        className="h-8 text-xs font-semibold px-4 rounded-xl"
                      >
                        Sign In
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={clerkSubMode === "signup" ? "default" : "outline"}
                        onClick={() => setClerkSubMode("signup")}
                        className="h-8 text-xs font-semibold px-4 rounded-xl"
                      >
                        Create Account
                      </Button>
                    </div>

                    <div className="flex justify-center rounded-2xl border border-border/80 bg-muted/20 p-4 min-h-[300px]">
                      {clerkSubMode === "signin" ? (
                        <SignIn routing="hash" forceRedirectUrl="/user/dashboard" appearance={CLERK_APPEARANCE} />
                      ) : (
                        <SignUp routing="hash" forceRedirectUrl="/user/dashboard" appearance={CLERK_APPEARANCE} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <Alert className="border-emerald-500/30 bg-emerald-500/10">
                      <KeyRound className="size-4 text-emerald-600" />
                      <AlertTitle className="font-semibold text-xs">Clerk Authentication Enabled</AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        To enable live Clerk Sign-In & Google OAuth, ensure <code className="bg-muted px-1 py-0.5 rounded font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> is set in <code className="bg-muted px-1 py-0.5 rounded font-mono">.env</code>.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>

              <div className="p-4 bg-muted/30 border-t border-border text-center text-xs text-muted-foreground">
                Redirects to <strong className="text-foreground">/user/dashboard</strong> after authentication.
              </div>
            </Card>
          )}

          {/* ADMIN LOGIN PORTAL */}
          {(activePortal === "both" || activePortal === "admin") && (
            <Card className="rounded-3xl border-2 border-border shadow-lg bg-card overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-blue-600/10 to-transparent border-b border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default" className="bg-primary text-primary-foreground font-bold text-[10px] px-2.5 py-0.5 gap-1 uppercase tracking-wider">
                    <ShieldCheck className="size-3" /> Management Portal
                  </Badge>
                  <span className="text-xs font-semibold text-primary">
                    Restricted Access
                  </span>
                </div>
                <CardTitle className="text-xl font-black text-foreground">ADMIN LOGIN</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Authorized administrators and SuperAdmins only
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4 flex-1">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground">
                  <Lock className="size-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">🔐 Protected Administrative Access</span>
                </div>

                {adminError && (
                  <Alert variant="destructive" className="rounded-2xl border-destructive/40 text-xs">
                    <ShieldAlert className="size-4" />
                    <AlertTitle className="font-bold text-xs">Authentication Failed</AlertTitle>
                    <AlertDescription className="text-xs mt-0.5 leading-relaxed">{adminError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-username" className="text-xs font-semibold">
                      Username or Email *
                    </Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="e.g. superadmin"
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      className="h-11 rounded-2xl text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password" className="text-xs font-semibold">
                        Password *
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="h-11 rounded-2xl text-xs pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-admin"
                        checked={rememberMe}
                        onCheckedChange={(c) => setRememberMe(Boolean(c))}
                      />
                      <label htmlFor="remember-admin" className="text-xs text-muted-foreground cursor-pointer font-medium">
                        Remember session
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full h-11 rounded-2xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-md"
                  >
                    {adminLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Signing you in...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" /> Admin Sign In
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <div className="p-4 bg-muted/30 border-t border-border text-center text-xs text-muted-foreground">
                Redirects to <strong className="text-foreground">/admin/dashboard</strong> upon role authorization.
              </div>
            </Card>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/60">
        © 2026 UniManage Platform • Unified Business & SuperAdmin Suite
      </footer>
    </div>
  );
}
