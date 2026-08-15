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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Fleet</h1>
        <Link
          href="/admin/vehicles/new"
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Add vehicle
        </Link>
      </div>

      <Banner error={error} success={success} />

      {vehicles.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No vehicles in the fleet yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <CategoryIcon category={vehicle.category} size={24} />
                <div>
                  <p className="font-medium">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {vehicle.plateNumber} &middot; {vehicle.category} &middot; {formatCurrency(vehicle.dailyRate)}/day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={vehicle.status} />
                <Link
                  href={`/admin/vehicles/${vehicle.id}/edit`}
                  className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Edit
                </Link>
                <form action={deleteVehicleAction}>
                  <input type="hidden" name="id" value={vehicle.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
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
