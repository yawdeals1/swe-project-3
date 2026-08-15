import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryIcon } from "@/components/Icon";
import type { VehicleResponse } from "@/lib/types";

export function VehicleCard({ vehicle }: { vehicle: VehicleResponse }) {
  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <CategoryIcon category={vehicle.category} size={28} />
          <div>
            <p className="font-medium text-black dark:text-zinc-50">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {vehicle.year} &middot; {vehicle.category}
            </p>
          </div>
        </div>
        <StatusBadge status={vehicle.status} />
      </div>
      <p className="mt-2 text-sm font-medium text-black dark:text-zinc-50">
        {formatCurrency(vehicle.dailyRate)} <span className="font-normal text-zinc-500 dark:text-zinc-400">/ day</span>
      </p>
    </Link>
  );
}
