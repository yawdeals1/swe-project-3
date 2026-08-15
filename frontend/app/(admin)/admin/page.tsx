import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { formatCurrency } from "@/lib/format";
import type { DashboardResponse } from "@/lib/types";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  const dashboard = await backendFetch<DashboardResponse>("/admin/dashboard", { token: session!.token });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Total vehicles" value={String(dashboard.totalVehicles)} />
        <StatTile label="Available now" value={String(dashboard.availableVehicles)} />
        <StatTile label="Active bookings" value={String(dashboard.activeBookings)} />
        <StatTile label="Pending requests" value={String(dashboard.pendingBookings)} />
        <StatTile label="Fleet utilization" value={`${Math.round(dashboard.utilizationRate * 100)}%`} />
        <StatTile label="Total revenue" value={formatCurrency(dashboard.totalRevenue)} />
      </div>
    </div>
  );
}
