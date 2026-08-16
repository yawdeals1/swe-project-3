import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { UiIcon } from "@/components/Icon";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingResponse } from "@/lib/types";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "ONGOING"];

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();
  const bookings = await backendFetch<BookingResponse[]>("/bookings/me", { token: session!.token });

  const active = bookings
    .filter((b) => ACTIVE_STATUSES.includes(b.status))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const firstName = session!.user.name.split(" ")[0];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-margin-mobile py-density-public md:px-margin-desktop">
      <header className="w-full">
        <h1 className="mb-2 text-headline-xl text-on-surface">Welcome back, {firstName}.</h1>
        <p className="text-body-lg text-on-surface-variant">Here is your rental overview and recent activity.</p>
      </header>

      <Banner error={error} success={success} />

      <div className="grid grid-cols-1 gap-density-public md:grid-cols-12">
        <section className="relative col-span-1 flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:col-span-8">
          {active.length === 0 ? (
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                <UiIcon name="directions_car" size={48} />
              </div>
              <h2 className="mb-2 text-headline-md text-on-surface">No active bookings</h2>
              <p className="mb-6 max-w-md text-body-md text-on-surface-variant">
                You don&apos;t have any upcoming trips scheduled. Ready to hit the road?
              </p>
              <Link
                href="/vehicles"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                Browse the fleet
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-headline-md text-on-surface">Active &amp; upcoming</h2>
                <Link href="/vehicles" className="text-body-sm font-medium text-primary hover:underline">
                  Book another vehicle
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {active.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex flex-col items-start justify-between gap-3 rounded-lg border border-outline-variant bg-surface p-4 transition-colors hover:border-outline sm:flex-row sm:items-center"
                  >
                    <div>
                      <h4 className="font-medium text-on-surface">{booking.vehicleLabel}</h4>
                      <p className="text-body-sm text-on-surface-variant">
                        {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <StatusBadge status={booking.status} />
                      <span className="font-mono text-numeric-data text-on-surface-variant">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="relative col-span-1 flex min-h-[300px] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-t from-on-surface/85 to-primary-fixed p-6 md:col-span-4">
          <h3 className="mb-2 text-headline-lg text-on-primary">Need a vehicle?</h3>
          <p className="mb-4 text-body-sm text-surface-container-low">
            Browse the full fleet and request a booking in minutes.
          </p>
          <Link
            href="/vehicles"
            className="flex w-fit items-center gap-1 text-label-caps text-primary-fixed uppercase tracking-wider transition-colors hover:text-inverse-primary"
          >
            Browse Fleet <UiIcon name="arrow_forward" size={16} />
          </Link>
        </section>

        <section className="col-span-1 md:col-span-12">
          <div className="mb-6 flex items-end justify-between border-b border-outline-variant pb-4">
            <h2 className="text-headline-lg text-on-surface">Recent Activity</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">You have no bookings yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {recent.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="flex flex-col items-start justify-between gap-4 rounded-lg border border-outline-variant bg-surface p-4 transition-colors hover:border-outline sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                      <UiIcon name="directions_car" />
                    </div>
                    <div>
                      <h4 className="font-medium text-on-surface">{booking.vehicleLabel}</h4>
                      <p className="text-body-sm text-on-surface-variant">
                        {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <StatusBadge status={booking.status} />
                    <span className="font-mono text-numeric-data text-on-surface-variant">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
