import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/unimanage/auth";
import { getUserSubscriptionState } from "@/lib/unimanage/permissions";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Clock, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/subscription")({
  component: UserSubscriptionPage,
});

function UserSubscriptionPage() {
  const { session } = useAuth();
  const { users, updateUser } = useStore();
  const planMap = usePlanMap();
  const navigate = useNavigate();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  const plan = user ? planMap[user.planId] : null;
  const subState = getUserSubscriptionState(user || null);

  const expiryDate = new Date(user?.expiryDate || Date.now());
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24)));

  const handleRenew = () => {
    if (!user) return;
    const nextExpiry = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    updateUser(user.id, {
      expiryDate: nextExpiry,
      status: "active",
    });
    toast.success("Subscription renewed for 30 additional days!");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription & Membership Plan</h1>
        <p className="text-xs text-muted-foreground">
          View your active plan features, billing cycle, renewal status, and upgrade options
        </p>
      </div>

      {/* PLAN DETAILS CARD */}
      <Card className="rounded-3xl border-border shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-none uppercase text-[10px] font-bold tracking-wider mb-2">
              {subState === "EXPIRING_SOON" ? "Expiring Soon" : subState}
            </Badge>
            <h2 className="text-2xl font-black">{plan?.name || "Active Subscription"}</h2>
            <p className="text-emerald-100 text-xs mt-1">
              ₹{plan?.price || 0} billed {plan?.period || "monthly"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-100 block">Days Remaining</span>
            <span className="text-3xl font-black">{daysRemaining} Days</span>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border border-border bg-muted/20">
            <div>
              <span className="text-xs text-muted-foreground block">Start Date</span>
              <span className="text-xs font-semibold">{user?.startDate || "2026-01-01"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Expiry Date</span>
              <span className="text-xs font-semibold">{user?.expiryDate}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Account Status</span>
              <Badge variant={user?.status === "active" ? "default" : "destructive"} className="text-[10px] uppercase font-bold">
                {user?.status}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" /> Included Plan Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(plan?.features || ["Dashboard Access", "Basic Support"]).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium p-2 rounded-xl bg-muted/30">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={handleRenew} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2">
              <Clock className="size-4" /> Renew Subscription (+30 Days)
            </Button>
            <Button onClick={() => navigate({ to: "/upgrade" })} variant="outline" className="flex-1 gap-2 font-semibold">
              <CreditCard className="size-4" /> Upgrade Plan
            </Button>
            <Button onClick={() => navigate({ to: "/user/payments" })} variant="ghost" className="text-xs">
              View Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
