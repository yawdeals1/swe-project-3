import Link from "next/link";
import { confirmPasswordResetAction } from "@/lib/actions/auth";
import { Banner } from "@/components/Banner";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; reset_token?: string; error?: string }>;
}) {
  const { token, reset_token, error } = await searchParams;
  const resetToken = token ?? reset_token ?? "";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-headline-lg text-on-surface">Set a new password</h1>
      <Banner error={error} />

      {resetToken ? (
        <form
          action={confirmPasswordResetAction}
          className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
        >
          <input type="hidden" name="token" value={resetToken} />
          <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
            New password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-label-caps text-secondary">At least 8 characters.</span>
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-container"
          >
            Set password
          </button>
        </form>
      ) : (
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-body-md text-on-surface-variant shadow-sm">
          This reset link is missing its token. Request a new one from the{" "}
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            forgot password
          </Link>{" "}
          page.
        </p>
      )}
    </div>
  );
}
