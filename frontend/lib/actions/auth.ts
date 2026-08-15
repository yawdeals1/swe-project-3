"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, backendFetch } from "../backend";
import { roleHome, SESSION_COOKIE } from "../session";
import type { AuthResponse } from "../types";

async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let auth: AuthResponse;
  try {
    auth = await backendFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  await setSessionCookie(auth.token);
  redirect(roleHome(auth.user.role));
}

export async function registerAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");

  let auth: AuthResponse;
  try {
    auth = await backendFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, phone, password },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  await setSessionCookie(auth.token);
  redirect(roleHome(auth.user.role));
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
