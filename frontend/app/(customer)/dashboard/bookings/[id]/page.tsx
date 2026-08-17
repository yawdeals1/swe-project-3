import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { payBookingAction } from "@/lib/actions/booking";
import { Banner } from "@/components/Banner";
import { UiIcon } from "@/components/Icon";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { BookingResponse, CheckRecordResponse, PaymentResponse } from "@/lib/types";

const STEPS = ["PENDING", "CONFIRMED", "ONGOING", "COMPLETED"];

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

  const stepIndex = STEPS.indexOf(booking.status);
  const cancelled = booking.status === "CANCELLED";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-margin-mobile py-density-public md:px-margin-desktop">
      <div className="flex flex-col gap-2 pt-8">
        <Link href="/dashboard" className="mb-4 flex w-fit items-center gap-2 text-body-sm text-secondary transition-colors hover:text-primary">
          <UiIcon name="arrow_back" size={18} />
          Back to bookings
        </Link>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-headline-xl text-on-surface">
              Booking #<span className="font-mono">{booking.id}</span>
            </h1>
            <p className="mt-2 text-body-lg text-on-surface-variant">{booking.vehicleLabel}</p>
          </div>
        </div>
      </div>

      <Banner error={error} success={success} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface shadow-sm md:flex-row">
            <div className="flex h-32 w-full items-center justify-center bg-surface-container text-on-surface-variant md:h-auto md:w-2/5">
              <UiIcon name="directions_car" size={48} />
            </div>
            <div className="flex w-full flex-col justify-between p-density-public md:w-3/5">
              <div className="mb-2 flex items-start justify-between">
                <h2 className="text-headline-lg text-on-surface">{booking.vehicleLabel}</h2>
                <span className="rounded-full bg-tertiary/10 px-3 py-1 text-label-caps text-tertiary">{booking.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="mb-1 text-label-caps text-on-surface-variant">PICKUP</p>
                  <p className="font-medium text-body-md text-on-surface">{formatDate(booking.startDate)}</p>
                </div>
                <div>
                  <p className="mb-1 text-label-caps text-on-surface-variant">DROPOFF</p>
                  <p className="font-medium text-body-md text-on-surface">{formatDate(booking.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant/30 bg-surface p-density-public shadow-sm">
            <h3 className="mb-8 text-headline-md text-on-surface">Trip Status</h3>
            {cancelled ? (
              <div className="flex items-center gap-3 rounded-lg border border-error/30 bg-error-container/30 p-4 text-on-error-container">
                <UiIcon name="cancel" />
                <span className="text-body-md font-medium">This booking was cancelled.</span>
              </div>
            ) : (
              <div className="relative flex flex-col justify-between md:flex-row">
                <div className="absolute top-1/2 left-4 right-4 hidden h-0.5 -translate-y-1/2 bg-surface-variant md:block" />
                {STEPS.map((step, i) => {
                  const done = i < stepIndex;
                  const current = i === stepIndex;
                  return (
                    <div key={step} className="relative z-10 mb-6 flex flex-row items-center gap-4 md:mb-0 md:flex-col md:gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          done
                            ? "bg-primary text-on-primary"
                            : current
                              ? "bg-primary-container text-on-primary-container ring-4 ring-primary-container/20"
                              : "border border-outline-variant bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {done ? <UiIcon name="check" size={16} /> : <div className="h-2.5 w-2.5 rounded-full bg-current" />}
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`text-label-caps ${current ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>{step}</p>
                        {current && <p className="text-body-sm text-primary">Current status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {checkRecords.length > 0 && (
            <div className="rounded-xl border border-outline-variant/30 bg-surface p-density-public shadow-sm">
              <h3 className="mb-4 text-headline-md text-on-surface">Handover history</h3>
              <ul className="flex flex-col gap-4">
                {checkRecords.map((record) => (
                  <li key={record.id} className="border-l-2 border-outline-variant pl-4">
                    <p className="font-medium text-body-md text-on-surface">
                      {record.type === "CHECK_OUT" ? "Checked out" : "Checked in"} &middot; odometer{" "}
                      <span className="font-mono">{record.odometerReading}</span>
                    </p>
                    {record.conditionNotes && <p className="text-body-sm text-on-surface-variant">{record.conditionNotes}</p>}
                    {record.extraCharges > 0 && (
                      <p className="text-body-sm text-on-surface-variant">Extra charges: {formatCurrency(record.extraCharges)}</p>
                    )}
                    <p className="text-label-caps text-secondary">{formatDateTime(record.recordedAt)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="relative overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low p-density-public">
            <h3 className="relative z-10 mb-6 text-headline-md text-on-surface">Payment Summary</h3>
            <div className="relative z-10 mb-6 flex justify-between border-b border-outline-variant pb-4">
              <span className="text-body-lg font-medium text-on-surface">Total Amount</span>
              <span className="font-mono text-[24px] leading-none font-bold text-primary">{formatCurrency(booking.totalAmount)}</span>
            </div>
            <p className="relative z-10 text-body-sm text-secondary">
              {payment
                ? payment.status === "COMPLETED"
                  ? `Paid via ${payment.method}`
                  : payment.status === "FAILED"
                    ? "Payment failed — please try again"
                    : `Payment submitted via ${payment.method} — awaiting staff verification`
                : "Not paid yet"}
            </p>

            {booking.status === "CONFIRMED" && !payment && (
              <form action={payBookingAction} className="relative z-10 mt-6 flex flex-col gap-3">
                <input type="hidden" name="bookingId" value={booking.id} />
                <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
                  Payment method
                  <select
                    name="method"
                    className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="CARD">Card</option>
                    <option value="MOBILE_MONEY">Mobile money</option>
                    <option value="CASH">Cash</option>
                  </select>
                </label>
                <button type="submit" className="w-full rounded-lg bg-primary py-3 font-medium text-on-primary transition-colors hover:bg-primary-container">
                  Pay now
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 bg-surface/70 p-6">
            <div className="flex items-center gap-3 text-on-surface">
              <UiIcon name="help_center" />
              <h4 className="text-body-lg font-medium">Need Help?</h4>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Contact the branch that confirmed your booking for questions about this trip.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
