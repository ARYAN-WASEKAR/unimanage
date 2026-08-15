import { ConfirmDialog } from "@/components/unimanage/ConfirmDialog";
import { EmptyState, InitialsAvatar, SectionCard } from "@/components/unimanage/Common";
import { PaymentBadge, Pill, StatusBadge } from "@/components/unimanage/StatusBadge";
import { UserFormDialog } from "@/components/unimanage/UserFormDialog";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addMonths,
  formatDate,
  formatDateTime,
  formatMoney,
  iso,
  monthsForPeriod,
  remainingLabel,
  userState,
} from "@/lib/unimanage/dates";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import type { ServiceKey } from "@/lib/unimanage/types";
import { Link, createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Receipt, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$userId")({
  head: () => ({
    meta: [
      { title: "User details — UniManage" },
      { name: "description", content: "Subscription, payments and activity for a UniManage customer." },
      { property: "og:title", content: "User details — UniManage" },
      { property: "og:description", content: "Everything about this customer, in one view." },
    ],
  }),
  component: UserDetailPage,
});

const SERVICE_KEYS: ServiceKey[] = ["medical", "grocery", "beauty", "stationery", "combined"];

function UserDetailPage() {
  const { userId } = useParams({ from: "/admin/users/$userId" });
  const { users, plans, payments, logs, updateUser, deleteUser, addPayment, log, hydrated } = useStore();
  const planMap = usePlanMap();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);

  const user = users.find((u) => u.id === userId);
  const plan = user ? planMap[user.planId] : undefined;
  const history = useMemo(
    () => payments.filter((p) => p.userId === userId).slice(0, 8),
    [payments, userId],
  );
  const activity = useMemo(
    () => logs.filter((l) => user && l.target === user.name).slice(0, 6),
    [logs, user],
  );

  const [newService, setNewService] = useState<ServiceKey>("medical");
  const [newPlanId, setNewPlanId] = useState("");
  const [start, setStart] = useState(iso(new Date()));
  const [expiry, setExpiry] = useState("");

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  if (!user) {
    return (
      <div className="card-surface">
        <EmptyState
          icon={Receipt}
          title="We couldn’t find that customer"
          message="They may have been removed. Head back to the users list to keep going."
          actionLabel="Back to users"
          onAction={() => navigate({ to: "/admin/users" })}
        />
      </div>
    );
  }

  const state = userState(user);
  const servicePlans = plans.filter((p) => p.service === newService && p.active);

  const openChange = () => {
    setNewService(user.service);
    setNewPlanId(user.planId);
    setStart(user.startDate);
    setExpiry(user.expiryDate);
    setChangeOpen(true);
  };

  const pickPlan = (id: string) => {
    setNewPlanId(id);
    const p = plans.find((x) => x.id === id);
    if (p) setExpiry(iso(addMonths(new Date(start + "T00:00:00"), monthsForPeriod(p.period))));
  };

  const applyChange = () => {
    if (!newPlanId) {
      toast.error("Choose a plan before saving.");
      return;
    }
    const chosen = plans.find((p) => p.id === newPlanId)!;
    updateUser(user.id, { service: newService, planId: newPlanId, startDate: start, expiryDate: expiry });
    addPayment({
      txnId: `TXN-2026-${Math.floor(10000 + Math.random() * 89999)}`,
      userId: user.id,
      planId: chosen.id,
      service: chosen.service,
      amount: chosen.price,
      date: iso(new Date()),
      method: "UPI",
      status: "paid",
    });
    log(`Assigned ${chosen.name} subscription`, user.name);
    toast.success("Subscription updated successfully.");
    setChangeOpen(false);
  };

  const renew = () => {
    if (!plan) return;
    const from = new Date();
    const next = iso(addMonths(from, monthsForPeriod(plan.period)));
    updateUser(user.id, { startDate: iso(from), expiryDate: next, status: "active" });
    addPayment({
      txnId: `TXN-2026-${Math.floor(10000 + Math.random() * 89999)}`,
      userId: user.id,
      planId: plan.id,
      service: plan.service,
      amount: plan.price,
      date: iso(from),
      method: "UPI",
      status: "paid",
    });
    log("Renewed a subscription", user.name);
    toast.success("Subscription renewed successfully.");
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
        <Link to="/admin/users">
          <ArrowLeft className="size-4" /> Back to users
        </Link>
      </Button>

      <div className="card-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <InitialsAvatar name={user.name} className="size-14 bg-primary text-lg text-primary-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
            <StatusBadge state={state} />
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={renew}>
            <RefreshCw className="size-4" /> Renew
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button onClick={openChange}>Change subscription</Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete user"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Personal details" description="How to reach them">
          <dl className="divide-y divide-border text-sm">
            {[
              ["Full name", user.name],
              ["Email", user.email],
              ["Phone", user.phone || "—"],
              ["Username", user.username],
              ["Joined", formatDate(user.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 px-5 py-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="truncate font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Subscription" description="What they’re paying for">
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-medium">
                {SERVICE_META[user.service].emoji} {SERVICE_META[user.service].name}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-medium">{plan?.name ?? "No plan assigned"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-medium">
                {plan ? `${formatMoney(plan.price)} / ${plan.period}` : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Start date</dt>
              <dd className="font-medium">{formatDate(user.startDate)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Expiry date</dt>
              <dd className="font-medium">{formatDate(user.expiryDate)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Time left</dt>
              <dd>
                <Pill tone={state === "active" ? "success" : state === "expiring" ? "warning" : "danger"}>
                  {remainingLabel(user.expiryDate)}
                </Pill>
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard title="Payment history" description="Every transaction on this account">
        {history.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No payments yet."
            message="Once this customer pays for a plan, the receipts will show up here."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Transaction</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-5 py-3 font-mono text-xs">{p.txnId}</td>
                    <td className="px-5 py-3">{planMap[p.planId]?.name ?? "—"}</td>
                    <td className="px-5 py-3 font-medium tabular-nums">{formatMoney(p.amount)}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">{formatDate(p.date)}</td>
                    <td className="px-5 py-3">
                      <PaymentBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Activity" description="Recent actions on this account">
        {activity.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nothing has happened here yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span>{a.action}</span>
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  {formatDateTime(a.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <UserFormDialog open={editOpen} onOpenChange={setEditOpen} editing={user} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Are you sure you want to delete ${user.name}?`}
        description="This action cannot be undone. Their subscription and payment history will be removed."
        confirmLabel="Delete user"
        onConfirm={() => {
          deleteUser(user.id);
          log("Deleted a user account", user.name, "warning");
          toast.success("User deleted successfully.");
          navigate({ to: "/admin/users" });
        }}
      />

      <Dialog open={changeOpen} onOpenChange={setChangeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Change subscription</DialogTitle>
            <DialogDescription>
              Move {user.name} to a different service or plan. Dates update automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
              <p className="text-xs text-muted-foreground">Current plan</p>
              <p className="font-medium">
                {plan ? `${plan.name} · ${formatMoney(plan.price)}/${plan.period}` : "No plan assigned"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">New service</Label>
                <Select
                  value={newService}
                  onValueChange={(v) => {
                    setNewService(v as ServiceKey);
                    setNewPlanId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {SERVICE_META[k].emoji} {SERVICE_META[k].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">New plan</Label>
                <Select value={newPlanId} onValueChange={pickPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePlans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · ₹{p.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Start date</Label>
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Expiry date</Label>
                <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyChange}>Update subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
