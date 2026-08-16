import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { UiIcon } from "@/components/Icon";
import type { UserSummary } from "@/lib/types";

export default async function StaffCustomerLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await getSession();
  const customers = await backendFetch<UserSummary[]>(
    `/staff/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    { token: session!.token },
  );

  return (
    <div className="p-density-admin md:p-gutter">
      <h1 className="mb-1 text-headline-lg text-on-surface">Look up a customer</h1>
      <p className="mb-gutter text-body-sm text-secondary">Find a customer to view their booking and rental history.</p>

      <form className="mb-6 flex gap-2" action="/staff/customers">
        <div className="relative flex-1">
          <UiIcon name="search" size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name or email"
            className="w-full rounded-lg border border-outline-variant bg-surface py-2 pr-3 pl-9 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-container">
          Search
        </button>
      </form>

      {customers.length === 0 ? (
        <p className="rounded-lg border border-whisper bg-surface p-8 text-center text-body-sm text-on-surface-variant">
          {q ? "No customers match that search." : "No customers yet."}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-whisper rounded-lg border border-whisper bg-surface">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/staff/customers/${customer.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-container-low"
            >
              <div>
                <p className="font-medium text-on-surface">{customer.name}</p>
                <p className="text-body-sm text-on-surface-variant">{customer.email}</p>
              </div>
              <UiIcon name="chevron_right" className="text-secondary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
