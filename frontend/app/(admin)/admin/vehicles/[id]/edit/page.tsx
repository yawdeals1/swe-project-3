import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { updateVehicleAction } from "@/lib/actions/vehicle";
import { Banner } from "@/components/Banner";
import { VehicleForm } from "@/components/VehicleForm";
import type { BranchResponse, VehicleResponse } from "@/lib/types";

export default async function EditVehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await getSession();

  let vehicle: VehicleResponse;
  try {
    vehicle = await backendFetch<VehicleResponse>(`/vehicles/${id}`, { token: session!.token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  const branches = await backendFetch<BranchResponse[]>("/admin/branches", { token: session!.token });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Edit {vehicle.make} {vehicle.model}
      </h1>
      <Banner error={error} />
      <VehicleForm action={updateVehicleAction} vehicle={vehicle} branches={branches} />
    </div>
  );
}
