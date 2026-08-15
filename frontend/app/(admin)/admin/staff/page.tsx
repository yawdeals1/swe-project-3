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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Staff &amp; branches</h1>
      <Banner error={error} success={success} />

      <div className="mb-10 flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {staff.length === 0 ? (
          <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">No staff or admin accounts yet.</p>
        ) : (
          staff.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {member.role}
                </span>
                <StatusBadge status={member.status} />
                <form action={deleteStaffAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
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
        <form action={createStaffAction} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="font-medium">Add staff / admin account</h2>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="password"
            name="password"
            placeholder="Temporary password"
            required
            minLength={8}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            name="role"
            defaultValue="STAFF"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            name="branchId"
            defaultValue=""
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">No branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="self-start rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Create account
          </button>
        </form>

        <form action={createBranchAction} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="font-medium">Add branch</h2>
          <input
            type="text"
            name="name"
            placeholder="Branch name"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="self-start rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Add branch
          </button>
        </form>
      </div>
    </div>
  );
}
