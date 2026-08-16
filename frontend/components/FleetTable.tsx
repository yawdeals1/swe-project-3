"use client";

import { useState } from "react";
import { updateVehicleStatusAction } from "@/lib/actions/vehicle";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon, UiIcon } from "@/components/Icon";
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
    <div className="flex flex-col overflow-hidden rounded-lg border border-whisper bg-surface shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-headline-md text-on-surface">Fleet Overview</h2>
        <div className="relative">
          <UiIcon name="search" size={18} className="absolute top-1/2 left-2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plate or model..."
            className="w-56 rounded border border-whisper bg-surface py-1.5 pr-3 pl-8 text-body-sm text-on-surface transition-all outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 border-b border-whisper bg-surface-variant text-label-caps text-secondary">
            <tr>
              <th className="w-2/5 px-3 py-2 font-medium">Vehicle Details</th>
              <th className="w-1/5 px-3 py-2 font-medium">Status</th>
              <th className="w-1/5 px-3 py-2 text-right font-medium">Daily Rate</th>
              <th className="px-3 py-2 font-medium">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-whisper text-body-sm text-on-surface">
            {filtered.map((vehicle) => (
              <tr key={vehicle.id} className="group transition-colors hover:bg-surface-container-low">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-whisper bg-surface-container">
                      <CategoryIcon category={vehicle.category} size={18} />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {vehicle.make} {vehicle.model}
                      </span>
                      <span className="font-mono text-[12px] text-secondary">{vehicle.plateNumber}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={vehicle.status} />
                </td>
                <td className="px-3 py-2 text-right font-mono">{formatCurrency(vehicle.dailyRate)}</td>
                <td className="px-3 py-2">
                  <form action={updateVehicleStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={vehicle.id} />
                    <select
                      name="status"
                      defaultValue={vehicle.status}
                      className="rounded border border-whisper bg-surface px-2 py-1 text-body-sm text-on-surface"
                    >
                      {VEHICLE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded border border-outline-variant px-2 py-1 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant"
                    >
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-on-surface-variant">
                  No vehicles match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-whisper bg-surface px-3 py-2 text-[12px] text-secondary">
        <span>
          Showing {filtered.length} of {vehicles.length} vehicles
        </span>
      </div>
    </div>
  );
}
