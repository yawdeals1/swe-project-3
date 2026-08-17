import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { getSession, roleHome } from "@/lib/session";
import { UiIcon } from "@/components/Icon";
import { TopNavLinks } from "@/components/TopNavLinks";
import { MobileNav } from "@/components/MobileNav";

export async function TopNav() {
  const session = await getSession();

  const links = session
    ? [
        { href: roleHome(session.user.role), label: "Dashboard" },
        { href: "/vehicles", label: "Browse" },
      ]
    : [
        { href: "/vehicles", label: "Browse" },
        { href: "/login", label: "Login" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-gutter py-4">
        <div className="flex items-center gap-2">
          <MobileNav links={links} userName={session?.user.name} logoutAction={session ? logoutAction : undefined} />
          <Link href={session ? roleHome(session.user.role) : "/"} className="flex items-center gap-2 text-headline-md font-bold text-primary">
            <UiIcon name="directions_car" />
            Carvo
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <TopNavLinks links={links} />
          {session && <span className="text-body-sm text-secondary">{session.user.name}</span>}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-outline-variant px-4 py-2 text-body-sm font-medium text-on-surface transition-colors hover:bg-surface-variant"
              >
                Log out
              </button>
            </form>
          ) : (
            <Link
              href="/vehicles"
              className="rounded-lg bg-primary-container px-6 py-2 font-medium text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary"
            >
              Rent a Car
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
