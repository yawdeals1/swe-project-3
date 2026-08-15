import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Banner } from "@/components/Banner";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pending?: string; verified?: string }>;
}) {
  const { error, pending, verified } = await searchParams;
  const success = verified
    ? "Email confirmed — sign in below."
    : pending
      ? "Check your email to confirm your account, then sign in below."
      : undefined;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <Banner error={error} success={success} />
      <form action={loginAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Log in
        </button>
      </form>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-zinc-950 dark:text-zinc-50">
          Sign up
        </Link>
      </p>
    </div>
  );
}
