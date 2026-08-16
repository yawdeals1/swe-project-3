import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Banner } from "@/components/Banner";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ reset_token?: string; error?: string }>;
}) {
  const { reset_token: token, error } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <Banner error="This reset link is missing or invalid. Request a new one." />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/forgot-password" className="font-medium text-zinc-950 dark:text-zinc-50">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
      <Banner error={error} />
      <form action={resetPasswordAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <label className="flex flex-col gap-1 text-sm">
          New password
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
        <label className="flex flex-col gap-1 text-sm">
          Confirm new password
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Update password
        </button>
      </form>
    </div>
  );
}
