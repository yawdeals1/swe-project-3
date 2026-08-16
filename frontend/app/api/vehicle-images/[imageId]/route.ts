import { BACKEND_URL } from "@/lib/backend";

// The Spring Boot backend has no public route of its own (only the `web` service is exposed in
// production, per docker-compose) — this proxies uploaded vehicle photos from the internal
// backend so <img> tags in the browser can load them.
export async function GET(_req: Request, ctx: RouteContext<"/api/vehicle-images/[imageId]">) {
  const { imageId } = await ctx.params;
  const res = await fetch(`${BACKEND_URL}/api/v1/vehicles/images/${imageId}`, { cache: "no-store" });

  if (!res.ok || !res.body) {
    return new Response(null, { status: res.status });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
