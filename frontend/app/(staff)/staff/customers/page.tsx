import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Look up a customer</h1>

      <form className="mb-6 flex gap-2" action="/staff/customers">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or email"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Search
        </button>
      </form>

      {customers.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {q ? "No customers match that search." : "No customers yet."}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/staff/customers/${customer.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{customer.email}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
