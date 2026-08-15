import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { createVehicleAction } from "@/lib/actions/vehicle";
import { Banner } from "@/components/Banner";
import { VehicleForm } from "@/components/VehicleForm";
import type { BranchResponse } from "@/lib/types";

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();
  const branches = await backendFetch<BranchResponse[]>("/admin/branches", { token: session!.token });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Add vehicle</h1>
      <Banner error={error} />
      <VehicleForm action={createVehicleAction} branches={branches} />
    </div>
  );
}
