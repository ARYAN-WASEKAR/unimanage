import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/unimanage/AdminShell";
import { useAuth } from "@/lib/unimanage/auth";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, ShieldAlert, UserX } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { session, ready, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/", replace: true });
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Access Guard: Block non-SuperAdmin / non-Admin users
  if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-6 text-center animate-rise">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive shadow-soft">
            <ShieldAlert className="size-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Access Denied
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SuperAdmin Approval Required
            </p>
          </div>

          <Alert className="border-destructive/30 bg-destructive/5 text-left">
            <UserX className="size-4 text-destructive" />
            <AlertTitle className="font-semibold text-destructive">Unauthorized Account</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Your account (<strong className="text-foreground">{session.email || session.username}</strong>) does not have SuperAdmin permissions. SuperAdmin access can <strong>ONLY</strong> be granted by an existing authorized SuperAdmin from the SuperAdmin Management console.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="default"
              onClick={() => navigate({ to: "/user/dashboard" })}
              className="gap-2 h-11 w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Go to User Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                signOut();
                toast.info("Logged out successfully.");
                navigate({ to: "/" });
              }}
              className="gap-2 h-10 w-full font-semibold text-xs"
            >
              <LogOut className="size-3.5" /> Sign Out & Try Another Account
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Contact your workspace administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
