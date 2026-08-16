import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { StatusBadge } from "@/components/StatusBadge";
import { UiIcon } from "@/components/Icon";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { BookingResponse, DashboardResponse, VehicleResponse } from "@/lib/types";

function KpiTile({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: string;
  trend?: { icon: string; text: string; className: string };
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-5">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-body-sm text-on-surface-variant">{label}</span>
        <div className="rounded-lg bg-surface-variant p-2">
          <UiIcon name={icon} size={20} className="text-secondary" />
        </div>
      </div>
      <div>
        <div className="font-mono text-headline-lg font-bold text-on-surface">{value}</div>
        {trend && (
          <div className={`mt-1 flex items-center gap-1 text-body-sm ${trend.className}`}>
            <UiIcon name={trend.icon} size={16} />
            <span>{trend.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  const [dashboard, vehicles, bookings] = await Promise.all([
    backendFetch<DashboardResponse>("/admin/dashboard", { token: session!.token }),
    backendFetch<VehicleResponse[]>("/vehicles", { token: session!.token }),
    backendFetch<BookingResponse[]>("/bookings", { token: session!.token }),
  ]);

  const statusCounts = {
    AVAILABLE: vehicles.filter((v) => v.status === "AVAILABLE").length,
    RENTED: vehicles.filter((v) => v.status === "RENTED").length,
    MAINTENANCE: vehicles.filter((v) => v.status === "MAINTENANCE").length,
  };
  const maxCount = Math.max(1, ...Object.values(statusCounts));

  const recentBookings = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-gutter py-4 lg:px-8">
        <h2 className="text-headline-md font-bold text-on-surface">Analytics Overview</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-gutter lg:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-density-admin lg:gap-6">
          <div className="grid grid-cols-1 gap-density-admin md:grid-cols-2 lg:gap-4 xl:grid-cols-4">
            <KpiTile label="Total Vehicles" value={String(dashboard.totalVehicles)} icon="directions_car" />
            <KpiTile label="Available Now" value={String(dashboard.availableVehicles)} icon="check_circle" />
            <KpiTile
              label="Fleet Utilization"
              value={`${Math.round(dashboard.utilizationRate * 100)}%`}
              icon="pie_chart"
            />
            <KpiTile label="Total Revenue" value={formatCurrency(dashboard.totalRevenue)} icon="payments" />
          </div>

          <div className="grid grid-cols-1 gap-density-admin lg:grid-cols-3 lg:gap-4">
            <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low lg:col-span-2">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-5 py-4">
                <h3 className="text-body-lg font-semibold text-on-surface">Fleet Status</h3>
                <span className="text-body-sm text-on-surface-variant">{dashboard.pendingBookings} pending requests</span>
              </div>
              <div className="flex flex-col gap-5 p-6">
                {(
                  [
                    { key: "AVAILABLE", label: "Available", color: "bg-tertiary" },
                    { key: "RENTED", label: "Rented", color: "bg-primary-container" },
                    { key: "MAINTENANCE", label: "Maintenance", color: "bg-error" },
                  ] as const
                ).map((row) => (
                  <div key={row.key} className="flex items-center gap-4">
                    <span className="w-24 shrink-0 text-body-sm text-on-surface-variant">{row.label}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-variant">
                      <div
                        className={`h-full rounded-full ${row.color}`}
                        style={{ width: `${(statusCounts[row.key] / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono text-numeric-data text-on-surface">{statusCounts[row.key]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto grid grid-cols-2 gap-4 border-t border-outline-variant p-6 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Active bookings</span>
                  <span className="font-mono text-on-surface">{dashboard.activeBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Pending requests</span>
                  <span className="font-mono text-on-surface">{dashboard.pendingBookings}</span>
                </div>
              </div>
            </div>

            <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low lg:h-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant bg-surface px-5 py-4">
                <h3 className="text-body-lg font-semibold text-on-surface">Recent Bookings</h3>
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-tertiary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
                </span>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto p-5">
                {recentBookings.length === 0 && <p className="text-body-sm text-on-surface-variant">No bookings yet.</p>}
                {recentBookings.map((booking, i) => (
                  <div key={booking.id} className="relative pl-6">
                    {i < recentBookings.length - 1 && <div className="absolute top-1.5 bottom-[-1.5rem] left-1.5 w-px bg-outline-variant" />}
                    <div className="absolute top-1.5 left-0 z-10 h-3 w-3 rounded-full border-2 border-surface-container-low bg-primary" />
                    <div className="mb-1 flex items-start justify-between">
                      <p className="text-body-sm font-medium text-on-surface">{booking.vehicleLabel}</p>
                      <span className="font-mono text-[11px] text-on-surface-variant">{formatDateTime(booking.createdAt)}</span>
                    </div>
                    <p className="mb-2 text-body-sm text-on-surface-variant">{booking.customerName}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
