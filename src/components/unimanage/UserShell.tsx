import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_NAV_ITEMS } from "@/components/unimanage/userNav";
import { useAuth } from "@/lib/unimanage/auth";
import { getUserSubscriptionState, hasFeature } from "@/lib/unimanage/permissions";
import { SERVICE_META } from "@/lib/unimanage/seed";
import { usePlanMap, useStore } from "@/lib/unimanage/store";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldAlert,
  Sparkles,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import type { ServiceKey, User } from "@/lib/unimanage/types";

export function UserShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const { users, notifications } = useStore();
  const planMap = usePlanMap();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // Find active user record or construct from session identity
  const foundUser = users.find(
    (u) =>
      (session?.email && u.email.toLowerCase() === session.email.toLowerCase()) ||
      (session?.username && u.username.toLowerCase() === session.username.toLowerCase()),
  );

  const currentUser: User = foundUser || {
    id: "usr-active",
    name: session?.name || "User",
    email: session?.email || "user@unimanage.app",
    phone: "+91 98765-43210",
    username: session?.username || "user",
    status: "active",
    role: session?.role || "USER",
    service: "medical",
    planId: "plan-med-pro",
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    businessName: `${session?.name || "User"}'s Store`,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const currentPlan = currentUser ? planMap[currentUser.planId] : null;
  const subState = getUserSubscriptionState(currentUser || null);
  const serviceMeta = SERVICE_META[(currentUser.service as ServiceKey) || "combined"] || SERVICE_META.combined;

  // Unread notifications count
  const unreadCount = (notifications || []).filter(
    (n) => n.userId === currentUser?.id && !n.read,
  ).length;

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleSignOut = () => {
    signOut();
    toast.info("Signed out of your account.");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
      {/* EXPIRING SUBSCRIPTION BANNER */}
      {subState === "EXPIRING_SOON" && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-700 dark:text-amber-400 px-4 py-2 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 animate-bounce" />
            <span>
              Your subscription is expiring soon. Renew now to maintain uninterrupted workspace access.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/20"
            onClick={() => navigate({ to: "/user/subscription" })}
          >
            Renew Now
          </Button>
        </div>
      )}

      <div className="flex flex-1">
        {/* MOBILE SIDEBAR BACKDROP */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* BRAND HEADER */}
          <div className="h-16 px-6 border-b border-border flex items-center justify-between">
            <Link to="/user/dashboard" className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                U
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-base leading-tight">UniManage</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  User Workspace
                </span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-8"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* BUSINESS / SECTOR CARD */}
          <div className="p-4 border-b border-border/60 bg-muted/30">
            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                  {currentUser?.businessName || "My Business"}
                </span>
                <span className="text-sm">{serviceMeta.emoji}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                  {currentUser?.service || "combined"}
                </Badge>
                {currentPlan && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    {currentPlan.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* NAV LINKS LIST */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {USER_NAV_ITEMS.map((item) => {
              // Feature permission guard
              if (item.feature && !hasFeature(currentUser || null, currentPlan || null, item.feature)) {
                return null;
              }

              const active = pathname.startsWith(item.to);
              const Icon = item.icon;

              return (
                <div key={item.to} className="space-y-1">
                  <Link
                    to={item.to as any}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.to === "/user/notifications" && unreadCount > 0 && (
                      <Badge variant="destructive" className="size-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* USER FOOTER */}
          <div className="p-4 border-t border-border bg-card">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start gap-2.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="size-4 text-muted-foreground" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER TOPBAR */}
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden size-9"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <div className="relative hidden sm:block w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, customers..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* RIGHT HEADER ACTIONS */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: "/user/notifications" })}
                className="relative size-9 text-muted-foreground hover:text-foreground"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-destructive rounded-full ring-2 ring-background" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDark}
                className="size-9 text-muted-foreground hover:text-foreground"
              >
                {dark ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4" />}
              </Button>

              {/* USER PROFILE DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-1.5 py-1 rounded-xl h-auto hover:bg-accent">
                    <Avatar className="size-7 border border-border">
                      <AvatarImage src={session?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {(session?.name || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-semibold leading-tight">{session?.name || "User"}</span>
                      <span className="text-[10px] text-muted-foreground">{session?.email}</span>
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-semibold leading-none">{session?.name}</p>
                      <p className="text-[11px] leading-none text-muted-foreground">{session?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/user/profile" })} className="gap-2 cursor-pointer text-xs">
                    <UserIcon className="size-4" /> Profile & Business
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/user/subscription" })} className="gap-2 cursor-pointer text-xs">
                    <ShieldAlert className="size-4" /> Subscription & Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/user/settings" })} className="gap-2 cursor-pointer text-xs">
                    <Sparkles className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive cursor-pointer text-xs focus:text-destructive">
                    <LogOut className="size-4" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* MAIN PAGE VIEW */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
