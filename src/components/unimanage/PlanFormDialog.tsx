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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { useStore } from "@/lib/unimanage/store";
import type { BillingPeriod, Plan, ServiceKey } from "@/lib/unimanage/types";
import { Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SERVICE_KEYS: ServiceKey[] = ["medical", "grocery", "beauty", "stationery", "combined"];
const PERIODS: BillingPeriod[] = ["monthly", "quarterly", "half-yearly", "yearly", "custom"];

export function PlanFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Plan | null;
}) {
  const { addPlan, updatePlan, log } = useStore();
  const [name, setName] = useState("");
  const [service, setService] = useState<ServiceKey>("medical");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [features, setFeatures] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setService(editing?.service ?? "medical");
    setDescription(editing?.description ?? "");
    setPrice(editing ? String(editing.price) : "");
    setPeriod(editing?.period ?? "monthly");
    setFeatures(editing?.features ?? []);
    setActive(editing?.active ?? true);
    setDraft("");
  }, [open, editing]);

  const addFeature = () => {
    const value = draft.trim();
    if (!value) return;
    setFeatures((f) => [...f, value]);
    setDraft("");
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("Give the plan a name your customers will recognise.");
      return;
    }
    const amount = Number(price);
    if (!amount || amount <= 0) {
      toast.error("Enter a price greater than zero.");
      return;
    }
    const payload = {
      name: name.trim(),
      service,
      description: description.trim() || "A UniManage subscription plan.",
      price: amount,
      period,
      features,
      active,
    };
    if (editing) {
      updatePlan(editing.id, payload);
      log("Updated a subscription plan", payload.name);
      toast.success("Plan updated successfully.");
    } else {
      addPlan(payload);
      toast.success("Subscription plan created successfully.");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto scrollbar-slim">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.name}` : "Create a new plan"}</DialogTitle>
          <DialogDescription>
            Plans decide what your customers get and what they pay for it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Plan name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Medical Pro" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Service category</Label>
              <Select value={service} onValueChange={(v) => setService(v as ServiceKey)}>
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Who is this plan for?"
              rows={2}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Price (₹)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="999"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Billing period</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as BillingPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">What’s included</Label>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Unlimited users"
              />
              <Button type="button" variant="secondary" onClick={addFeature}>
                <Plus className="size-4" /> Add
              </Button>
            </div>
            {features.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {features.map((f, i) => (
                  <li
                    key={`${f}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                  >
                    <Check className="size-4 text-success" />
                    <span className="flex-1">{f}</span>
                    <button
                      type="button"
                      onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${f}`}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium">Plan is live</p>
              <p className="text-xs text-muted-foreground">
                Inactive plans stay hidden when assigning subscriptions.
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save plan" : "Create plan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
