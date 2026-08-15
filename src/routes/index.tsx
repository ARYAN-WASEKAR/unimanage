import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/unimanage/auth";
import { useTheme } from "@/lib/unimanage/theme";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — UniManage SuperAdmin" },
      {
        name: "description",
        content: "Sign in to UniManage and manage your users, plans and services from one place.",
      },
    ],
  }),
  component: LoginPage,
});

const CLERK_PUBLISHABLE_KEY = import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"];

function LoginPage() {
  const { signIn, session, ready } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  // Clerk hook safety check
  let isClerkUserActive = false;
  try {
    const { isSignedIn } = useUser();
    isClerkUserActive = Boolean(isSignedIn);
  } catch {
    /* ClerkProvider not active */
  }

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const hasValidClerkKey =
    CLERK_PUBLISHABLE_KEY &&
    CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
    !CLERK_PUBLISHABLE_KEY.includes("YOUR_CLERK_PUBLISHABLE_KEY_HERE");

  useEffect(() => {
    if (ready && (session || isClerkUserActive)) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [ready, session, isClerkUserActive, navigate]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning("Please enter both your username and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = signIn(username, password, remember);
      setLoading(false);
      if (!result) {
        toast.error("Those details didn’t match. Please try again.");
        return;
      }
      toast.success("Welcome back, Super Admin 👋");
      navigate({ to: "/admin/dashboard" });
    }, 550);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--chart-5)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--chart-2)" }}
        />
        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15 text-lg font-bold backdrop-blur">
            U
          </span>
          <span className="text-lg font-semibold tracking-tight">UniManage</span>
          <Badge className="bg-primary-foreground/20 text-primary-foreground border-none font-normal text-xs ml-2">
            Clerk Auth Ready
          </Badge>
        </div>

        <div className="relative max-w-md space-y-6">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight">
            One calm control room for every customer you serve.
          </h2>
          <p className="text-sm text-primary-foreground/80">
            Medical, grocery, beauty and stationery businesses — their plans, payments and renewals,
            all in one tidy place.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: KeyRound, text: "Clerk Authentication (OAuth, Passkeys, Magic Links)" },
              { icon: Users, text: "Create and manage customers & superadmins in seconds" },
              { icon: CalendarClock, text: "See renewals before they slip away" },
              { icon: ShieldCheck, text: "Role-based access, built for admins" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-primary-foreground/12">
                  <f.icon className="size-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          © 2026 UniManage. Powered by Clerk & MongoDB.
        </p>
      </aside>

      {/* Form / Authentication panel */}
      <main className="relative flex items-center justify-center bg-background px-5 py-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
          className="absolute top-5 right-5 rounded-full"
        >
          {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </Button>

        <div className="w-full max-w-md animate-rise">
          <div className="mb-6 lg:hidden flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              U
            </span>
            <span className="font-semibold text-lg">UniManage</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl flex items-center gap-2">
              <Lock className="size-6 text-primary" />
              Sign in to UniManage
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage users, superadmin accounts, plans, and MongoDB datasets.
            </p>
          </div>

          <Tabs defaultValue={hasValidClerkKey ? "clerk" : "standard"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="clerk" className="gap-2">
                <UserCheck className="size-4" />
                Clerk Authentication
              </TabsTrigger>
              <TabsTrigger value="standard" className="gap-2">
                <Lock className="size-4" />
                Admin Credentials
              </TabsTrigger>
            </TabsList>

            {/* CLERK AUTHENTICATION TAB */}
            <TabsContent value="clerk" className="space-y-4">
              {hasValidClerkKey ? (
                <div className="flex justify-center rounded-xl border border-border bg-card p-4 shadow-soft">
                  <SignIn
                    routing="virtual"
                    appearance={{
                      elements: {
                        rootBox: "w-full shadow-none",
                        card: "bg-transparent shadow-none border-none p-0 w-full",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-primary/30 bg-primary/10">
                    <KeyRound className="size-4 text-primary" />
                    <AlertTitle className="font-semibold">Clerk Auth Configuration Ready</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      To enable live Clerk Sign-In, paste your publishable key into <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-foreground">.env</code>:
                      <div className="mt-2 rounded bg-muted/80 p-2 font-mono text-[11px] text-foreground overflow-x-auto">
                        VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
                      </div>
                    </AlertDescription>
                  </Alert>

                  <Card className="border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You can get your free API key at <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-primary underline font-medium">dashboard.clerk.com</a>. Once pasted, live Clerk authentication (Google, Passkeys, Magic Links) will instantly activate!
                    </p>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* STANDARD ADMIN CREDENTIALS TAB */}
            <TabsContent value="standard">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    autoComplete="username"
                    placeholder="e.g. superadmin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(v) => setRemember(Boolean(v))}
                      aria-label="Remember me"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Password recovery", {
                        description: "Use Clerk authentication or contact workspace admin.",
                      })
                    }
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? "Signing you in…" : "Log in as Super Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Protected workspace · Powered by Clerk Authentication & MongoDB
          </p>
        </div>
      </main>
    </div>
  );
}
