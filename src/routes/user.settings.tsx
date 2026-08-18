import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Lock, Moon, ShieldCheck, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/settings")({
  component: UserSettingsPage,
});

function UserSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);

  const handleSave = () => {
    toast.success("Workspace preferences saved.");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-muted-foreground">
          Configure notification alerts, theme preferences, and security settings
        </p>
      </div>

      {/* NOTIFICATION PREFERENCES */}
      <Card className="rounded-3xl border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bell className="size-4 text-emerald-600" /> Notifications & Alerts
          </CardTitle>
          <CardDescription className="text-xs">
            Manage alerts for subscription renewals and stock inventory limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-border/60">
            <div>
              <span className="font-semibold block text-foreground">Email Subscription Warnings</span>
              <span className="text-muted-foreground">Receive email alerts 7 days before plan expiry</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="size-4 accent-emerald-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-semibold block text-foreground">Low Stock Inventory Alerts</span>
              <span className="text-muted-foreground">Show in-app banner when products run below threshold</span>
            </div>
            <input
              type="checkbox"
              checked={stockAlerts}
              onChange={(e) => setStockAlerts(e.target.checked)}
              className="size-4 accent-emerald-600 rounded"
            />
          </div>

          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
