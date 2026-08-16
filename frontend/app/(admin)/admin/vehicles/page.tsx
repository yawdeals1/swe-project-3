import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { deleteVehicleAction } from "@/lib/actions/vehicle";
import { Banner } from "@/components/Banner";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon } from "@/components/Icon";
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
        <div className="flex flex-col divide-y divide-whisper rounded-lg border border-whisper bg-surface">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <CategoryIcon category={vehicle.category} size={24} />
                <div>
                  <p className="font-medium text-on-surface">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    <span className="font-mono">{vehicle.plateNumber}</span> &middot; {vehicle.category} &middot;{" "}
                    <span className="font-mono">{formatCurrency(vehicle.dailyRate)}</span>/day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={vehicle.status} />
                <Link
                  href={`/admin/vehicles/${vehicle.id}/edit`}
                  className="rounded-lg border border-outline-variant px-4 py-1.5 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant"
                >
                  Edit
                </Link>
                <form action={deleteVehicleAction}>
                  <input type="hidden" name="id" value={vehicle.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-error px-4 py-1.5 text-body-sm font-medium text-error transition-colors hover:bg-error-container hover:text-on-error-container"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
