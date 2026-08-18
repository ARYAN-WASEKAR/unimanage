import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/unimanage/auth";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { useStore } from "@/lib/unimanage/store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/upgrade")({
  component: UpgradePage,
});

function UpgradePage() {
  const { session } = useAuth();
  const { users, plans, updateUser } = useStore();
  const navigate = useNavigate();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  const activePlans = (plans || []).filter((p) => p.active);

  const handleSelectPlan = (planId: string, planName: string) => {
    if (!user) return;
    const nextExpiry = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    updateUser(user.id, {
      planId,
      status: "active",
      expiryDate: nextExpiry,
    });
    toast.success(`Successfully upgraded to ${planName}!`);
    navigate({ to: "/user/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/user/dashboard" })}
          className="gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <Badge className="bg-emerald-600 text-white border-none uppercase text-[10px] tracking-wider px-3 py-1 font-bold">
          Flexible Store Plans
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Upgrade Your Business Workspace
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Choose a plan tier that fits your store operations. All plans include automated backup, multi-device access, and priority support.
        </p>
      </div>

      {/* PLANS CATALOG GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activePlans.map((p) => {
          const isCurrent = user?.planId === p.id;
          const meta = SERVICE_META[p.service] || SERVICE_META.combined;

          return (
            <Card
              key={p.id}
              className={`rounded-3xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg bg-card"
                  : "border-border shadow-xs hover:border-border/80"
              }`}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <span>{meta.emoji}</span> {meta.name}
                  </Badge>
                  {isCurrent && (
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-extrabold">{p.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{p.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">₹{p.price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground font-medium">/ {p.period}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    What's Included:
                  </span>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Check className="size-3.5 text-emerald-600 shrink-0" />
                      <span className="text-foreground font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-border/60">
                <Button
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(p.id, p.name)}
                  className={`w-full h-11 rounded-2xl text-xs font-semibold ${
                    isCurrent
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isCurrent ? "Active Plan" : `Upgrade to ${p.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
