import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { Banner } from "@/components/Banner";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <Banner error={error} />
      <form action={registerAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <span className="text-xs text-zinc-500">At least 8 characters.</span>
        </label>
        <button
          type="submit"
          className="mt-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Sign up
        </button>
      </form>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-950 dark:text-zinc-50">
          Log in
        </Link>
      </p>
    </div>
  );
}
