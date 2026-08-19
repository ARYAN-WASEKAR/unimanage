import { ConfirmDialog } from "@/components/unimanage/ConfirmDialog";
import { EmptyState, InitialsAvatar, PageHeader, TableSkeleton } from "@/components/unimanage/Common";
import { StatusBadge } from "@/components/unimanage/StatusBadge";
import { UserFormDialog } from "@/components/unimanage/UserFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, userState } from "@/lib/unimanage/dates";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import type { User } from "@/lib/unimanage/types";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users as UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({
    meta: [
      { title: "Users — UniManage" },
      { name: "description", content: "Create, edit and manage every UniManage customer." },
      { property: "og:title", content: "Users — UniManage" },
      { property: "og:description", content: "Create and manage all UniManage customers." },
    ],
  }),
  component: UsersPage,
});

const PAGE_SIZE = 8;

function UsersPage() {
  const { users, deleteUser, log, hydrated } = useStore();
  const planMap = usePlanMap();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);

  const filtered = useMemo(() => {
    let list = users.filter((u) => {
      const q = query.trim().toLowerCase();
      const match =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      if (!match) return false;
      if (filter === "all") return true;
      if (filter === "inactive") return u.status === "inactive";
      if (filter === "active") return u.status === "active" && userState(u) === "active";
      if (filter === "expiring") return userState(u) === "expiring";
      if (filter === "expired") return userState(u) === "expired";
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "expiry") return a.expiryDate.localeCompare(b.expiryDate);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [users, query, filter, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteUser(toDelete.id);
    log("Deleted a user account", toDelete.name, "warning");
    toast.success("User deleted successfully.");
    setToDelete(null);
  };

  const exportUsersCSV = () => {
    if (filtered.length === 0) {
      toast.warning("No users to export.");
      return;
    }
    const headers = ["ID", "Name", "Email", "Username", "ServiceType", "Status", "ExpiryDate"];
    const rows = filtered.map((u) => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.username}"`,
      `"${u.service}"`,
      `"${u.status}"`,
      `"${u.expiryDate}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unimanage_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users exported to CSV!");
  };

  return (
    <>
      <PageHeader
        title="Manage your users"
        subtitle="Create and manage all UniManage customers."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportUsersCSV} className="gap-2">
              <Download className="size-4" /> Export CSV
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" /> Create user
            </Button>
          </div>
        }
      />

      <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or username…"
            className="pl-9"
          />
        </div>
        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring soon</SelectItem>
            <SelectItem value="expired">Ended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Newest first</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="expiry">Expiring first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hydrated ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={UsersIcon}
            title="Nothing here yet."
            message={
              query || filter !== "all"
                ? "No one matches that search. Try a different name or filter."
                : "Add your first customer and their subscription will start tracking automatically."
            }
            actionLabel="Create user"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Expiry</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-5 py-3">
                      <Link
                        to="/admin/users/$userId"
                        params={{ userId: u.id }}
                        className="flex items-center gap-3"
                      >
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="size-8 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <InitialsAvatar name={u.name} />
                        )}
                        <span className="leading-tight">
                          <span className="block font-medium">{u.name}</span>
                          <span className="block text-xs text-muted-foreground">{u.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {SERVICE_META[u.service || "combined"]?.emoji || "🧩"}{" "}
                      {(SERVICE_META[u.service || "combined"]?.name || "Combined Management").replace(" Management", "")}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{planMap[u.planId]?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge state={userState(u)} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(u.expiryDate)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="More actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to="/admin/users/$userId" params={{ userId: u.id }}>
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(u);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setToDelete(u)}
                            >
                              <Trash2 className="size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {current} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete ${toDelete?.name ?? "this user"}?`}
        description="This action cannot be undone. Their subscription and history will be removed from UniManage."
        confirmLabel="Delete user"
        onConfirm={confirmDelete}
      />
    </>
  );
}
