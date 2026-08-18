import { LoginPage } from "@/components/LoginPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — UniManage Unified Portal" },
      {
        name: "description",
        content: "Access User Workspace or SuperAdmin Control Room.",
      },
    ],
  }),
  component: LoginPage,
});
