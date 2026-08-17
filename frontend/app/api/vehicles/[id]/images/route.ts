import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";
import { getToken } from "@/lib/session";

// Lets the vehicle edit form upload a photo the moment it's picked, instead of staging it
// client-side and only reaching the backend when the whole form is submitted. Proxies the
// multipart body straight through to Spring Boot with the session's bearer token attached
// server-side — the browser never sees or needs the token.
export async function POST(req: Request, ctx: RouteContext<"/api/vehicles/[id]/images">) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const formData = await req.formData();

  const res = await fetch(`${BACKEND_URL}/api/v1/vehicles/${id}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
