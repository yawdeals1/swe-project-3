import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingResponse } from "@/lib/types";

const STATUSES = ["PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await getSession();
  const bookings = await backendFetch<BookingResponse[]>(`/admin/bookings${status ? `?status=${status}` : ""}`, {
    token: session!.token,
  });

  const sorted = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const totalRevenue = bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Completed revenue shown: {formatCurrency(totalRevenue)}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <a
          href="/admin/bookings"
          className={`rounded-full px-3 py-1 ${!status ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black" : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"}`}
        >
          All
        </a>
        {STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin/bookings?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black" : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"}`}
          >
            {s}
          </a>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No bookings match this filter.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {sorted.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">
                  {booking.vehicleLabel} &middot; {booking.customerName}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)} &middot;{" "}
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
