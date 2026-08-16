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
      <div>
        <h1 className="text-headline-lg text-on-surface">Reset your password</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Enter your account email and we&apos;ll send you a link to set a new password.
        </p>
      </div>
      <Banner error={error} success={success} />
      <form
        action={requestPasswordResetAction}
        className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-container"
        >
          Send reset link
        </button>
      </form>
      <p className="text-body-sm text-on-surface-variant">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
