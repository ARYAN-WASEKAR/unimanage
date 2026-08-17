import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { ActivityLog } from "@/lib/unimanage/types";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Download,
  FileJson,
  Info,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logs")({
  component: ActivityLogsPage,
});

function ActivityLogsPage() {
  const { logs } = useStore();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((item: ActivityLog) => {
      const matchesSearch =
        item.action.toLowerCase().includes(search.toLowerCase()) ||
        (item.admin && item.admin.toLowerCase().includes(search.toLowerCase())) ||
        (item.target && item.target.toLowerCase().includes(search.toLowerCase()));

      const matchesLevel = levelFilter === "all" || item.status === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [logs, search, levelFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const infoCount = logs.filter((l) => l.status === "success" || !l.status).length;
    const warningCount = logs.filter((l) => l.status === "warning").length;
    const dangerCount = logs.filter((l) => l.status === "failed").length;
    return { total, infoCount, warningCount, dangerCount };
  }, [logs]);

  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.warning("No logs to export.");
      return;
    }

    const headers = ["ID", "Timestamp", "Admin", "Action", "Target", "Status"];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.at}"`,
      `"${l.admin || "Super Admin"}"`,
      `"${l.action}"`,
      `"${l.target || ""}"`,
      l.status || "success",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unimanage_activity_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Activity logs exported to CSV!");
  };

  const exportJSON = () => {
    if (filteredLogs.length === 0) {
      toast.warning("No logs to export.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `unimanage_activity_logs_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Activity logs exported to JSON!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Activity className="size-7 text-primary" />
            System Activity & Audit Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete real-time audit trail of all SuperAdmin actions, account modifications, and system events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="size-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportJSON} className="gap-2">
            <FileJson className="size-4" /> Export JSON
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Log Entries
            </CardTitle>
            <Activity className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorded audit events</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Successful Actions
            </CardTitle>
            <Info className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.infoCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Standard operations & logins</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Warning Alerts
            </CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.warningCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Configuration updates</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Failed / Critical
            </CardTitle>
            <ShieldCheck className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.dangerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Deletions & failed actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Datatable & Controls */}
      <Card className="border-border/60 shadow-soft">
        <CardHeader className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs by action or admin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40 h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="failed">Failed / Critical</SelectItem>
                </SelectContent>
              </Select>
              {(search || levelFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setLevelFilter("all");
                  }}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Admin Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target / Resource</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
                    No activity logs match your search parameters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: ActivityLog) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar name={log.admin || "Super Admin"} className="size-7 text-xs bg-primary/10 text-primary" />
                        <span className="font-medium text-sm">{log.admin || "Super Admin"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-foreground">
                      {log.action}
                    </TableCell>
                    <TableCell>
                      {log.target ? (
                        <Badge variant="outline" className="font-normal text-xs bg-muted/50">
                          {log.target}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {log.status === "failed" ? (
                        <Pill tone="danger" dot>Failed</Pill>
                      ) : log.status === "warning" ? (
                        <Pill tone="warning" dot>Warning</Pill>
                      ) : (
                        <Pill tone="success" dot>Success</Pill>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
