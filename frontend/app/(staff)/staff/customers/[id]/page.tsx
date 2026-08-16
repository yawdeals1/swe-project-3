import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { StatusBadge } from "@/components/StatusBadge";
import { UiIcon } from "@/components/Icon";
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
    <div className="p-density-admin md:p-gutter">
      <Link
        href="/staff/customers"
        className="mb-6 flex w-fit items-center gap-2 text-body-sm text-secondary transition-colors hover:text-primary"
      >
        <UiIcon name="arrow_back" size={18} />
        Back to customer lookup
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-on-surface">{customer.name}</h1>
          <p className="text-body-sm text-on-surface-variant">
            {customer.email} {customer.phone ? `· ${customer.phone}` : ""}
          </p>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      <h2 className="mb-3 text-headline-md text-on-surface">Booking &amp; rental history</h2>
      {sorted.length === 0 ? (
        <p className="rounded-lg border border-whisper bg-surface p-8 text-center text-body-sm text-on-surface-variant">
          This customer has no bookings yet.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-whisper rounded-lg border border-whisper bg-surface">
          {sorted.map((booking) => (
            <Link
              key={booking.id}
              href={`/staff/bookings/${booking.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-container-low"
            >
              <div>
                <p className="font-medium text-on-surface">{booking.vehicleLabel}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)} &middot;{" "}
                  <span className="font-mono">{formatCurrency(booking.totalAmount)}</span>
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
