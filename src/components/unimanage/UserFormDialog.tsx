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
import { addMonths, iso, monthsForPeriod } from "@/lib/unimanage/dates";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { useStore } from "@/lib/unimanage/store";
import type { AccountStatus, ServiceKey, User } from "@/lib/unimanage/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const SERVICE_KEYS: ServiceKey[] = ["medical", "grocery", "beauty", "stationery", "combined"];

interface FormState {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirm: string;
  status: AccountStatus;
  service: ServiceKey;
  planId: string;
  startDate: string;
  expiryDate: string;
}

const blank = (): FormState => ({
  name: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  confirm: "",
  status: "active",
  service: "medical",
  planId: "",
  startDate: iso(new Date()),
  expiryDate: "",
});

export function UserFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: User | null;
}) {
  const { plans, addUser, updateUser, log } = useStore();
  const [form, setForm] = useState<FormState>(blank);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        username: editing.username,
        password: "",
        confirm: "",
        status: editing.status,
        service: editing.service,
        planId: editing.planId,
        startDate: editing.startDate,
        expiryDate: editing.expiryDate,
      });
    } else {
      setForm(blank());
    }
  }, [open, editing]);

  const servicePlans = useMemo(
    () => plans.filter((p) => p.service === form.service && p.active),
    [plans, form.service],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pickPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    setForm((f) => {
      const start = f.startDate || iso(new Date());
      const expiry = plan
        ? iso(addMonths(new Date(start + "T00:00:00"), monthsForPeriod(plan.period)))
        : f.expiryDate;
      return { ...f, planId, expiryDate: expiry };
    });
  };

  const submit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please add at least a name and an email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("That email address doesn’t look right.");
      return;
    }
    if (!form.planId) {
      toast.error("Pick a subscription plan for this customer.");
      return;
    }
    if (!editing && form.password !== form.confirm) {
      toast.error("The two passwords don’t match.");
      return;
    }
    if (!editing && form.password.length < 6) {
      toast.error("Use a password of at least 6 characters.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      username: form.username.trim() || form.email.split("@")[0]!,
      status: form.status,
      role: "USER" as const,
      service: form.service,
      planId: form.planId,
      startDate: form.startDate,
      expiryDate: form.expiryDate,
    };

    if (editing) {
      updateUser(editing.id, payload);
      log("Updated a user account", payload.name);
      toast.success("User updated successfully.");
    } else {
      addUser(payload);
      toast.success("User created successfully 🎉");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto scrollbar-slim">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : "Add a new customer"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update their details, account status or subscription."
              : "A few details and they’re ready to go."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Personal information
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rahul Sharma" />
              </Field>
              <Field label="Email">
                <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="rahul@example.com" />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Username">
                <Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="rahul" />
              </Field>
            </div>
          </section>

          {!editing && (
            <section className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Account
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Password">
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </Field>
                <Field label="Confirm password">
                  <Input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => set("confirm", e.target.value)}
                    placeholder="Repeat the password"
                  />
                </Field>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Subscription
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Account status">
                <Select value={form.status} onValueChange={(v) => set("status", v as AccountStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Service category">
                <Select
                  value={form.service}
                  onValueChange={(v) => setForm((f) => ({ ...f, service: v as ServiceKey, planId: "" }))}
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
              </Field>
              <Field label="Subscription plan">
                <Select value={form.planId} onValueChange={pickPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePlans.length === 0 && (
                      <div className="px-2 py-3 text-xs text-muted-foreground">
                        No active plans for this service yet.
                      </div>
                    )}
                    {servicePlans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · ₹{p.price}/{p.period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date">
                  <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                </Field>
                <Field label="Expiry date">
                  <Input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Create user"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
