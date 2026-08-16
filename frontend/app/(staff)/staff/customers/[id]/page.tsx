import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingResponse, UserSummary } from "@/lib/types";

export default async function StaffCustomerHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  let customer: UserSummary;
  try {
    customer = await backendFetch<UserSummary>(`/staff/customers/${id}`, { token: session!.token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  const bookings = await backendFetch<BookingResponse[]>(`/staff/customers/${id}/bookings`, {
    token: session!.token,
  });
  const sorted = [...bookings].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/staff/customers" className="mb-6 inline-block text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        &larr; Back to customer lookup
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {customer.email} {customer.phone ? `· ${customer.phone}` : ""}
          </p>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      <h2 className="mb-3 font-medium">Booking &amp; rental history</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">This customer has no bookings yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {sorted.map((booking) => (
            <Link
              key={booking.id}
              href={`/staff/bookings/${booking.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="font-medium">{booking.vehicleLabel}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)} &middot;{" "}
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
