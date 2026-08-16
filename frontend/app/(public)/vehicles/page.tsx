import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { VehicleCard } from "@/components/VehicleCard";
import { UiIcon } from "@/components/Icon";
import type { VehicleResponse } from "@/lib/types";

const CATEGORIES = ["SEDAN", "SUV", "HATCHBACK", "PICKUP", "VAN", "LUXURY"];

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
  const hasFilters = Boolean(params.category || params.minPrice || params.maxPrice || params.startDate || params.endDate);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-density-public px-gutter py-density-public md:flex-row md:px-margin-desktop">
      <aside className="w-full flex-shrink-0 lg:w-64">
        <form
          method="GET"
          className="sticky top-24 flex flex-col rounded-xl border border-outline-variant/30 bg-surface-container-low p-density-public"
        >
          <div className="mb-6 flex items-center gap-2 text-on-surface">
            <UiIcon name="filter_list" />
            <h2 className="text-headline-md">Filters</h2>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-label-caps text-secondary uppercase">Category</h3>
            <select
              name="category"
              defaultValue={params.category ?? ""}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c[0] + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 h-px w-full bg-outline-variant/50" />

          <div className="mb-6">
            <h3 className="mb-3 text-label-caps text-secondary uppercase">Dates</h3>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <UiIcon name="calendar_today" size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-secondary" />
                <input
                  type="date"
                  name="startDate"
                  defaultValue={params.startDate}
                  className="w-full rounded-lg border border-outline-variant bg-surface py-2 pr-3 pl-10 text-body-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <UiIcon name="event" size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-secondary" />
                <input
                  type="date"
                  name="endDate"
                  defaultValue={params.endDate}
                  className="w-full rounded-lg border border-outline-variant bg-surface py-2 pr-3 pl-10 text-body-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 h-px w-full bg-outline-variant/50" />

          <div className="mb-6">
            <h3 className="mb-3 text-label-caps text-secondary uppercase">Daily rate</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                min={0}
                placeholder="Min"
                defaultValue={params.minPrice}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-mono text-numeric-data text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <span className="text-secondary">&ndash;</span>
              <input
                type="number"
                name="maxPrice"
                min={0}
                placeholder="Max"
                defaultValue={params.maxPrice}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-mono text-numeric-data text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button type="submit" className="mb-2 w-full rounded-lg bg-primary py-2 font-medium text-on-primary transition-colors hover:bg-primary-container">
            Apply filters
          </button>
          {hasFilters && (
            <Link
              href="/vehicles"
              className="w-full rounded-lg border border-outline-variant/50 py-2 text-center text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            >
              Reset filters
            </Link>
          )}
        </form>
      </aside>

      <section className="flex flex-1 flex-col gap-density-public">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <h1 className="mb-1 text-headline-lg text-on-surface">Available Fleet</h1>
            <p className="text-body-md text-secondary">
              Showing {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} matching your criteria
            </p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-10 text-center text-body-md text-on-surface-variant">
            No vehicles match those filters.
          </p>
        ) : (
          <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle, i) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} featured={i === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
