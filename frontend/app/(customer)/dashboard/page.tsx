import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BookingResponse } from "@/lib/types";

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();
  const bookings = await backendFetch<BookingResponse[]>("/bookings/me", { token: session!.token });

  const sorted = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>
        <Link
          href="/vehicles"
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Book a vehicle
        </Link>
      </div>

      <Banner error={error} success={success} />

      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">You have no bookings yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {sorted.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/bookings/${booking.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="font-medium">{booking.vehicleLabel}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(booking.startDate)} &ndash; {formatDate(booking.endDate)} &middot;{" "}
                  {formatCurrency(booking.totalAmount)}
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
