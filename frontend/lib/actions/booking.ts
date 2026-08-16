"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, backendFetch } from "../backend";
import { getSession } from "../session";
import type { BookingResponse } from "../types";

export async function createBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const vehicleId = Number(formData.get("vehicleId"));
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  try {
    await backendFetch<BookingResponse>("/bookings", {
      method: "POST",
      token: session.token,
      body: { vehicleId, startDate, endDate },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not submit this booking request.";
    redirect(`/vehicles/${vehicleId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?success=Booking%20request%20submitted");
}

export async function confirmBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const bookingId = Number(formData.get("bookingId"));

  try {
    await backendFetch<BookingResponse>(`/bookings/${bookingId}/confirm`, {
      method: "POST",
      token: session.token,
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not confirm this booking.";
    redirect(`/staff?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/staff");
  redirect("/staff?success=Booking%20confirmed");
}

export async function rejectBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const bookingId = Number(formData.get("bookingId"));

  try {
    await backendFetch<BookingResponse>(`/bookings/${bookingId}/reject`, {
      method: "POST",
      token: session.token,
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not reject this booking.";
    redirect(`/staff?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/staff");
  redirect("/staff?success=Booking%20rejected");
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const bookingId = Number(formData.get("bookingId"));

  try {
    await backendFetch<BookingResponse>(`/bookings/${bookingId}/cancel`, {
      method: "POST",
      token: session.token,
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Could not cancel this booking.";
    redirect(`/dashboard?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?success=Booking%20cancelled");
}

export async function payBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const bookingId = Number(formData.get("bookingId"));
  const method = String(formData.get("method") ?? "CARD");

  try {
    await backendFetch(`/payments`, {
      method: "POST",
      token: session.token,
      body: { bookingId, method },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Payment could not be recorded.";
    redirect(`/dashboard/bookings/${bookingId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/dashboard/bookings/${bookingId}`);
  redirect(`/dashboard/bookings/${bookingId}?success=Payment%20recorded`);
}
