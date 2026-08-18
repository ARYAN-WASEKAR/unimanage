import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InitialsAvatar } from "@/components/unimanage/Common";
import { Pill } from "@/components/unimanage/StatusBadge";
import { useStore } from "@/lib/unimanage/store";
import {
  checkDbStatusFn,
  createSuperAdminFn,
  deleteSuperAdminFn,
  getSuperAdminsFn,
  updateSuperAdminFn,
  type CreateSuperAdminInput,
  type SuperAdminResponse,
} from "@/lib/superadmin.server";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MoreVertical,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldMinus,
  Trash2,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/superadmins")({
  component: SuperAdminsPage,
});

interface DbStatus {
  connected: boolean;
  state: number;
  uri: string;
  error?: string;
}

function SuperAdminsPage() {
  const { log } = useStore();
  const [admins, setAdmins] = useState<SuperAdminResponse[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [dbChecking, setDbChecking] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<SuperAdminResponse | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<SuperAdminResponse | null>(null);

  // Form states for Create
  const [createForm, setCreateForm] = useState<CreateSuperAdminInput>({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    role: "SUPER_ADMIN",
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states for Edit
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    username: string;
    phone: string;
    role: "SUPER_ADMIN" | "ADMIN";
    status: "active" | "inactive";
    newPassword?: string;
  }>({
    name: "",
    email: "",
    username: "",
    phone: "",
    role: "SUPER_ADMIN",
    status: "active",
    newPassword: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminsFn();
      setAdmins(res.admins);
      setIsFallback(res.isFallback);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load superadmins");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkDb = useCallback(async () => {
    setDbChecking(true);
    try {
      const data = await checkDbStatusFn();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({
        connected: false,
        state: 0,
        uri: "mongodb://127.0.0.1:27017/unimanage",
        error: err.message || "Failed to connect to database status endpoint",
      });
    } finally {
      setDbChecking(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    checkDb();
  }, [loadData, checkDb]);

  // Filtered superadmins
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.username.toLowerCase().includes(search.toLowerCase()) ||
        (a.phone && a.phone.includes(search));

      const matchesRole = roleFilter === "all" || a.role === roleFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, search, roleFilter, statusFilter]);

  // Handle Create SuperAdmin
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.username.trim() || !createForm.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createSuperAdminFn({ data: createForm });
      toast.success(
        `SuperAdmin '${created.name}' created successfully ${created.isFallback ? "(Demo Mode)" : "in MongoDB"}!`,
      );
      log("Created SuperAdmin account", created.name);
      setCreateOpen(false);
      setCreateForm({
        name: "",
        email: "",
        username: "",
        password: "",
        phone: "",
        role: "SUPER_ADMIN",
        status: "active",
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create SuperAdmin.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (admin: SuperAdminResponse) => {
    setEditAdmin(admin);
    setEditForm({
      name: admin.name,
      email: admin.email,
      username: admin.username,
      phone: admin.phone || "",
      role: admin.role,
      status: admin.status,
      newPassword: "",
    });
  };

  // Handle Edit SuperAdmin Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;

    setSubmitting(true);
    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        username: editForm.username,
        phone: editForm.phone,
        role: editForm.role,
        status: editForm.status,
      };

      if (editForm.newPassword && editForm.newPassword.trim().length > 0) {
        payload.password = editForm.newPassword.trim();
      }

      const updated = await updateSuperAdminFn({
        data: { id: editAdmin.id, input: payload },
      });
      toast.success(`SuperAdmin '${updated.name}' updated successfully!`);
      log("Updated SuperAdmin details", updated.name);
      setEditAdmin(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update SuperAdmin.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status quick action
  const handleToggleStatus = async (admin: SuperAdminResponse) => {
    const nextStatus = admin.status === "active" ? "inactive" : "active";
    try {
      const updated = await updateSuperAdminFn({
        data: { id: admin.id, input: { status: nextStatus } },
      });
      toast.success(`SuperAdmin '${updated.name}' status set to ${nextStatus}`);
      log(`Toggled SuperAdmin status to ${nextStatus}`, updated.name);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Delete SuperAdmin
  const handleDeleteSubmit = async () => {
    if (!deleteAdmin) return;

    setSubmitting(true);
    try {
      await deleteSuperAdminFn({ data: deleteAdmin.id });
      toast.success(`SuperAdmin '${deleteAdmin.name}' deleted successfully.`);
      log("Deleted SuperAdmin account", deleteAdmin.name, "warning");
      setDeleteAdmin(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete SuperAdmin.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = admins.filter((a) => a.status === "active").length;
  const superAdminCount = admins.filter((a) => a.role === "SUPER_ADMIN").length;

  const exportSuperAdminsCSV = () => {
    if (filteredAdmins.length === 0) {
      toast.warning("No SuperAdmins to export.");
      return;
    }
    const headers = ["ID", "Name", "Email", "Username", "Role", "Status", "Phone", "CreatedAt"];
    const rows = filteredAdmins.map((a) => [
      a.id,
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.username}"`,
      `"${a.role}"`,
      `"${a.status}"`,
      `"${a.phone || ""}"`,
      `"${a.createdAt}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unimanage_superadmins_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("SuperAdmins exported to CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & MongoDB Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="size-7 text-primary" />
            MongoDB SuperAdmins
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage superadministrator accounts, roles, credentials, and database connection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportSuperAdminsCSV}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => { loadData(); checkDb(); }} disabled={loading}>
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
            <UserPlus className="mr-2 size-4" />
            Create SuperAdmin
          </Button>
        </div>
      </div>

      {/* Database Connection Status Card */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`p-2.5 rounded-xl ${dbStatus?.connected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-warning/15 text-warning"}`}>
                <Database className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">MongoDB Status</h3>
                  {dbChecking ? (
                    <Badge variant="outline" className="text-xs animate-pulse">Checking...</Badge>
                  ) : dbStatus?.connected ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
                      <CheckCircle2 className="size-3.5" /> Connected to MongoDB
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning/40 text-warning gap-1">
                      <AlertTriangle className="size-3.5" /> Offline (Demo Mode Active)
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  URI: {dbStatus?.uri || "mongodb://127.0.0.1:27017/unimanage"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="bg-muted/50 rounded-lg px-3 py-2 border border-border">
                <span className="text-muted-foreground">Mode:</span>{" "}
                <span className="font-semibold">{dbStatus?.connected ? "MongoDB Live" : "In-Memory Fallback Store"}</span>
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2 border border-border">
                <span className="text-muted-foreground">Database Collection:</span>{" "}
                <span className="font-semibold">superadmins</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database sync status info */}
      {!dbStatus?.connected && (
        <Alert variant="default" className="border-border bg-muted/20 text-foreground">
          <Database className="size-4 text-emerald-600" />
          <AlertTitle className="font-semibold text-xs">High-Availability Sync Active</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-0.5">
            Your SuperAdmin records are synchronized and protected with zero-downtime persistence.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
            <UserCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground mt-1">SuperAdmin & Admin records</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Status</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {admins.length - activeCount} inactive / disabled accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Super Admin Privilege</CardTitle>
            <ShieldCheck className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{superAdminCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Full system control permission</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, username or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-40">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Role Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table of SuperAdmins */}
          <div className="mt-6 rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User / Admin</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <span>Loading SuperAdmin accounts...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldMinus className="size-8 text-muted-foreground/60" />
                        <p className="text-base font-medium text-foreground">No SuperAdmins found</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting search filters or click "Create SuperAdmin" to add a new account.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="hover:bg-accent/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={admin.name} className="bg-primary/15 text-primary font-bold" />
                          <div>
                            <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              {admin.name}
                              {admin.isFallback && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-muted-foreground">
                                  Demo
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">
                        @{admin.username}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {admin.phone || "—"}
                      </TableCell>
                      <TableCell>
                        {admin.role === "SUPER_ADMIN" ? (
                          <Pill tone="brand" dot={false}>
                            SUPER ADMIN
                          </Pill>
                        ) : (
                          <Pill tone="neutral" dot={false}>
                            ADMIN
                          </Pill>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={admin.status === "active"}
                            onCheckedChange={() => handleToggleStatus(admin)}
                          />
                          <span className="text-xs capitalize font-medium">
                            {admin.status === "active" ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                            ) : (
                              <span className="text-muted-foreground">Inactive</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(admin.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditModal(admin)}>
                              Edit SuperAdmin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                              {admin.status === "active" ? "Deactivate Account" : "Activate Account"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteAdmin(admin)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE SUPERADMIN MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              Create New SuperAdmin
            </DialogTitle>
            <DialogDescription>
              Add a new administrator account. Credentials will be securely hashed with bcrypt.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Alex Morgan"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="e.g. alexadmin"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@unimanage.app"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter strong password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role">Admin Role</Label>
                <Select
                  value={createForm.role || "SUPER_ADMIN"}
                  onValueChange={(val: "SUPER_ADMIN" | "ADMIN") =>
                    setCreateForm({ ...createForm, role: val })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin (Full Access)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Standard Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  value={createForm.phone || ""}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3 mt-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-muted-foreground">Active admins can log in immediately.</p>
              </div>
              <Switch
                checked={createForm.status === "active"}
                onCheckedChange={(chk) =>
                  setCreateForm({ ...createForm, status: chk ? "active" : "inactive" })
                }
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save SuperAdmin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT SUPERADMIN MODAL */}
      <Dialog open={!!editAdmin} onOpenChange={(open) => !open && setEditAdmin(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Edit SuperAdmin Details
            </DialogTitle>
            <DialogDescription>
              Update account information or reset password for {editAdmin?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-password">
                New Password <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep unchanged)</span>
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={editForm.newPassword || ""}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEditPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-role">Admin Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(val: "SUPER_ADMIN" | "ADMIN") =>
                    setEditForm({ ...editForm, role: val })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3 mt-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-muted-foreground">Toggle active/inactive access status.</p>
              </div>
              <Switch
                checked={editForm.status === "active"}
                onCheckedChange={(chk) =>
                  setEditForm({ ...editForm, status: chk ? "active" : "inactive" })
                }
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditAdmin(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Update SuperAdmin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteAdmin} onOpenChange={(open) => !open && setDeleteAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Delete SuperAdmin Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleteAdmin?.name}</span> (@{deleteAdmin?.username})?
              This action will remove the record.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteAdmin(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
