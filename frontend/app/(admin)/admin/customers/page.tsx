import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteCustomerAction, suspendCustomerAction } from "@/lib/actions/admin";
import type { UserSummary } from "@/lib/types";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();
  const customers = await backendFetch<UserSummary[]>("/admin/customers", { token: session!.token });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Customer accounts</h1>
      <Banner error={error} success={success} />

      <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {customers.length === 0 ? (
          <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">No customer accounts found.</p>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{customer.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={customer.status} />
                <form action={suspendCustomerAction}>
                  <input type="hidden" name="id" value={customer.id} />
                  <button
                    type="submit"
                    disabled={customer.status === "SUSPENDED" || customer.status === "DELETED"}
                    className="rounded-full border border-amber-300 px-4 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950"
                  >
                    Suspend
                  </button>
                </form>
                <form action={deleteCustomerAction}>
                  <input type="hidden" name="id" value={customer.id} />
                  <button
                    type="submit"
                    disabled={customer.status === "DELETED"}
                    className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Deactivate
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
