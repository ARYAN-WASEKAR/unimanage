import { DonutChart, GrowthChart, RevenueChart } from "@/components/unimanage/charts";
import {
  CardSkeletonGrid,
  InitialsAvatar,
  PageHeader,
  SectionCard,
  StatCard,
  TableSkeleton,
} from "@/components/unimanage/Common";
import { Pill, StatusBadge } from "@/components/unimanage/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney, userState } from "@/lib/unimanage/dates";
import {
  growthSeries,
  monthlyRevenue,
  revenueSeries,
  serviceDistribution,
  statusCounts,
} from "@/lib/unimanage/metrics";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  IndianRupee,
  Layers,
  Pencil,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — UniManage" },
      { name: "description", content: "See users, revenue and renewals across UniManage today." },
      { property: "og:title", content: "Dashboard — UniManage" },
      { property: "og:description", content: "Here’s what’s happening across UniManage today." },
    ],
  }),
  component: DashboardPage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const { users, plans, services, payments, hydrated } = useStore();
  const planMap = usePlanMap();
  const counts = statusCounts(users);
  const revenue = monthlyRevenue(payments);
  const recent = [...users].slice(0, 6);
  const newThisMonth = users.filter(
    (u) => new Date(u.createdAt).getMonth() === new Date().getMonth(),
  ).length;

  return (
    <>
      <PageHeader
        title={`${greeting()}, Super Admin 👋`}
        subtitle="Here’s what’s happening across UniManage today."
        action={
          <Button asChild>
            <Link to="/admin/users">
              <UserPlus className="size-4" /> Manage users
            </Link>
          </Button>
        }
      />

      {!hydrated ? (
        <CardSkeletonGrid count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total users" value={users.length.toLocaleString("en-IN")} icon={Users} trend={12.5} hint="from last month" />
          <StatCard
            label="Active subscriptions"
            value={counts.active.toLocaleString("en-IN")}
            icon={Sparkles}
            tone="success"
            trend={8.2}
            hint="still going strong"
          />
          <StatCard
            label="Expiring soon"
            value={counts.expiring}
            icon={CalendarClock}
            tone="warning"
            hint="within the next 30 days"
          />
          <StatCard
            label="Revenue this month"
            value={formatMoney(revenue || 124500)}
            icon={IndianRupee}
            tone="info"
            trend={5.4}
            hint="from last month"
          />
          <StatCard label="Active services" value={services.filter((s) => s.enabled).length} icon={Layers} hint="categories live" />
          <StatCard
            label="New users"
            value={`+${newThisMonth}`}
            icon={UserPlus}
            tone="success"
            hint="joined this month"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="User growth"
          description="January to August 2026"
          className="lg:col-span-2"
        >
          <div className="p-4">{hydrated ? <GrowthChart data={growthSeries(users)} /> : <div className="h-[260px] animate-pulse rounded-xl bg-muted" />}</div>
        </SectionCard>

        <SectionCard title="Subscription mix" description="Where your users sit today">
          <div className="p-4">
            {hydrated ? (
              <DonutChart data={serviceDistribution(users)} />
            ) : (
              <div className="h-[260px] animate-pulse rounded-xl bg-muted" />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Revenue" description="Paid invoices, month by month" className="lg:col-span-2">
          <div className="p-4">
            {hydrated ? (
              <RevenueChart data={revenueSeries(payments)} />
            ) : (
              <div className="h-[260px] animate-pulse rounded-xl bg-muted" />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Plan status" description="A quick health check">
          <div className="space-y-3 p-5">
            {[
              { label: "Active", value: counts.active, tone: "success" as const },
              { label: "Expiring soon", value: counts.expiring, tone: "warning" as const },
              { label: "Ended", value: counts.expired, tone: "danger" as const },
            ].map((row) => {
              const total = Math.max(1, users.length);
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Pill tone={row.tone}>{row.label}</Pill>
                    <span className="font-medium tabular-nums">{row.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        row.tone === "success"
                          ? "h-full rounded-full bg-success transition-all duration-700"
                          : row.tone === "warning"
                            ? "h-full rounded-full bg-warning transition-all duration-700"
                            : "h-full rounded-full bg-destructive transition-all duration-700"
                      }
                      style={{ width: `${(row.value / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-2 text-xs text-muted-foreground">
              {counts.expiring === 0
                ? "Everything looks good today — no renewals pending."
                : `${counts.expiring} customer${counts.expiring === 1 ? "" : "s"} could use a friendly nudge.`}
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent users"
        description="The latest people to join UniManage"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/users">View all</Link>
          </Button>
        }
      >
        {!hydrated ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto scrollbar-slim">
            <table className="w-full min-w-[760px] text-sm">
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
                {recent.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={u.name} />
                        <div className="leading-tight">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {SERVICE_META[u.service].emoji} {SERVICE_META[u.service].name.replace(" Management", "")}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{planMap[u.planId]?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge state={userState(u)} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(u.expiryDate)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/admin/users/$userId" params={{ userId: u.id }}>
                            View
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" aria-label="Edit user">
                          <Link to="/admin/users/$userId" params={{ userId: u.id }}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        {plans.length} plans · {services.length} services · {payments.length} transactions on record
      </p>
    </>
  );
}
