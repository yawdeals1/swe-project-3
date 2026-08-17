import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { deleteVehicleAction } from "@/lib/actions/vehicle";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { VehicleImageStrip } from "@/components/VehicleImageStrip";
import { formatCurrency } from "@/lib/format";
import type { VehicleResponse } from "@/lib/types";

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();
  const vehicles = await backendFetch<VehicleResponse[]>("/vehicles", { token: session!.token });

  return (
    <div className="p-density-admin md:p-gutter">
      <div className="mb-gutter flex items-end justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Fleet</h1>
          <p className="mt-1 text-body-sm text-secondary">Manage every vehicle in the Carvo fleet.</p>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="rounded-lg bg-primary px-5 py-2 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
        >
          Add vehicle
        </Link>
      </div>

      <Banner error={error} success={success} />

      {vehicles.length === 0 ? (
        <p className="rounded-lg border border-whisper bg-surface p-8 text-center text-body-sm text-on-surface-variant">
          No vehicles in the fleet yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex flex-col overflow-hidden rounded-lg border border-whisper bg-surface">
              <VehicleImageStrip
                images={vehicle.imageUrls}
                alt={`${vehicle.make} ${vehicle.model}`}
                category={vehicle.category}
                className="h-36 w-full"
              />
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate font-medium text-on-surface">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <StatusBadge status={vehicle.status} />
                </div>
                <p className="truncate text-body-sm text-on-surface-variant">
                  <span className="font-mono">{vehicle.plateNumber}</span> &middot; {vehicle.category}
                </p>
                <p className="text-body-sm text-on-surface">
                  <span className="font-mono">{formatCurrency(vehicle.dailyRate)}</span>
                  <span className="text-on-surface-variant">/day</span>
                </p>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Link
                    href={`/admin/vehicles/${vehicle.id}/edit`}
                    className="flex-1 rounded-lg border border-outline-variant px-3 py-1.5 text-center text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant"
                  >
                    Edit
                  </Link>
                  <form action={deleteVehicleAction} className="flex-1">
                    <input type="hidden" name="id" value={vehicle.id} />
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-error px-3 py-1.5 text-body-sm font-medium text-error transition-colors hover:bg-error-container hover:text-on-error-container"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
