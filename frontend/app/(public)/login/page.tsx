import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { Banner } from "@/components/Banner";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pending?: string; verified?: string; reset?: string; reset_token?: string }>;
}) {
  const { error, pending, verified, reset, reset_token } = await searchParams;
  // Deploro's Site URL is a single fixed redirect target shared by both the email-verify and
  // password-reset links (see auth-base-url in application.yml) — it appends ?verified=1 or
  // ?reset_token=<token> to whatever page it points at. This page is that target for "verified";
  // a reset_token means the same landing hit us instead of /reset-password, so forward it there
  // rather than stranding the token on a page that never reads it.
  if (reset_token) {
    redirect(`/reset-password?reset_token=${encodeURIComponent(reset_token)}`);
  }
  const success = verified
    ? "Email confirmed — sign in below."
    : pending
      ? "Check your email to confirm your account, then sign in below."
      : reset
        ? "Password updated — sign in with your new password."
        : undefined;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-headline-lg text-on-surface">Log in</h1>
      <Banner error={error} success={success} />
      <form
        action={loginAction}
        className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
          <span className="flex items-center justify-between">
            Password
            <Link href="/forgot-password" className="text-label-caps font-normal text-primary hover:underline">
              Forgot password?
            </Link>
          </span>
          <input
            type="password"
            name="password"
            required
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <Link href="/forgot-password" className="self-end text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Forgot password?
        </Link>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-container"
        >
          Log in
        </button>
      </form>
      <p className="text-body-sm text-on-surface-variant">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
