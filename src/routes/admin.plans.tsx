import { EmptyState, PageHeader } from "@/components/unimanage/Common";
import { ConfirmDialog } from "@/components/unimanage/ConfirmDialog";
import { PlanFormDialog } from "@/components/unimanage/PlanFormDialog";
import { Pill } from "@/components/unimanage/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/unimanage/dates";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { useStore } from "@/lib/unimanage/store";
import type { Plan } from "@/lib/unimanage/types";
import { createFileRoute } from "@tanstack/react-router";
import { Check, MoreHorizontal, Package, Pencil, Plus, Power, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/plans")({
  head: () => ({
    meta: [
      { title: "Subscription plans — UniManage" },
      { name: "description", content: "Create, price and manage every UniManage subscription plan." },
      { property: "og:title", content: "Subscription plans — UniManage" },
      { property: "og:description", content: "Decide what customers get, and what they pay." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const { plans, users, updatePlan, deletePlan, log, hydrated } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [toDelete, setToDelete] = useState<Plan | null>(null);
  const [toToggle, setToToggle] = useState<Plan | null>(null);

  const usersOn = (planId: string) => users.filter((u) => u.planId === planId).length;

  const create = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Plans and pricing"
        subtitle="Decide what your customers get, and what they pay for it."
        action={
          <Button onClick={create}>
            <Plus className="size-4" /> Create new plan
          </Button>
        }
      />

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-surface space-y-3 p-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={Package}
            title="No subscription plans created yet."
            message="Plans are how you package UniManage for your customers. Create your first one."
            actionLabel="Create new plan"
            onAction={create}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="card-surface hover-lift flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {SERVICE_META[plan.service].emoji}{" "}
                    {SERVICE_META[plan.service].name.replace(" Management", "")}
                  </p>
                  <h3 className="mt-0.5 font-semibold">{plan.name}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Plan actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(plan);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="size-4" /> Edit plan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (plan.active) {
                          setToToggle(plan);
                        } else {
                          updatePlan(plan.id, { active: true });
                          log("Activated a plan", plan.name);
                          toast.success("Plan updated successfully.");
                        }
                      }}
                    >
                      <Power className="size-4" /> {plan.active ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(plan)}>
                      <Trash2 className="size-4" /> Delete plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {formatMoney(plan.price)}
                <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {plan.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.features.length === 0 && (
                  <li className="text-xs text-muted-foreground">No features listed yet.</li>
                )}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {usersOn(plan.id)} active user{usersOn(plan.id) === 1 ? "" : "s"}
                </span>
                <Pill tone={plan.active ? "success" : "neutral"}>
                  {plan.active ? "Live" : "Paused"}
                </Pill>
              </div>
            </article>
          ))}
        </div>
      )}

      <PlanFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Are you sure you want to delete ${toDelete?.name ?? "this plan"}?`}
        description={
          toDelete && usersOn(toDelete.id) > 0
            ? `${usersOn(toDelete.id)} customer(s) are currently on this plan and may be affected. This cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete plan"
        onConfirm={() => {
          if (!toDelete) return;
          deletePlan(toDelete.id);
          log("Deleted a subscription plan", toDelete.name, "warning");
          toast.success("Plan deleted successfully.");
          setToDelete(null);
        }}
      />

      <ConfirmDialog
        open={!!toToggle}
        onOpenChange={(v) => !v && setToToggle(null)}
        title={`Pause ${toToggle?.name ?? "this plan"}?`}
        description="Users currently using this plan may be affected. It will no longer be offered when assigning subscriptions."
        confirmLabel="Deactivate plan"
        destructive={false}
        onConfirm={() => {
          if (!toToggle) return;
          updatePlan(toToggle.id, { active: false });
          log("Deactivated a plan", toToggle.name, "warning");
          toast.success("Plan updated successfully.");
          setToToggle(null);
        }}
      />
    </>
  );
}
