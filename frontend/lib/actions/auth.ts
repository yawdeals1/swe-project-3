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

  // login always returns AUTHENTICATED (or throws above) — the backend never issues
  // PENDING_VERIFICATION here, only from register().
  await setSessionCookie(auth.token!);
  redirect(roleHome(auth.user!.role));
}

export async function registerAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let auth: AuthResponse;
  try {
    auth = await backendFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  if (auth.status === "PENDING_VERIFICATION") {
    redirect("/login?pending=1");
  }

  await setSessionCookie(auth.token!);
  redirect(roleHome(auth.user!.role));
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    // Best-effort: invalidate the token server-side (FR-1.4) before dropping the cookie, so it
    // can't be replayed. Deploro being unreachable must never block the user from logging out.
    try {
      await backendFetch("/auth/logout", { method: "POST", token });
    } catch {
      // ignore — the cookie is cleared below regardless
    }
  }
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
