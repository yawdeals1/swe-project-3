import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { CategoryIcon } from "@/components/Icon";
import { VehicleImageStrip } from "@/components/VehicleImageStrip";
import type { VehicleResponse } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Available",
  RENTED: "In Use",
  MAINTENANCE: "Maintenance",
};

export function VehicleCard({ vehicle, featured = false }: { vehicle: VehicleResponse; featured?: boolean }) {
  const available = vehicle.status === "AVAILABLE";

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-transform duration-300 hover:-translate-y-1 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className={`relative w-full ${featured ? "h-64" : "h-48"}`}>
        <VehicleImageStrip
          images={vehicle.imageUrls}
          alt={`${vehicle.make} ${vehicle.model}`}
          category={vehicle.category}
          className="h-full w-full"
        />
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-label-caps backdrop-blur-sm ${
            available ? "border border-tertiary/20 bg-tertiary/10 text-tertiary" : "border border-outline-variant/50 bg-surface/80 text-secondary"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-tertiary" : "bg-secondary"}`} />
          {STATUS_LABEL[vehicle.status] ?? vehicle.status}
        </div>
      </div>
      <div className={`flex flex-1 flex-col justify-between p-5 ${!available ? "opacity-70" : ""}`}>
        <div>
          <span className="text-body-sm text-secondary">
            {vehicle.make} &middot; {vehicle.year}
          </span>
          <h3 className="mb-3 text-[20px] leading-tight font-semibold text-on-surface">{vehicle.model}</h3>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
            <div className="flex items-center gap-2 text-body-sm text-secondary">
              <CategoryIcon category={vehicle.category} size={18} />
              <span>{vehicle.category}</span>
            </div>
            <div className="text-right">
              <span className={`font-mono text-[18px] font-semibold ${available ? "text-primary" : "text-secondary"}`}>
                {formatCurrency(vehicle.dailyRate)}
              </span>
              <span className="block text-[12px] leading-none text-secondary">/ day</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
