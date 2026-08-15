import { cookies } from "next/headers";
import { backendFetch } from "./backend";
import type { Role, UserSummary } from "./types";

export const SESSION_COOKIE = "carvo_token";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export interface Session {
  token: string;
  user: UserSummary;
}

export async function getSession(): Promise<Session | null> {
  const token = await getToken();
  if (!token) {
    return null;
  }
  try {
    const user = await backendFetch<UserSummary>("/users/me", { token });
    return { token, user };
  } catch {
    return null;
  }
}

export function roleHome(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "STAFF":
      return "/staff";
    default:
      return "/dashboard";
  }
}
