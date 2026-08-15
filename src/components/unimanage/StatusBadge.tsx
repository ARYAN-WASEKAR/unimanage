import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

const toneClass: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  brand: "bg-primary/10 text-primary border-primary/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Pill({
  tone = "neutral",
  children,
  className,
  dot = true,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const stateMap = {
  active: { tone: "success" as Tone, label: "Active" },
  expiring: { tone: "warning" as Tone, label: "Expiring soon" },
  expired: { tone: "danger" as Tone, label: "Plan ended" },
  inactive: { tone: "neutral" as Tone, label: "Inactive" },
};

export function StatusBadge({ state }: { state: keyof typeof stateMap }) {
  const s = stateMap[state];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

const paymentMap = {
  paid: { tone: "success" as Tone, label: "Paid" },
  pending: { tone: "warning" as Tone, label: "Pending" },
  failed: { tone: "danger" as Tone, label: "Failed" },
  refunded: { tone: "info" as Tone, label: "Refunded" },
};

export function PaymentBadge({ status }: { status: keyof typeof paymentMap }) {
  const s = paymentMap[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}
