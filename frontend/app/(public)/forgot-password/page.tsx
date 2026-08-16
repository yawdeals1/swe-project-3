import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { Banner } from "@/components/Banner";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const success = sent ? "If an account exists for that email, we've sent a reset link." : undefined;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Enter the email on your account and we&apos;ll send you a link to reset your password.
      </p>
      <Banner error={error} success={success} />
      <form action={requestPasswordResetAction} className="flex flex-col gap-4">
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
        <button
          type="submit"
          className="mt-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Send reset link
        </button>
      </form>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/login" className="font-medium text-zinc-950 dark:text-zinc-50">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
