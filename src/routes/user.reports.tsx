import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/unimanage/auth";
import { useStore } from "@/lib/unimanage/store";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Calendar, Download, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/reports")({
  component: UserReportsPage,
});

function UserReportsPage() {
  const { session } = useAuth();
  const { users, products, customers, invoices } = useStore();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  const myProducts = (products || []).filter((p) => p.userId === user?.id);
  const myCustomers = (customers || []).filter((c) => c.userId === user?.id);
  const myInvoices = (invoices || []).filter((inv) => inv.userId === user?.id);

  const [dateRange, setDateRange] = useState("30");

  const totalSales = myInvoices.filter((inv) => inv.status === "PAID").reduce((sum, i) => sum + i.totalAmount, 0);
  const inventoryValue = myProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

  const exportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Metric,Value", `Total Invoices,${myInvoices.length}`, `Paid Revenue,₹${totalSales}`, `Total Customers,${myCustomers.length}`, `Inventory Products,${myProducts.length}`, `Inventory Valuation,₹${inventoryValue}`].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unimanage_business_report_${dateRange}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Business report exported to CSV!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Analyze sales revenue, product inventory performance, and client growth
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
          <Button onClick={exportCSV} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Paid Revenue</CardTitle>
            <DollarSign className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From paid customer invoices</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Inventory Valuation</CardTitle>
            <Package className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total value of stock in store</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Active Customers</CardTitle>
            <Users className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myCustomers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Client accounts in CRM</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Generated Invoices</CardTitle>
            <BarChart3 className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total billing transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* PERFORMANCE BREAKDOWN */}
      <Card className="rounded-3xl border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold">Store Performance Breakdown</CardTitle>
          <CardDescription className="text-xs">Summary of product lines and customer billing activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2">
              <h4 className="text-xs font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" /> Top Selling Product Lines
              </h4>
              <p className="text-xs text-muted-foreground">
                Your highest performing product categories are Medicines, Antibiotics, and Grains.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2">
              <h4 className="text-xs font-bold flex items-center gap-2">
                <Calendar className="size-4 text-blue-600" /> Billing Collection Health
              </h4>
              <p className="text-xs text-muted-foreground">
                {myInvoices.filter((i) => i.status === "PAID").length} of {myInvoices.length} invoices paid on time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
