"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, backendFetch } from "../backend";
import { getSession } from "../session";
import type { BranchResponse, UserSummary } from "../types";

export async function createStaffAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const branchIdRaw = formData.get("branchId");

  try {
    await backendFetch<UserSummary>("/admin/staff", {
      method: "POST",
      token: session.token,
      body: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? "STAFF"),
        branchId: branchIdRaw ? Number(branchIdRaw) : null,
      },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not create this account.";
    redirect(`/admin/staff?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff?success=Account%20created");
}

export async function deleteStaffAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const id = Number(formData.get("id"));

  try {
    await backendFetch(`/admin/staff/${id}`, { method: "DELETE", token: session.token });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not remove this account.";
    redirect(`/admin/staff?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff?success=Account%20removed");
}

export async function createBranchAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  try {
    await backendFetch<BranchResponse>("/admin/branches", {
      method: "POST",
      token: session.token,
      body: {
        name: String(formData.get("name") ?? ""),
        address: String(formData.get("address") ?? ""),
        phone: String(formData.get("phone") ?? ""),
      },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not create this branch.";
    redirect(`/admin/staff?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff?success=Branch%20created");
}
