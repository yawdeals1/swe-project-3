import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { Banner } from "@/components/Banner";
import { FleetTable } from "@/components/FleetTable";
import type { VehicleResponse } from "@/lib/types";

export default async function StaffHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await getSession();
  const vehicles = await backendFetch<VehicleResponse[]>("/vehicles", { token: session!.token });

  const available = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const rented = vehicles.filter((v) => v.status === "RENTED").length;
  const maintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length;

  return (
    <div className="p-density-admin md:p-gutter">
      <div className="mb-gutter flex items-end justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Fleet Overview</h1>
          <p className="mt-1 text-body-sm text-secondary">Real-time status of all registered vehicles.</p>
        </div>
      </div>

      <Banner error={error} success={success} />

      <div className="mb-gutter grid grid-cols-3 gap-density-admin">
        <div className="flex flex-col gap-1 rounded-lg border border-whisper bg-surface p-3">
          <span className="text-label-caps text-secondary uppercase">Available</span>
          <div className="flex items-end gap-2">
            <span className="font-mono text-headline-md text-tertiary">{available}</span>
            <span className="mb-1 text-body-sm text-secondary">Vehicles</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-whisper bg-surface p-3">
          <span className="text-label-caps text-secondary uppercase">Rented</span>
          <div className="flex items-end gap-2">
            <span className="font-mono text-headline-md text-primary-container">{rented}</span>
            <span className="mb-1 text-body-sm text-secondary">Active</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-whisper bg-surface p-3">
          <span className="text-label-caps text-secondary uppercase">Maintenance</span>
          <div className="flex items-end gap-2">
            <span className="font-mono text-headline-md text-error">{maintenance}</span>
            <span className="mb-1 text-body-sm text-secondary">Scheduled</span>
          </div>
        </div>
      </div>

      <FleetTable vehicles={vehicles} />
    </div>
  );
}
