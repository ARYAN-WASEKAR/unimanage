import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/unimanage/auth";
import { useStore } from "@/lib/unimanage/store";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell, Check, CheckCheck, CreditCard, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/notifications")({
  component: UserNotificationsPage,
});

function UserNotificationsPage() {
  const { session } = useAuth();
  const { users, notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useStore();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  // Data isolation check: filter only user's notifications
  const myNotifs = (notifications || []).filter((n) => n.userId === user?.id);

  const handleMarkAll = () => {
    if (!user) return;
    markAllNotificationsRead(user.id);
    toast.success("All notifications marked as read.");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-xs text-muted-foreground">
            Subscription alerts, inventory stock warnings, and payment confirmations
          </p>
        </div>
        {myNotifs.length > 0 && (
          <Button onClick={handleMarkAll} variant="outline" className="gap-2 text-xs font-semibold">
            <CheckCheck className="size-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* NOTIFICATIONS LIST */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {myNotifs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No notifications right now. Everything is up to date!
              </div>
            ) : (
              myNotifs.map((n) => {
                const Icon =
                  n.type === "stock"
                    ? AlertTriangle
                    : n.type === "payment"
                    ? CreditCard
                    : n.type === "expiry"
                    ? Bell
                    : Info;

                return (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                      !n.read ? "bg-muted/40 font-medium" : "hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          n.type === "stock"
                            ? "bg-amber-500/10 text-amber-600"
                            : n.type === "payment"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{n.title}</span>
                          {!n.read && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-emerald-600">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground block">{n.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-emerald-600"
                          onClick={() => markNotificationRead(n.id)}
                        >
                          <Check className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => {
                          deleteNotification(n.id);
                          toast.info("Notification deleted.");
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
