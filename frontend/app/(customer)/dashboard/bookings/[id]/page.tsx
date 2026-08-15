import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { payBookingAction } from "@/lib/actions/booking";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { BookingResponse, CheckRecordResponse, PaymentResponse } from "@/lib/types";

export default async function CustomerBookingDetailPage({
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
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) {
      notFound();
    }
    throw e;
  }

  const [payment, checkRecords] = await Promise.all([
    backendFetch<PaymentResponse>(`/payments/booking/${id}`, { token: session!.token }).catch(() => null),
    backendFetch<CheckRecordResponse[]>(`/bookings/${id}/check-records`, { token: session!.token }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Banner error={error} success={success} />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{booking.vehicleLabel}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
        <p className="mb-1 flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Total</span>
          <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
        </p>
        <p className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Payment</span>
          <span className="font-medium">{payment ? `Paid via ${payment.method}` : "Not paid"}</span>
        </p>
      </div>

      {booking.status === "CONFIRMED" && !payment && (
        <form action={payBookingAction} className="mb-6 flex items-end gap-3 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="flex flex-col gap-1 text-sm">
            Payment method
            <select
              name="method"
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="CARD">Card</option>
              <option value="MOBILE_MONEY">Mobile money</option>
              <option value="CASH">Cash</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Pay now
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
                  {record.type === "CHECK_OUT" ? "Checked out" : "Checked in"} &middot; odometer{" "}
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
