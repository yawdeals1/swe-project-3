"use client";

import { useState } from "react";
import { updateVehicleStatusAction } from "@/lib/actions/vehicle";
import { StatusBadge } from "@/components/StatusBadge";
import { UiIcon } from "@/components/Icon";
import { VehicleImageStrip } from "@/components/VehicleImageStrip";
import { formatCurrency } from "@/lib/format";
import type { VehicleResponse } from "@/lib/types";

const VEHICLE_STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE"];

export function FleetTable({ vehicles }: { vehicles: VehicleResponse[] }) {
  const [query, setQuery] = useState("");

  const filtered = vehicles.filter((v) => {
    const haystack = `${v.make} ${v.model} ${v.plateNumber}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="relative w-full sm:w-56">
          <UiIcon name="search" size={18} className="absolute top-1/2 left-2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plate or model..."
            className="w-full rounded border border-whisper bg-surface py-1.5 pr-3 pl-8 text-body-sm text-on-surface transition-all outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-whisper bg-surface p-8 text-center text-body-sm text-on-surface-variant">
          No vehicles match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((vehicle) => (
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
                <form action={updateVehicleStatusAction} className="mt-auto flex items-center gap-2 pt-2">
                  <input type="hidden" name="id" value={vehicle.id} />
                  <select
                    name="status"
                    defaultValue={vehicle.status}
                    className="flex-1 rounded border border-whisper bg-surface px-2 py-1.5 text-body-sm text-on-surface"
                  >
                    {VEHICLE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded border border-outline-variant px-2 py-1.5 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant"
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-label-caps text-secondary">
        Showing {filtered.length} of {vehicles.length} vehicles
      </p>
    </div>
  );
}
