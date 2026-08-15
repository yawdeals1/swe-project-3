import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { checkInAction, checkOutAction } from "@/lib/actions/checkrecord";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { BookingResponse, CheckRecordResponse } from "@/lib/types";

export default async function StaffBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;
  const session = await getSession();

  let booking: BookingResponse;
  try {
    booking = await backendFetch<BookingResponse>(`/bookings/${id}`, { token: session!.token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  const checkRecords = await backendFetch<CheckRecordResponse[]>(`/bookings/${id}/check-records`, {
    token: session!.token,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Banner error={error} success={success} />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{booking.vehicleLabel}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {booking.customerName} &middot; {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)} &middot;{" "}
            {formatCurrency(booking.totalAmount)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.status === "CONFIRMED" && (
        <form action={checkOutAction} className="mb-6 flex flex-col gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <input type="hidden" name="bookingId" value={booking.id} />
          <h2 className="font-medium">Check out vehicle</h2>
          <label className="flex flex-col gap-1 text-sm">
            Odometer reading
            <input
              type="number"
              name="odometerReading"
              required
              min={0}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Condition notes
            <textarea
              name="conditionNotes"
              rows={2}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Record check-out
          </button>
        </form>
      )}

      {booking.status === "ONGOING" && (
        <form action={checkInAction} className="mb-6 flex flex-col gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <input type="hidden" name="bookingId" value={booking.id} />
          <h2 className="font-medium">Check in vehicle</h2>
          <label className="flex flex-col gap-1 text-sm">
            Odometer reading
            <input
              type="number"
              name="odometerReading"
              required
              min={0}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Condition notes
            <textarea
              name="conditionNotes"
              rows={2}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Extra charges (damage, etc.)
            <input
              type="number"
              name="extraCharges"
              min={0}
              step="0.01"
              defaultValue={0}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Record check-in
          </button>
        </form>
      )}

      {checkRecords.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="mb-3 font-medium">Handover history</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {checkRecords.map((record) => (
              <li key={record.id} className="border-l-2 border-zinc-300 pl-3 dark:border-zinc-700">
                <p className="font-medium">
                  {record.type === "CHECK_OUT" ? "Checked out" : "Checked in"} by {record.staffName} &middot; odometer{" "}
                  {record.odometerReading}
                </p>
                {record.conditionNotes && <p className="text-zinc-500 dark:text-zinc-400">{record.conditionNotes}</p>}
                {record.extraCharges > 0 && (
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Extra charges: {formatCurrency(record.extraCharges)}
                  </p>
                )}
                <p className="text-xs text-zinc-400 dark:text-zinc-600">{formatDateTime(record.recordedAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
