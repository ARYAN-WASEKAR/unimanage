import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/unimanage/auth";
import { getUserSubscriptionState, hasFeature } from "@/lib/unimanage/permissions";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import type { ServiceKey, User } from "@/lib/unimanage/types";

export const Route = createFileRoute("/user/dashboard")({
  component: UserDashboard,
});

function UserDashboard() {
  const { session } = useAuth();
  const { users, products, customers, invoices, payments } = useStore();
  const planMap = usePlanMap();
  const navigate = useNavigate();

  // Find logged in user
  const foundUser = users.find(
    (u) =>
      (session?.email && u.email.toLowerCase() === session.email.toLowerCase()) ||
      (session?.username && u.username.toLowerCase() === session.username.toLowerCase()),
  );

  const user: User = foundUser || {
    id: "usr-active",
    name: session?.name || "User",
    email: session?.email || "user@unimanage.app",
    phone: "+91 98765-43210",
    username: session?.username || "user",
    status: "active",
    role: session?.role || "USER",
    service: "medical",
    planId: "plan-med-pro",
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    businessName: `${session?.name || "User"}'s Store`,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const plan = user ? planMap[user.planId] : null;
  const subState = getUserSubscriptionState(user || null);
  const serviceMeta = SERVICE_META[(user.service as ServiceKey) || "combined"] || SERVICE_META.combined;

  // Filter user's specific data (Data Isolation)
  const myProducts = (products || []).filter((p) => p.userId === user?.id);
  const myCustomers = (customers || []).filter((c) => c.userId === user?.id);
  const myInvoices = (invoices || []).filter((inv) => inv.userId === user?.id);
  const myPayments = (payments || []).filter((pay) => pay.userId === user?.id);

  // Stats calculations
  const totalRevenue = myInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const expiryDate = new Date(user?.expiryDate || Date.now());
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* WELCOME BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 size-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1 text-xs gap-1.5 font-medium">
              <span>{serviceMeta.emoji}</span> {serviceMeta.name}
            </Badge>
            {plan && (
              <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-300/30 px-3 py-1 text-xs">
                {plan.name} Plan
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || session?.name} 👋
          </h1>
          <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
            Workspace for <strong className="text-white font-semibold">{user?.businessName || "Your Store"}</strong>. Here is your store activity and subscription status today.
          </p>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CURRENT PLAN */}
        <Card className="rounded-2xl shadow-xs border-border/80 hover:shadow-soft transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Subscription
            </CardTitle>
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{plan?.name || "Active Plan"}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">₹{plan?.price || 0} / {plan?.period || "month"}</span>
              <Badge
                variant={subState === "ACTIVE" ? "default" : subState === "EXPIRING_SOON" ? "secondary" : "destructive"}
                className="text-[10px] uppercase font-bold"
              >
                {subState === "EXPIRING_SOON" ? "Expiring Soon" : subState}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* DAYS REMAINING */}
        <Card className="rounded-2xl shadow-xs border-border/80 hover:shadow-soft transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Days Remaining
            </CardTitle>
            <Clock className="size-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysRemaining} Days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Expires on {new Date(user?.expiryDate || "").toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* TOTAL PRODUCTS */}
        {hasFeature(user || null, plan || null, "products") && (
          <Card className="rounded-2xl shadow-xs border-border/80 hover:shadow-soft transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Products
              </CardTitle>
              <Package className="size-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myProducts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(myProducts.filter((p) => p.stock <= p.lowStockThreshold)).length} low stock items
              </p>
            </CardContent>
          </Card>
        )}

        {/* TOTAL REVENUE */}
        {hasFeature(user || null, plan || null, "billing") && (
          <Card className="rounded-2xl shadow-xs border-border/80 hover:shadow-soft transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Revenue
              </CardTitle>
              <DollarSign className="size-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {myInvoices.length} generated invoices
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* QUICK ACTIONS & SUBSCRIPTION CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SUBSCRIPTION WIDGET */}
        <Card className="rounded-3xl border-border shadow-xs lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Plan & Subscription Status</CardTitle>
                <CardDescription className="text-xs">
                  Your current access level and renewal options
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-semibold rounded-xl"
                onClick={() => navigate({ to: "/user/subscription" })}
              >
                Manage Subscription <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-border/80 bg-muted/30 p-4">
              <div>
                <span className="text-xs text-muted-foreground block">Plan Tier</span>
                <span className="text-sm font-bold">{plan?.name}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Billing Cycle</span>
                <span className="text-sm font-bold capitalize">{plan?.period}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Next Renewal</span>
                <span className="text-sm font-bold">{user?.expiryDate}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Enabled Workspace Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {(plan?.features || []).map((feat, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-1 gap-1.5 rounded-lg">
                    <Sparkles className="size-3 text-emerald-600" /> {feat}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="rounded-3xl border-border shadow-xs flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Frequent tasks for your store</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {hasFeature(user || null, plan || null, "products") && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 rounded-2xl text-xs font-semibold"
                onClick={() => navigate({ to: "/user/inventory/products" })}
              >
                <Plus className="size-4 text-emerald-600" /> Add New Product
              </Button>
            )}

            {hasFeature(user || null, plan || null, "customers") && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 rounded-2xl text-xs font-semibold"
                onClick={() => navigate({ to: "/user/customers" })}
              >
                <Users className="size-4 text-blue-600" /> Manage Customers
              </Button>
            )}

            {hasFeature(user || null, plan || null, "billing") && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 rounded-2xl text-xs font-semibold"
                onClick={() => navigate({ to: "/user/billing" })}
              >
                <Receipt className="size-4 text-purple-600" /> Create Invoice
              </Button>
            )}

            <Button
              variant="default"
              className="w-full justify-start gap-3 h-11 rounded-2xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => navigate({ to: "/upgrade" })}
            >
              <CreditCard className="size-4" /> Upgrade Subscription
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RECENT INVOICES FEED */}
      {hasFeature(user || null, plan || null, "billing") && (
        <Card className="rounded-3xl border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Billing Activity</CardTitle>
                <CardDescription className="text-xs">Latest invoices generated for your business</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/user/billing" })} className="text-xs font-semibold">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myInvoices.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No billing invoices recorded yet. Click "Create Invoice" to generate your first invoice.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {myInvoices.slice(0, 4).map((inv) => (
                  <div key={inv.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-muted flex items-center justify-center font-bold text-foreground">
                        <Receipt className="size-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-semibold block text-foreground">{inv.invoiceNumber}</span>
                        <span className="text-muted-foreground">{inv.customerName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground block">₹{inv.totalAmount.toLocaleString()}</span>
                      <Badge variant={inv.status === "PAID" ? "default" : "secondary"} className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
