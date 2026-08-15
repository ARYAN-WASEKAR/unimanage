import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "var(--popover-foreground)",
    boxShadow: "var(--shadow-soft-value)",
  },
  labelStyle: { color: "var(--muted-foreground)", marginBottom: 4 },
  cursor: { fill: "color-mix(in oklab, var(--muted-foreground) 10%, transparent)" },
};

export function GrowthChart({ data }: { data: Array<{ month: string; users: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="umGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={44} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: "var(--border)" }} />
        <Area
          type="monotone"
          dataKey="users"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
          fill="url(#umGrowth)"
          dot={{ r: 0 }}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: Array<{ month: string; revenue: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={56} tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
        <Bar dataKey="revenue" fill="var(--chart-1)" radius={[8, 8, 4, 4]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 260,
}: {
  data: Array<{ name: string; value: number }>;
  height?: number;
}) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={3}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} cursor={false} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBars({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <XAxis type="number" {...axis} tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} />
        <YAxis type="category" dataKey="name" {...axis} width={110} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
        <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 8, 8, 4]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
