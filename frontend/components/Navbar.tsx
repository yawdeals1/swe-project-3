import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { getSession, roleHome } from "@/lib/session";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href={session ? roleHome(session.user.role) : "/"}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Image src="/icons/logo.svg" alt="" width={22} height={22} className="dark:invert" />
          Carvo
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/vehicles" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
            Browse vehicles
          </Link>
          {!session && (
            <>
              <Link href="/login" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-zinc-950 px-4 py-1.5 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}
          {session && (
            <>
              <Link
                href={roleHome(session.user.role)}
                className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Dashboard
              </Link>
              <span className="text-zinc-400 dark:text-zinc-600">{session.user.name}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-4 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Log out
                </button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
