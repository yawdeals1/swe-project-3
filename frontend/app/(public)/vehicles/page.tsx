import { backendFetch } from "@/lib/backend";
import { VehicleCard } from "@/components/VehicleCard";
import type { VehicleResponse } from "@/lib/types";

interface SearchParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const qs = query.toString();
  const vehicles = await backendFetch<VehicleResponse[]>(`/vehicles${qs ? `?${qs}` : ""}`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Browse vehicles</h1>

      <form method="GET" className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <label className="flex flex-col gap-1 text-sm">
          Category
          <input
            type="text"
            name="category"
            defaultValue={params.category}
            placeholder="SEDAN, SUV..."
            className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Min price / day
          <input
            type="number"
            name="minPrice"
            defaultValue={params.minPrice}
            min={0}
            className="w-28 rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Max price / day
          <input
            type="number"
            name="maxPrice"
            defaultValue={params.maxPrice}
            min={0}
            className="w-28 rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          From
          <input
            type="date"
            name="startDate"
            defaultValue={params.startDate}
            className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          To
          <input
            type="date"
            name="endDate"
            defaultValue={params.endDate}
            className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Search
        </button>
      </form>

      {vehicles.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No vehicles match those filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
