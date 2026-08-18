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
import type { Customer } from "@/lib/unimanage/types";
import { createFileRoute } from "@tanstack/react-router";
import { Edit, Mail, Phone, Plus, Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/customers")({
  component: UserCustomersPage,
});

function UserCustomersPage() {
  const { session } = useAuth();
  const { users, customers, addCustomer, updateCustomer, deleteCustomer } = useStore();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  // Data isolation check: filter only user's customers
  const myCustomers = (customers || []).filter((c) => c.userId === user?.id);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");

  const filtered = useMemo(() => {
    return myCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search),
    );
  }, [myCustomers, search]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName("");
    setEmail("");
    setPhone("+91 ");
    setBusinessName("");
    setAddress("");
    setOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setBusinessName(c.businessName || "");
    setAddress(c.address || "");
    setOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Customer name is required.");
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name,
        email,
        phone,
        businessName,
        address,
      });
      toast.success("Customer details updated.");
    } else {
      addCustomer({
        userId: user?.id || "usr-1",
        name,
        email: email || `${name.toLowerCase().replace(" ", ".")}@client.com`,
        phone,
        businessName,
        address,
      });
      toast.success("New customer added to CRM.");
    }
    setOpen(false);
  };

  const handleDelete = (id: string, cName: string) => {
    if (confirm(`Are you sure you want to delete customer '${cName}'?`)) {
      deleteCustomer(id);
      toast.info("Customer removed.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers & CRM</h1>
          <p className="text-xs text-muted-foreground">
            Manage your store client database, contacts, and order history
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
          <Plus className="size-4" /> Add Customer
        </Button>
      </div>

      {/* SEARCH BAR */}
      <Card className="rounded-2xl border-border shadow-xs">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search customer name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* CUSTOMERS TABLE */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Business / Company</th>
                  <th className="p-4">Address</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No customers found. Click "Add Customer" to add client contacts.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cust) => (
                    <tr key={cust.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        {cust.name}
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="size-3 text-muted-foreground" /> {cust.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="size-3 text-muted-foreground" /> {cust.phone}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-foreground">{cust.businessName || "Individual"}</td>
                      <td className="p-4 text-muted-foreground max-w-xs truncate">{cust.address || "N/A"}</td>
                      <td className="p-4 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleOpenEdit(cust)}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cust.id, cust.name)}
                        >
                          <Trash2 className="size-3.5" />
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

      {/* ADD / EDIT CUSTOMER DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enter contact and business details for your customer database.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="cust-name">Full Name *</Label>
                <Input
                  id="cust-name"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cust-email">Email Address</Label>
                  <Input
                    id="cust-email"
                    type="email"
                    placeholder="aarav@client.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-phone">Phone Number</Label>
                  <Input
                    id="cust-phone"
                    placeholder="+91 98765-43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cust-biz">Business / Company Name</Label>
                <Input
                  id="cust-biz"
                  placeholder="e.g. Sharma Enterprises"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cust-address">Street Address</Label>
                <Input
                  id="cust-address"
                  placeholder="e.g. Shop 12, Link Road, Mumbai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Save Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
