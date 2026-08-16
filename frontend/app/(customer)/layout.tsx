import { redirect } from "next/navigation";
import { getSession, roleHome } from "@/lib/session";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "CUSTOMER") {
    redirect(roleHome(session.user.role));
  }
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
