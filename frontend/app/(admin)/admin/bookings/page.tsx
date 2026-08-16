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
  const totalRevenue = bookings.filter((b) => b.status === "COMPLETED").reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="p-density-admin md:p-gutter">
      <div className="mb-gutter flex items-end justify-between">
        <h1 className="text-headline-lg text-on-surface">Bookings</h1>
        <p className="text-body-sm text-secondary">
          Completed revenue: <span className="font-mono text-numeric-data text-on-surface">{formatCurrency(totalRevenue)}</span>
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-body-sm">
        <a
          href="/admin/bookings"
          className={`rounded-full px-3 py-1 ${!status ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-variant"}`}
        >
          All
        </a>
        {STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin/bookings?status=${s}`}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-variant"}`}
          >
            {s}
          </a>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-whisper bg-surface p-8 text-center text-body-sm text-on-surface-variant">
          No bookings match this filter.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-whisper rounded-lg border border-whisper bg-surface">
          {sorted.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium text-on-surface">
                  {booking.vehicleLabel} &middot; {booking.customerName}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)} &middot;{" "}
                  <span className="font-mono">{formatCurrency(booking.totalAmount)}</span>
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
