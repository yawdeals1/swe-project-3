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
    <div className="p-density-admin md:p-gutter">
      <h1 className="mb-6 text-headline-lg text-on-surface">Customer accounts</h1>
      <Banner error={error} success={success} />

      <div className="flex flex-col divide-y divide-whisper rounded-lg border border-whisper bg-surface">
        {customers.length === 0 ? (
          <p className="px-4 py-8 text-center text-body-sm text-on-surface-variant">No customer accounts found.</p>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-on-surface">{customer.name}</p>
                <p className="truncate text-body-sm text-on-surface-variant">{customer.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={customer.status} />
                <form action={suspendCustomerAction}>
                  <input type="hidden" name="id" value={customer.id} />
                  <button
                    type="submit"
                    disabled={customer.status === "SUSPENDED" || customer.status === "DELETED"}
                    className="rounded-full border border-outline-variant px-4 py-1.5 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Suspend
                  </button>
                </form>
                <form action={deleteCustomerAction}>
                  <input type="hidden" name="id" value={customer.id} />
                  <button
                    type="submit"
                    disabled={customer.status === "DELETED"}
                    className="rounded-full border border-error/40 px-4 py-1.5 text-body-sm font-medium text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
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
