import { UserShell } from "@/components/unimanage/UserShell";
import { useAuth } from "@/lib/unimanage/auth";
import { getUserSubscriptionState } from "@/lib/unimanage/permissions";
import { useStore } from "@/lib/unimanage/store";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/user")({
  ssr: false,
  component: UserLayout,
});

function UserLayout() {
  const { session, ready } = useAuth();
  const { users } = useStore();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });

  // SuperAdmin and Admin accounts are never restricted by customer subscription checks
  const isAdmin = session?.role === "SUPER_ADMIN" || session?.role === "ADMIN";

  // Find user object matching session email or username
  const currentUser = session
    ? users.find(
        (u) =>
          u.email.toLowerCase() === session.email.toLowerCase() ||
          u.username.toLowerCase() === session.username.toLowerCase(),
      )
    : null;

  const subState = currentUser ? getUserSubscriptionState(currentUser) : "ACTIVE";

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      navigate({ to: "/", replace: true });
      return;
    }

    // Subscription expiry check: skip for admins, allow profile & subscription pages
    if (
      !isAdmin &&
      subState === "EXPIRED" &&
      !pathname.includes("/user/subscription") &&
      !pathname.includes("/user/profile")
    ) {
      navigate({ to: "/subscription-required", replace: true });
    }
  }, [ready, session, subState, pathname, navigate, isAdmin]);

  if (!ready || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <UserShell>
      <Outlet />
    </UserShell>
  );
}
