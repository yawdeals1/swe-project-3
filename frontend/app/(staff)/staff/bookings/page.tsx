import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { confirmBookingAction, rejectBookingAction } from "@/lib/actions/booking";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { UiIcon } from "@/components/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingResponse } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function StaffBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();

  const [pending, confirmed, ongoing] = await Promise.all([
    backendFetch<BookingResponse[]>("/bookings?status=PENDING", { token: session!.token }),
    backendFetch<BookingResponse[]>("/bookings?status=CONFIRMED", { token: session!.token }),
    backendFetch<BookingResponse[]>("/bookings?status=ONGOING", { token: session!.token }),
  ]);
  const active = [...confirmed, ...ongoing].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const pendingValue = pending.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-8 py-6">
        <div>
          <h2 className="text-headline-lg text-on-surface">Incoming Requests</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">Review and manage pending vehicle bookings.</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <Banner error={error} success={success} />

        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-sm shadow-black/5">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr className="text-label-caps text-on-surface-variant">
                <th className="w-16 px-4 py-3">ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle Requested</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="w-48 px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {pending.map((booking) => (
                <tr key={booking.id} className="group transition-colors hover:bg-surface-container-low">
                  <td className="px-4 py-4 font-mono text-numeric-data text-on-surface-variant">#{booking.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-body-sm font-medium text-on-secondary-container">
                        {initials(booking.customerName)}
                      </div>
                      <span className="font-medium text-body-sm text-on-surface">{booking.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-body-sm text-on-surface">{booking.vehicleLabel}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <UiIcon name="calendar_today" size={14} />
                      {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-numeric-data text-on-surface">{formatCurrency(booking.totalAmount)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <form action={confirmBookingAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <button
                          type="submit"
                          className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-1.5 text-body-sm font-medium text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary"
                        >
                          <UiIcon name="check" size={16} />
                          Confirm
                        </button>
                      </form>
                      <form action={rejectBookingAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <button
                          type="submit"
                          className="flex items-center gap-1 rounded-lg border border-error px-3 py-1.5 text-body-sm font-medium text-error transition-colors hover:bg-error-container hover:text-on-error-container"
                        >
                          <UiIcon name="close" size={16} />
                          Reject
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <UiIcon name="inbox" size={36} className="mb-4 text-outline-variant" />
                    <h3 className="mb-2 text-headline-md text-on-surface">No pending requests</h3>
                    <p className="mx-auto max-w-md text-body-md text-on-surface-variant">
                      All incoming booking requests have been processed. New requests will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="rounded-full bg-surface-variant p-2 text-on-surface-variant">
              <UiIcon name="hourglass_empty" />
            </div>
            <div>
              <p className="mb-1 text-label-caps text-on-surface-variant">Total Pending</p>
              <p className="text-headline-md text-on-surface">{pending.length}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="rounded-full bg-primary-container/20 p-2 text-primary-container">
              <UiIcon name="payments" />
            </div>
            <div>
              <p className="mb-1 text-label-caps text-on-surface-variant">Pending Value</p>
              <p className="font-mono text-lg font-bold text-on-surface">{formatCurrency(pendingValue)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="rounded-full bg-surface-variant p-2 text-on-surface-variant">
              <UiIcon name="directions_car" />
            </div>
            <div>
              <p className="mb-1 text-label-caps text-on-surface-variant">Active Rentals</p>
              <p className="text-headline-md text-on-surface">{active.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-headline-md text-on-surface">Active rentals</h2>
          {active.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">No confirmed or ongoing rentals.</p>
          ) : (
            <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant bg-surface">
              {active.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/staff/bookings/${booking.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-container-low"
                >
                  <div>
                    <p className="font-medium text-on-surface">
                      {booking.vehicleLabel} &middot; {booking.customerName}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
