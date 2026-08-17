import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { checkInAction, checkOutAction } from "@/lib/actions/checkrecord";
import { verifyPaymentAction } from "@/lib/actions/payment";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon, UiIcon } from "@/components/Icon";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { BookingResponse, CheckRecordResponse, PaymentResponse, VehicleResponse } from "@/lib/types";

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

  const [checkRecords, vehicle, payment] = await Promise.all([
    backendFetch<CheckRecordResponse[]>(`/bookings/${id}/check-records`, { token: session!.token }),
    backendFetch<VehicleResponse>(`/vehicles/${booking.vehicleId}`).catch(() => null),
    backendFetch<PaymentResponse>(`/payments/booking/${id}`, { token: session!.token }).catch(() => null),
  ]);

  const action = booking.status === "CONFIRMED" ? "check-out" : booking.status === "ONGOING" ? "check-in" : null;
  const paymentVerified = payment?.status === "COMPLETED";
  const checkoutBlockedByPayment = action === "check-out" && !paymentVerified;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-gutter md:p-density-public">
      <Link href="/staff/bookings" className="flex w-fit items-center gap-2 text-body-sm text-secondary transition-colors hover:text-primary">
        <UiIcon name="arrow_back" size={18} />
        Back to requests
      </Link>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-label-caps text-on-surface-variant uppercase tracking-wider">Fleet Management</span>
            <UiIcon name="chevron_right" size={14} className="text-outline-variant" />
            <span className="text-label-caps text-primary uppercase tracking-wider">Booking #{booking.id}</span>
          </div>
          <h2 className="flex items-center gap-3 text-headline-lg text-on-surface">
            {booking.vehicleLabel}
            <StatusBadge status={booking.status} />
          </h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {booking.customerName} &middot; {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)} &middot;{" "}
            {formatCurrency(booking.totalAmount)}
          </p>
        </div>
      </div>

      <Banner error={error} success={success} />

      <div className="grid grid-cols-1 items-start gap-6 pb-12 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {checkoutBlockedByPayment && (
            <div className="flex items-start gap-3 rounded-lg border border-error/30 bg-error-container/30 p-4 text-on-error-container">
              <UiIcon name="cancel" className="mt-0.5" />
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <p className="text-body-md font-medium">Checkout is blocked until payment is verified</p>
                  <p className="mt-1 text-body-sm">
                    {payment
                      ? `The customer submitted payment via ${payment.method}, but it has not been verified yet. Confirm the funds were actually received before releasing the vehicle.`
                      : "The customer has not submitted payment for this booking yet. The vehicle cannot be checked out until payment is received and verified."}
                  </p>
                </div>
                {payment && (
                  <form action={verifyPaymentAction} className="flex">
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-body-sm font-medium text-on-error transition-colors hover:opacity-90"
                    >
                      <UiIcon name="check_circle" size={16} />
                      Verify payment received
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {action && !checkoutBlockedByPayment && (
            <form
              action={action === "check-out" ? checkOutAction : checkInAction}
              className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant bg-surface-container-lowest"
            >
              <input type="hidden" name="bookingId" value={booking.id} />

              <div className="flex flex-col gap-4 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <UiIcon name="speed" size={20} className="text-primary" />
                  <h3 className="text-body-lg font-medium text-on-surface">Odometer Reading</h3>
                </div>
                <div className="flex max-w-sm flex-col gap-1">
                  <label className="text-label-caps text-on-surface-variant">Current odometer</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      name="odometerReading"
                      required
                      min={0}
                      className="w-full rounded border border-outline-variant bg-surface py-3 pr-12 pl-3 text-right font-mono text-lg text-numeric-data text-on-surface outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                    <span className="pointer-events-none absolute right-3 text-body-sm text-on-surface-variant">mi</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <UiIcon name="fact_check" size={20} className="text-primary" />
                  <h3 className="text-body-lg font-medium text-on-surface">Vehicle Condition</h3>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-caps text-on-surface-variant">Condition notes</label>
                  <textarea
                    name="conditionNotes"
                    rows={3}
                    placeholder="Describe any scratches, dents, or interior issues..."
                    className="w-full resize-none rounded border border-outline-variant bg-surface p-3 text-body-md text-on-surface outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                {action === "check-in" && (
                  <div className="flex max-w-sm flex-col gap-1">
                    <label className="text-label-caps text-on-surface-variant">Extra charges (damage, fuel, etc.)</label>
                    <input
                      type="number"
                      name="extraCharges"
                      min={0}
                      step="0.01"
                      defaultValue={0}
                      className="w-full rounded border border-outline-variant bg-surface px-3 py-2 font-mono text-on-surface outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-2.5 font-medium text-on-primary-container shadow-sm transition-all hover:bg-primary hover:text-on-primary"
                >
                  Record {action === "check-out" ? "Check-Out" : "Check-In"}
                  <UiIcon name="arrow_forward" size={18} />
                </button>
              </div>
            </form>
          )}

          {checkRecords.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
              <h3 className="border-b border-outline-variant px-6 py-4 text-body-lg font-medium text-on-surface">Handover history</h3>
              <ul className="flex flex-col divide-y divide-outline-variant">
                {checkRecords.map((record) => (
                  <li key={record.id} className="flex items-start gap-3 px-6 py-4">
                    <UiIcon name={record.type === "CHECK_OUT" ? "logout" : "login"} size={18} className="mt-0.5 text-primary-container" />
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">
                        {record.type === "CHECK_OUT" ? "Checked out" : "Checked in"} by {record.staffName} &middot; odometer{" "}
                        <span className="font-mono">{record.odometerReading}</span> mi
                      </p>
                      {record.conditionNotes && <p className="text-body-sm text-on-surface-variant">{record.conditionNotes}</p>}
                      {record.extraCharges > 0 && (
                        <p className="text-body-sm text-on-surface-variant">Extra charges: {formatCurrency(record.extraCharges)}</p>
                      )}
                      <p className="text-label-caps text-secondary">{formatDateTime(record.recordedAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!action && checkRecords.length === 0 && (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
              No check-out or check-in action is available for a booking in {booking.status} status.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:col-span-4">
          <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container shadow-sm">
            <div className="flex h-32 w-full items-center justify-center bg-surface-variant text-on-surface-variant">
              {vehicle ? <CategoryIcon category={vehicle.category} size={40} /> : <UiIcon name="directions_car" size={40} />}
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div>
                <h4 className="text-headline-md text-on-surface">{booking.vehicleLabel}</h4>
                {vehicle && <p className="text-body-sm text-on-surface-variant">{vehicle.category}</p>}
              </div>
              {vehicle && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 border-t border-outline-variant pt-3">
                  <div className="flex flex-col">
                    <span className="text-label-caps text-on-surface-variant">License Plate</span>
                    <span className="font-mono text-numeric-data text-on-surface">{vehicle.plateNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label-caps text-on-surface-variant">Daily Rate</span>
                    <span className="font-mono text-numeric-data text-on-surface">{formatCurrency(vehicle.dailyRate)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-primary-fixed-dim bg-surface-container-low p-4">
            <UiIcon name="info" className="mt-0.5 text-primary" />
            <div className="flex flex-col">
              <span className="text-body-sm font-medium text-on-surface">Handover protocol</span>
              <span className="mt-1 text-body-sm text-on-surface-variant">
                Confirm the odometer reading matches the vehicle before recording, and note any visible damage.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
