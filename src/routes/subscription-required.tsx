import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/unimanage/auth";
import { useStore } from "@/lib/unimanage/store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Clock, CreditCard, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/subscription-required")({
  component: SubscriptionRequiredPage,
});

function SubscriptionRequiredPage() {
  const { session, signOut } = useAuth();
  const { users, updateUser } = useStore();
  const navigate = useNavigate();

  const user = session
    ? users.find(
        (u) =>
          u.email.toLowerCase() === session.email.toLowerCase() ||
          u.username.toLowerCase() === session.username.toLowerCase(),
      )
    : users[0];

  const handleQuickRenew = () => {
    const nextExpiry = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

    if (user) {
      updateUser(user.id, {
        expiryDate: nextExpiry,
        status: "active",
      });
    } else if (users.length > 0) {
      users.forEach((u) => {
        updateUser(u.id, { expiryDate: nextExpiry, status: "active" });
      });
    }

    toast.success("Subscription renewed! Workspace unlocked 🎉");
    navigate({ to: session?.role === "SUPER_ADMIN" || session?.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <Card className="w-full max-w-md rounded-3xl border-border shadow-xl text-center p-6 space-y-6">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-soft">
          <AlertCircle className="size-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Subscription Renewal Required
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your store subscription has expired on <strong className="text-foreground">{user?.expiryDate || "recently"}</strong>. Renew your plan to unlock full workspace access.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={handleQuickRenew}
            className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2"
          >
            <Clock className="size-4" /> Quick Renew (+30 Days)
          </Button>

          <Button
            onClick={() => navigate({ to: "/upgrade" })}
            variant="outline"
            className="w-full h-11 rounded-2xl text-xs font-semibold gap-2"
          >
            <CreditCard className="size-4" /> View All Upgrade Plans
          </Button>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border/60 text-xs">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/user/profile" })}
            className="text-xs text-muted-foreground"
          >
            View Profile Details
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              signOut();
              toast.info("Logged out.");
              navigate({ to: "/" });
            }}
            className="text-xs text-destructive hover:text-destructive"
          >
            <LogOut className="size-3.5 mr-1" /> Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
