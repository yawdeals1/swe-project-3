"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, backendFetch } from "../backend";
import { getSession } from "../session";
import type { VehicleResponse } from "../types";

function parseVehicleForm(formData: FormData) {
  const imageUrlsRaw = String(formData.get("imageUrls") ?? "");
  const imageUrls = imageUrlsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const branchIdRaw = formData.get("branchId");

  return {
    make: String(formData.get("make") ?? ""),
    model: String(formData.get("model") ?? ""),
    year: Number(formData.get("year")),
    category: String(formData.get("category") ?? ""),
    plateNumber: String(formData.get("plateNumber") ?? ""),
    dailyRate: Number(formData.get("dailyRate")),
    branchId: branchIdRaw ? Number(branchIdRaw) : null,
    imageUrls,
    status: formData.get("status") ? String(formData.get("status")) : null,
  };
}

export async function createVehicleAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  try {
    await backendFetch<VehicleResponse>("/vehicles", {
      method: "POST",
      token: session.token,
      body: parseVehicleForm(formData),
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not create this vehicle.";
    redirect(`/admin/vehicles/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/vehicles");
  redirect("/admin/vehicles?success=Vehicle%20added");
}

export async function updateVehicleAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const id = Number(formData.get("id"));

  try {
    await backendFetch<VehicleResponse>(`/vehicles/${id}`, {
      method: "PUT",
      token: session.token,
      body: parseVehicleForm(formData),
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not update this vehicle.";
    redirect(`/admin/vehicles/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/vehicles");
  redirect("/admin/vehicles?success=Vehicle%20updated");
}

export async function updateVehicleStatusAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");

  try {
    await backendFetch<VehicleResponse>(`/vehicles/${id}/status`, {
      method: "POST",
      token: session.token,
      body: { status },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not update vehicle status.";
    redirect(`/staff?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/staff");
  redirect("/staff?success=Vehicle%20status%20updated");
}

export async function deleteVehicleAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const id = Number(formData.get("id"));

  try {
    await backendFetch(`/vehicles/${id}`, { method: "DELETE", token: session.token });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not remove this vehicle.";
    redirect(`/admin/vehicles?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/vehicles");
  redirect("/admin/vehicles?success=Vehicle%20removed");
}
