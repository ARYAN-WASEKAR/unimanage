import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/unimanage/auth";
import type { ServiceKey } from "@/lib/unimanage/types";
import { useStore } from "@/lib/unimanage/store";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Save, ShieldCheck, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/profile")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { session } = useAuth();
  const { users, updateUser, syncUser } = useStore();

  const user = users.find(
    (u) =>
      (session?.email && u.email.toLowerCase() === session.email.toLowerCase()) ||
      (session?.username && u.username.toLowerCase() === session.username.toLowerCase()),
  );

  const [name, setName] = useState(user?.name || session?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765-43210");
  const [businessName, setBusinessName] = useState(user?.businessName || `${session?.name || "User"}'s Store`);
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || "MG Road, Mumbai, IN");
  const [service, setService] = useState<ServiceKey>(user?.service || "combined");

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.businessName) setBusinessName(user.businessName);
      if (user.businessAddress) setBusinessAddress(user.businessAddress);
      if (user.service) setService(user.service);
    }
  }, [user?.id, user?.name, user?.phone, user?.businessName, user?.businessAddress, user?.service]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = user?.id || `usr-${Date.now()}`;
    const patch = {
      name,
      phone,
      businessName,
      businessAddress,
      service,
      email: session?.email || user?.email || "",
      username: session?.username || user?.username || "user",
    };

    if (user) {
      updateUser(user.id, patch);
    } else {
      syncUser({
        id: targetId,
        status: "active",
        role: "USER",
        planId: "plan-comb-pro",
        startDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        createdAt: new Date().toISOString().slice(0, 10),
        ...patch,
      });
    }
    toast.success("Profile & Business details updated successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account & Business Profile</h1>
        <p className="text-xs text-muted-foreground">
          Manage your personal details, business branding, and store contact info
        </p>
      </div>

      {/* PROFILE CARD */}
      <Card className="rounded-3xl border-border shadow-xs overflow-hidden">
        <form onSubmit={handleSave}>
          <CardHeader className="bg-muted/30 border-b border-border">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-border shadow-sm">
                <AvatarImage src={session?.avatar} />
                <AvatarFallback className="bg-emerald-600 text-white font-black text-lg">
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">{name}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-2">
                  <span>{session?.email}</span> • <Badge variant="secondary" className="text-[10px]">{user?.role || "USER"}</Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6 text-xs">
            {/* PERSONAL DETAILS SECTION */}
            <div className="space-y-4">
              <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <UserIcon className="size-4 text-emerald-600" /> Personal Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-name">Full Name</Label>
                  <Input
                    id="prof-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-phone">Phone Number</Label>
                  <Input
                    id="prof-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-email">Email Address (Read-only)</Label>
                <Input id="prof-email" value={session?.email} disabled className="bg-muted/50 cursor-not-allowed" />
              </div>
            </div>

            {/* BUSINESS DETAILS SECTION */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="size-4 text-blue-600" /> Business Workspace
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-biz">Business / Store Name</Label>
                  <Input
                    id="prof-biz"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prof-service">Business Sector</Label>
                  <select
                    id="prof-service"
                    value={service}
                    onChange={(e) => setService(e.target.value as ServiceKey)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background"
                  >
                    <option value="medical">Medical Management 🏥</option>
                    <option value="grocery">Grocery Management 🛒</option>
                    <option value="beauty">Beauty Management 💄</option>
                    <option value="stationery">Stationery Management ✏️</option>
                    <option value="combined">Combined Suite 🧩</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prof-addr">Business Street Address</Label>
                <Input
                  id="prof-addr"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>
            </div>

            {/* READ-ONLY ACCOUNT PERMISSIONS */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-xs text-foreground">
                <ShieldCheck className="size-4 text-emerald-600" /> Account Security & Role Status
              </h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Role: <strong className="text-foreground font-semibold">{user?.role || "USER"}</strong> • Account Status: <strong className="text-emerald-600 font-semibold">{user?.status}</strong>. To upgrade roles or subscription features, contact your SuperAdmin workspace manager.
              </p>
            </div>

            <Button type="submit" className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Save className="size-4" /> Save Profile Changes
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
