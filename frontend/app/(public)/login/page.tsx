import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Banner } from "@/components/Banner";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pending?: string; verified?: string }>;
}) {
  const { error, pending, verified } = await searchParams;
  const success =
    verified === "reset"
      ? "Password updated — sign in below."
      : verified
        ? "Email confirmed — sign in below."
        : pending === "reset"
          ? "Check your email for a link to set a new password."
          : pending
            ? "Check your email to confirm your account, then sign in below."
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
