import { BACKEND_URL } from "@/lib/backend";

// Vehicle photos live in Deploro R2 now, not in Postgres, and vehicle responses carry their
// absolute public URL — so pages point <img> straight at the CDN and never reach this route.
// It stays for URLs minted before that change (rendered pages, browser caches, bookmarks): the
// backend answers with a 302 to the R2 URL, and this forwards that redirect to the browser
// rather than following it and piping the bytes back through this server. Proxying would work,
// but it would spend our bandwidth on every image and discard the CDN caching the public URL
// already has.
export async function GET(_req: Request, ctx: RouteContext<"/api/vehicle-images/[imageId]">) {
  const { imageId } = await ctx.params;
  const res = await fetch(`${BACKEND_URL}/api/v1/vehicles/images/${imageId}`, {
    cache: "no-store",
    redirect: "manual",
  });

  const location = res.headers.get("location");
  if (location) {
    return Response.redirect(location, 302);
  }

  // Pre-migration rows whose bytes are still only in the database — the rollback path, kept
  // alive until the follow-up migration drops image_data.
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
