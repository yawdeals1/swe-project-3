import { redirect } from "next/navigation";
import { getSession, roleHome } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect(roleHome(session.user.role));
  }
  return <>{children}</>;
}
