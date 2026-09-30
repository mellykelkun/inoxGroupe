import { notFound } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";

export default function PreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <AdminDashboard
      currentMember={{
        userId: "00000000-0000-4000-8000-000000000001",
        sessionId: "aperçu-local-sans-session-réelle",
        email: "apercu@inox.local",
        displayName: "Aperçu INOX",
        role: "viewer",
      }}
    />
  );
}
