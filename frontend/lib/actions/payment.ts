"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, backendFetch } from "../backend";
import { getSession } from "../session";
import type { PaymentResponse } from "../types";

export async function verifyPaymentAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const paymentId = Number(formData.get("paymentId"));
  const bookingId = Number(formData.get("bookingId"));

  try {
    await backendFetch<PaymentResponse>(`/payments/${paymentId}/verify`, {
      method: "POST",
      token: session.token,
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not verify this payment.";
    redirect(`/staff/bookings/${bookingId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/staff/bookings/${bookingId}`);
  redirect(`/staff/bookings/${bookingId}?success=Payment%20verified`);
}
