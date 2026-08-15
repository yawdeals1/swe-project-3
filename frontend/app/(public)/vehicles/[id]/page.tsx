import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { createBookingAction } from "@/lib/actions/booking";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon } from "@/components/Icon";
import { formatCurrency } from "@/lib/format";
import type { VehicleResponse } from "@/lib/types";

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  let vehicle: VehicleResponse;
  try {
    vehicle = await backendFetch<VehicleResponse>(`/vehicles/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Banner error={error} />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <CategoryIcon category={vehicle.category} size={36} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {vehicle.year} &middot; {vehicle.category} &middot; Plate {vehicle.plateNumber}
            </p>
          </div>
        </div>
        <StatusBadge status={vehicle.status} />
      </div>

      <p className="mb-8 text-lg font-medium">
        {formatCurrency(vehicle.dailyRate)} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">/ day</span>
      </p>

      {!session && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="font-medium text-zinc-950 dark:text-zinc-50">
            Log in
          </Link>{" "}
          to book this vehicle.
        </p>
      )}

      {session && session.user.role === "CUSTOMER" && (
        <form action={createBookingAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <input type="hidden" name="vehicleId" value={vehicle.id} />
          <h2 className="font-medium">Request this vehicle</h2>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Start date
              <input
                type="date"
                name="startDate"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              End date
              <input
                type="date"
                name="endDate"
                required
                className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Submit booking request
          </button>
        </form>
      )}

      {session && session.user.role !== "CUSTOMER" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Only customer accounts can request bookings.
        </p>
      )}
    </div>
  );
}
