import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/unimanage/auth";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/payments")({
  component: UserPaymentsPage,
});

function UserPaymentsPage() {
  const { session } = useAuth();
  const { users, payments } = useStore();
  const planMap = usePlanMap();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  // Data isolation check: filter only user's payments
  const myPayments = (payments || []).filter((pay) => pay.userId === user?.id);

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return myPayments.filter(
      (p) =>
        p.txnId.toLowerCase().includes(search.toLowerCase()) ||
        p.method.toLowerCase().includes(search.toLowerCase()),
    );
  }, [myPayments, search]);

  const downloadReceipt = (txnId: string) => {
    toast.success(`Downloading Payment Receipt: ${txnId}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-xs text-muted-foreground">
          View your past subscription renewal receipts and transaction history
        </p>
      </div>

      {/* SEARCH BAR */}
      <Card className="rounded-2xl border-border shadow-xs">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search transaction ID or payment method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* PAYMENTS TABLE */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pay) => {
                    const plan = planMap[pay.planId];
                    return (
                      <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground flex items-center gap-2">
                          <CreditCard className="size-4 text-emerald-600" />
                          {pay.txnId}
                        </td>
                        <td className="p-4 font-medium text-foreground">{plan?.name || "Subscription Plan"}</td>
                        <td className="p-4 text-muted-foreground">{pay.date}</td>
                        <td className="p-4 font-semibold">{pay.method}</td>
                        <td className="p-4 font-bold text-foreground">₹{pay.amount.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              pay.status === "paid"
                                ? "default"
                                : pay.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {pay.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => downloadReceipt(pay.txnId)}
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
