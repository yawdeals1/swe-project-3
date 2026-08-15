"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, backendFetch } from "../backend";
import { roleHome, SESSION_COOKIE } from "../session";
import type { AuthResponse } from "../types";

async function setSessionCookie(token: string) {
  const store = await cookies();
  const headerStore = await headers();
  // Deploro's TLS cert issuance can lag behind a fresh deploy (DNS propagation), during which
  // the site is only reachable over plain HTTP — a blanket NODE_ENV-based Secure flag would make
  // the browser silently drop this cookie on every request in that window, breaking login
  // entirely. Trust the reverse proxy's X-Forwarded-Proto (Cloudflare sets this) instead, so the
  // flag reflects how this specific request actually arrived.
  const secure = headerStore.get("x-forwarded-proto") === "https";
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
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
