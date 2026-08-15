import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/unimanage/auth";
import { daysUntil, subscriptionState } from "@/lib/unimanage/dates";
import { useStore } from "@/lib/unimanage/store";
import { useTheme } from "@/lib/unimanage/theme";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CommandPalette } from "./CommandPalette";
import { InitialsAvatar } from "./Common";
import { NAV_ITEMS } from "./nav";
import { Pill } from "./StatusBadge";

function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-soft">
        U
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">UniManage</span>
          <span className="block text-[11px] text-muted-foreground">Super Admin</span>
        </span>
      )}
    </div>
  );
}

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-slim px-3 py-4">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-all",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft",
          }}
        >
          <item.icon className="size-4.5 shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative overflow-hidden rounded-full"
    >
      <Sun
        className={cn(
          "size-4.5 transition-all duration-500",
          theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-4.5 transition-all duration-500",
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </Button>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="border-t border-sidebar-border p-3">
      <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
        <div className={cn("flex min-w-0 flex-1 items-center gap-2.5", collapsed && "flex-none")}>
          <InitialsAvatar name={session?.name ?? "Super Admin"} className="bg-primary/12 text-primary" />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{session?.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{session?.email}</p>
            </div>
          )}
        </div>
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            className="rounded-full text-muted-foreground hover:text-destructive"
            onClick={() => {
              signOut();
              toast.success("You have been logged out.");
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationBell() {
  const { users } = useStore();
  const soon = users.filter(
    (u) => u.status === "active" && subscriptionState(u.expiryDate) === "expiring",
  );
  const expired = users.filter((u) => subscriptionState(u.expiryDate) === "expired");
  const count = soon.length + expired.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
          <Bell className="size-4.5" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">Things worth your attention today.</p>
        </div>
        <div className="max-h-72 divide-y divide-border overflow-y-auto scrollbar-slim">
          {count === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              All quiet. Everything looks good today.
            </p>
          )}
          {soon.slice(0, 5).map((u) => (
            <Link
              key={u.id}
              to="/admin/users/$userId"
              params={{ userId: u.id }}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
            >
              <Pill tone="warning" dot={false}>
                {daysUntil(u.expiryDate)}d
              </Pill>
              <span className="text-sm">
                <span className="font-medium">{u.name}</span>’s plan ends soon.
              </span>
            </Link>
          ))}
          {expired.slice(0, 5).map((u) => (
            <Link
              key={u.id}
              to="/admin/users/$userId"
              params={{ userId: u.id }}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
            >
              <Pill tone="danger" dot={false}>
                Ended
              </Pill>
              <span className="text-sm">
                <span className="font-medium">{u.name}</span>’s plan has ended.
              </span>
            </Link>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="w-full justify-center">
            <Link to="/admin/users">View all users</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  let isClerkSignedIn = false;
  try {
    const { isSignedIn } = useUser();
    isClerkSignedIn = Boolean(isSignedIn);
  } catch {
    /* Clerk not active */
  }

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current =
    NAV_ITEMS.find((n) => pathname === n.to) ??
    NAV_ITEMS.find((n) => pathname.startsWith(n.to)) ??
    NAV_ITEMS[0]!;

  useEffect(() => {
    const stored = localStorage.getItem("unimanage.sidebar");
    if (stored) setCollapsed(stored === "collapsed");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      localStorage.setItem("unimanage.sidebar", !c ? "collapsed" : "open");
      return !c;
    });

  const handleSignOut = () => {
    signOut();
    toast.success("You have been logged out.");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <Logo compact={collapsed} />
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={toggleCollapsed} aria-label="Collapse sidebar">
              <PanelLeftClose className="size-4.5" />
            </Button>
          )}
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            className="mx-auto mt-3"
          >
            <PanelLeftOpen className="size-4.5" />
          </Button>
        )}
        <NavLinks collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b border-sidebar-border px-4">
                <Logo />
              </div>
              <NavLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter collapsed={false} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>UniManage</span>
              <ChevronRight className="size-3" />
              <span className="truncate">{current.label}</span>
            </div>
            <h2 className="truncate text-sm font-semibold sm:text-base">{current.label}</h2>
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 md:flex"
          >
            <Search className="size-4" />
            <span className="pr-8">Search anything…</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">
              Ctrl K
            </kbd>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search"
            onClick={() => setPaletteOpen(true)}
          >
            <Search className="size-4.5" />
          </Button>

          <NotificationBell />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {isClerkSignedIn ? (
            <div className="flex items-center gap-2 pl-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                  <InitialsAvatar
                    name={session?.name ?? "Super Admin"}
                    className="bg-primary text-primary-foreground"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{session?.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{session?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/superadmins">
                    <UserIcon className="size-4" /> SuperAdmin Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/superadmins">
                    <Settings className="size-4" /> SuperAdmin Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-rise space-y-6">{children}</div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
