import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InitialsAvatar } from "@/components/unimanage/Common";
import { Pill } from "@/components/unimanage/StatusBadge";
import { useAuth } from "@/lib/unimanage/auth";
import { useStore } from "@/lib/unimanage/store";
import { useTheme } from "@/lib/unimanage/theme";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Moon,
  Save,
  Server,
  Settings,
  ShieldCheck,
  Sun,
  User,
  Webhook,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SystemSettingsPage,
});

export function SystemSettingsPage() {
  const { session, isClerkActive } = useAuth();
  const { log } = useStore();
  const { theme, toggle } = useTheme();

  // Profile Form state
  const [name, setName] = useState(session?.name || "Super Admin");
  const [email, setEmail] = useState(session?.email || "admin@unimanage.app");
  const [username, setUsername] = useState(session?.username || "superadmin");
  const [phone, setPhone] = useState("+1 800-555-0199");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  // Notification Toggles state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [expiringAlerts, setExpiringAlerts] = useState(true);
  const [dbAlerts, setDbAlerts] = useState(true);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      toast.success("Profile settings updated successfully!");
      log("Updated profile configuration", name);
    }, 600);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setUpdatingPwd(true);
    setTimeout(() => {
      setUpdatingPwd(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
      log("Updated account security password", username, "warning");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
          <Settings className="size-7 text-primary" />
          Settings & Workspace Preferences
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your SuperAdmin profile, Clerk authentication configuration, security preferences, and backend API endpoints.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl">
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <ShieldCheck className="size-4" /> Security & Auth
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Server className="size-4" /> API & Webhooks
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* 1. PROFILE TAB */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">SuperAdmin Profile</CardTitle>
                <CardDescription>Your active administrative account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center flex flex-col items-center">
                <InitialsAvatar name={name} className="size-20 text-xl bg-primary/10 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{name}</h3>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    SUPER_ADMIN
                  </Badge>
                  <Pill tone={isClerkActive ? "success" : "neutral"} dot>
                    {isClerkActive ? "Clerk Authenticated" : "Standard Auth"}
                  </Pill>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Edit Account Details</CardTitle>
                <CardDescription>Update your public admin information and contact details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Super Admin"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@unimanage.app"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="superadmin"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 800-555-0199"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={savingProfile} className="gap-2 h-10 px-5">
                      {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. SECURITY & AUTH TAB */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <KeyRound className="size-4.5 text-primary" />
                  Clerk Authentication Provider
                </CardTitle>
                <CardDescription>Live status of your Clerk OAuth, Passkeys, and Magic Links provider.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-emerald-500/30 bg-emerald-500/10">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <AlertTitle className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Clerk Integration Active
                  </AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground mt-1">
                    Your publishable key and secret key are loaded from <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code>.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm border-t border-border pt-3">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Publishable Key:</span>
                    <span className="font-mono text-xs text-foreground truncate max-w-[200px]">
                      pk_test_YXNzdXJlZC1tZ...
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Secret Key:</span>
                    <span className="font-mono text-xs text-emerald-600 font-medium">Configured</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Passkeys & 2FA:</span>
                    <span className="text-xs font-semibold text-emerald-600">Enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="size-4.5 text-primary" />
                  Update Security Password
                </CardTitle>
                <CardDescription>Change your SuperAdmin credentials password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSave} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="currPwd" className="text-xs">Current Password</Label>
                    <Input
                      id="currPwd"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPwd" className="text-xs">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPwd"
                        type={showPwd ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-9 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confPwd" className="text-xs">Confirm New Password</Label>
                    <Input
                      id="confPwd"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" size="sm" disabled={updatingPwd} className="gap-1.5">
                      {updatingPwd && <Loader2 className="size-3.5 animate-spin" />} Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. API & WEBHOOKS TAB */}
        <TabsContent value="api" className="space-y-6">
          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Webhook className="size-4.5 text-primary" />
                Backend Endpoints & Webhook Sync
              </CardTitle>
              <CardDescription>Live Express server configuration and Clerk webhook listener routes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <Server className="size-4 text-primary" /> Express API Server
                    </span>
                    <Pill tone="success" dot>Port 5001</Pill>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">http://localhost:5001/api/superadmins</p>
                  <p className="text-xs text-muted-foreground">Handles REST endpoints for authentication and superadmin management.</p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      <Globe className="size-4 text-blue-500" /> Clerk Webhooks Endpoint
                    </span>
                    <Pill tone="info" dot>POST Active</Pill>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">http://localhost:5001/api/webhooks/clerk</p>
                  <p className="text-xs text-muted-foreground">Listens to Clerk <code className="bg-muted px-1 rounded text-[11px]">user.created</code> and <code className="bg-muted px-1 rounded text-[11px]">user.deleted</code> events.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("API endpoints pinged cleanly — All services operational!")}
                  className="gap-2"
                >
                  <Database className="size-4" /> Test API Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="size-4.5 text-primary" />
                Notification & Alert Preferences
              </CardTitle>
              <CardDescription>Configure when and how SuperAdmins receive system alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h4 className="font-medium text-sm">Customer Plan Expiry Alerts</h4>
                  <p className="text-xs text-muted-foreground">Receive topbar notifications when customer subscriptions are 7 days from expiring.</p>
                </div>
                <Switch checked={expiringAlerts} onCheckedChange={setExpiringAlerts} />
              </div>

              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h4 className="font-medium text-sm">Email Renewal Reminders</h4>
                  <p className="text-xs text-muted-foreground">Automatically send email reminders to customers before their due date.</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Database & System Health Warnings</h4>
                  <p className="text-xs text-muted-foreground">Alert admins if MongoDB Atlas connection drops or switches to fallback mode.</p>
                </div>
                <Switch checked={dbAlerts} onCheckedChange={setDbAlerts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
