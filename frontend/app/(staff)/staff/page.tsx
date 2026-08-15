import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { confirmBookingAction, rejectBookingAction } from "@/lib/actions/booking";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon } from "@/components/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingResponse, VehicleResponse } from "@/lib/types";

export default async function StaffHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();

  const [vehicles, pendingBookings, activeBookings] = await Promise.all([
    backendFetch<VehicleResponse[]>("/vehicles", { token: session!.token }),
    backendFetch<BookingResponse[]>("/bookings?status=PENDING", { token: session!.token }),
    [
      ...(await backendFetch<BookingResponse[]>("/bookings?status=CONFIRMED", { token: session!.token })),
      ...(await backendFetch<BookingResponse[]>("/bookings?status=ONGOING", { token: session!.token })),
    ],
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Staff dashboard</h1>
      <Banner error={error} success={success} />

      <section className="mb-10">
        <h2 className="mb-3 font-medium">Incoming booking requests</h2>
        {pendingBookings.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No pending requests.</p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {pendingBookings.map((booking) => (
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
                <div className="flex gap-2">
                  <form action={confirmBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-zinc-950 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                    >
                      Confirm
                    </button>
                  </form>
                  <form action={rejectBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-medium">Active rentals</h2>
        {activeBookings.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No confirmed or ongoing rentals.</p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {activeBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/staff/bookings/${booking.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div>
                  <p className="font-medium">
                    {booking.vehicleLabel} &middot; {booking.customerName}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium">Fleet status</h2>
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <CategoryIcon category={vehicle.category} />
                <p className="font-medium">
                  {vehicle.make} {vehicle.model} &middot; {vehicle.plateNumber}
                </p>
              </div>
              <StatusBadge status={vehicle.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
