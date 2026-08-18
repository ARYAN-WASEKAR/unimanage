import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/lib/unimanage/auth";
import { useStore } from "@/lib/unimanage/store";
import type { Invoice } from "@/lib/unimanage/types";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus, Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/billing")({
  component: UserBillingPage,
});

function UserBillingPage() {
  const { session } = useAuth();
  const { users, invoices, customers, addInvoice, updateInvoiceStatus } = useStore();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  // Data isolation check
  const myInvoices = (invoices || []).filter((inv) => inv.userId === user?.id);
  const myCustomers = (customers || []).filter((c) => c.userId === user?.id);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Form fields
  const [selectedCustomerId, setSelectedCustomerId] = useState(myCustomers[0]?.id || "");
  const [itemDesc, setItemDesc] = useState("Store Product Supply");
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(500);

  const filtered = useMemo(() => {
    return myInvoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [myInvoices, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = myCustomers.find((c) => c.id === selectedCustomerId) || myCustomers[0];
    const customerName = cust ? cust.name : "Walk-in Customer";
    const total = Number(itemQty) * Number(itemPrice);

    addInvoice({
      userId: user?.id || "usr-1",
      customerId: cust?.id || "cust-1",
      customerName,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      items: [
        {
          description: itemDesc,
          quantity: Number(itemQty),
          unitPrice: Number(itemPrice),
          total,
        },
      ],
      totalAmount: total,
      status: "PAID",
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    });

    toast.success("Invoice generated successfully!");
    setOpen(false);
  };

  const handleStatusToggle = (invId: string, currentStatus: Invoice["status"]) => {
    const next: Invoice["status"] = currentStatus === "PAID" ? "PENDING" : "PAID";
    updateInvoiceStatus(invId, next);
    toast.info(`Invoice status updated to ${next}`);
  };

  const downloadPDF = (invNum: string) => {
    toast.success(`Downloading Invoice PDF: ${invNum}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-xs text-muted-foreground">
            Generate invoices, track customer billing status, and print receipts
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
          <Plus className="size-4" /> Create Invoice
        </Button>
      </div>

      {/* SEARCH BAR */}
      <Card className="rounded-2xl border-border shadow-xs">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* INVOICES TABLE */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No invoices recorded yet. Click "Create Invoice" to generate billing statement.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-foreground flex items-center gap-2">
                        <Receipt className="size-4 text-emerald-600" />
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 font-medium text-foreground">{inv.customerName}</td>
                      <td className="p-4 text-muted-foreground">{inv.date}</td>
                      <td className="p-4 text-muted-foreground">{inv.dueDate}</td>
                      <td className="p-4 font-bold text-foreground">₹{inv.totalAmount.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            inv.status === "PAID"
                              ? "default"
                              : inv.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className="cursor-pointer text-[10px]"
                          onClick={() => handleStatusToggle(inv.id, inv.status)}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => downloadPDF(inv.invoiceNumber)}
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE INVOICE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Create Invoice</DialogTitle>
              <DialogDescription className="text-xs">
                Generate a billing invoice statement for a store client.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="inv-cust">Select Customer</Label>
                <select
                  id="inv-cust"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                >
                  {myCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.businessName || "Client"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="item-desc">Item / Service Description</Label>
                <Input
                  id="item-desc"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="item-qty">Quantity</Label>
                  <Input
                    id="item-qty"
                    type="number"
                    value={itemQty}
                    onChange={(e) => setItemQty(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="item-price">Unit Price (₹)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 flex justify-between items-center font-bold">
                <span>Calculated Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{(Number(itemQty) * Number(itemPrice)).toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Generate Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
