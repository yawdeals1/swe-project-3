import { redirect } from "next/navigation";
import { getSession, roleHome } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect(roleHome(session.user.role));
  }
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar role="ADMIN" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
