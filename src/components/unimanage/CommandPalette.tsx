import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatDate, formatMoney } from "@/lib/unimanage/dates";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import { useNavigate } from "@tanstack/react-router";
import { CreditCard, LayoutGrid, Package, Receipt, Users } from "lucide-react";
import { NAV_ITEMS } from "./nav";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { users, plans, services, payments } = useStore();
  const planMap = usePlanMap();
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search users, plans, payments or jump to a page…" />
      <CommandList className="scrollbar-slim">
        <CommandEmpty>Nothing matched that search. Try another word.</CommandEmpty>

        <CommandGroup heading="Pages">
          {NAV_ITEMS.map((item) => (
            <CommandItem key={item.to} value={`page ${item.label}`} onSelect={() => go(item.to)}>
              <LayoutGrid className="size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Users">
          {users.slice(0, 40).map((u) => {
            const plan = planMap[u.planId];
            return (
              <CommandItem
                key={u.id}
                value={`user ${u.name} ${u.email} ${plan?.name ?? ""}`}
                onSelect={() => go(`/admin/users/${u.id}`)}
              >
                <Users className="size-4" />
                <span className="font-medium">{u.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {plan ? `${plan.name} · ${formatMoney(plan.price)}` : "No plan"} · expires{" "}
                  {formatDate(u.expiryDate)}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading="Plans">
          {plans.map((p) => (
            <CommandItem key={p.id} value={`plan ${p.name}`} onSelect={() => go("/admin/plans")}>
              <Package className="size-4" />
              {p.name}
              <span className="ml-auto text-xs text-muted-foreground">
                {formatMoney(p.price)}/{p.period}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Services">
          {services.map((s) => (
            <CommandItem
              key={s.id}
              value={`service ${s.name}`}
              onSelect={() => go("/admin/services")}
            >
              <CreditCard className="size-4" />
              {s.emoji} {s.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Payments">
          {payments.slice(0, 20).map((p) => (
            <CommandItem
              key={p.id}
              value={`payment ${p.txnId}`}
              onSelect={() => go("/admin/payments")}
            >
              <Receipt className="size-4" />
              {p.txnId}
              <span className="ml-auto text-xs text-muted-foreground">{formatMoney(p.amount)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
