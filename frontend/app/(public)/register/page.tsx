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
      <h1 className="text-headline-lg text-on-surface">Create an account</h1>
      <Banner error={error} />
      <form
        action={registerAction}
        className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
          Full name
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
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
        <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
          Password
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
          Sign up
        </button>
      </form>
      <p className="text-body-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
