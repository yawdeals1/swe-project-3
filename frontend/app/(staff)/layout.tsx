import { redirect } from "next/navigation";
import { getSession, roleHome } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";
import { DashboardShell } from "@/components/DashboardShell";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "STAFF" && session.user.role !== "ADMIN") {
    redirect(roleHome(session.user.role));
  }
  return (
    <DashboardShell brand="Carvo Staff" sidebar={<Sidebar role="STAFF" />}>
      {children}
    </DashboardShell>
  );
}
