"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, backendFetch } from "../backend";
import { getSession } from "../session";
import type { CheckRecordResponse } from "../types";

async function createCheckRecord(formData: FormData, type: "CHECK_OUT" | "CHECK_IN") {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const bookingId = Number(formData.get("bookingId"));
  const odometerReading = Number(formData.get("odometerReading"));
  const conditionNotes = String(formData.get("conditionNotes") ?? "");
  const extraChargesRaw = formData.get("extraCharges");
  const extraCharges = extraChargesRaw ? Number(extraChargesRaw) : undefined;

  try {
    await backendFetch<CheckRecordResponse>(`/bookings/${bookingId}/check-records`, {
      method: "POST",
      token: session.token,
      body: { type, odometerReading, conditionNotes, extraCharges },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not record this.";
    redirect(`/staff/bookings/${bookingId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/staff/bookings/${bookingId}`);
  redirect(`/staff/bookings/${bookingId}?success=Recorded`);
}

export async function checkOutAction(formData: FormData): Promise<void> {
  await createCheckRecord(formData, "CHECK_OUT");
}

export async function checkInAction(formData: FormData): Promise<void> {
  await createCheckRecord(formData, "CHECK_IN");
}
