import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { createBranchAction, createStaffAction, deleteStaffAction } from "@/lib/actions/admin";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import type { BranchResponse, UserSummary } from "@/lib/types";

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();
  const [staff, branches] = await Promise.all([
    backendFetch<UserSummary[]>("/admin/staff", { token: session!.token }),
    backendFetch<BranchResponse[]>("/admin/branches", { token: session!.token }),
  ]);

  return (
    <div className="p-density-admin md:p-gutter">
      <h1 className="mb-1 text-headline-lg text-on-surface">Staff &amp; branches</h1>
      <p className="mb-gutter text-body-sm text-secondary">Manage staff/admin accounts and branch locations.</p>
      <Banner error={error} success={success} />

      <div className="mb-10 flex flex-col divide-y divide-whisper rounded-lg border border-whisper bg-surface">
        {staff.length === 0 ? (
          <p className="px-4 py-3 text-body-sm text-on-surface-variant">No staff or admin accounts yet.</p>
        ) : (
          staff.map((member) => (
            <div key={member.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-on-surface">{member.name}</p>
                <p className="truncate text-body-sm text-on-surface-variant">{member.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-label-caps text-on-secondary-container">
                  {member.role}
                </span>
                <StatusBadge status={member.status} />
                <form action={deleteStaffAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-error px-4 py-1.5 text-body-sm font-medium text-error transition-colors hover:bg-error-container hover:text-on-error-container"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <form action={createStaffAction} className="flex flex-col gap-3 rounded-lg border border-whisper bg-surface p-5">
          <h2 className="font-medium text-on-surface">Add staff / admin account</h2>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            required
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <select
            name="role"
            defaultValue="STAFF"
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            name="branchId"
            defaultValue=""
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">No branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <p className="text-label-caps text-secondary">
            They&apos;ll get a confirmation email, then set their own password from the login page.
          </p>
          <button
            type="submit"
            className="self-start rounded-lg bg-primary px-5 py-2 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
          >
            Create account
          </button>
        </form>

        <form action={createBranchAction} className="flex flex-col gap-3 rounded-lg border border-whisper bg-surface p-5">
          <h2 className="font-medium text-on-surface">Add branch</h2>
          <input
            type="text"
            name="name"
            placeholder="Branch name"
            required
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="self-start rounded-lg border border-outline-variant px-5 py-2 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant"
          >
            Add branch
          </button>
        </form>
      </div>
    </div>
  );
}
