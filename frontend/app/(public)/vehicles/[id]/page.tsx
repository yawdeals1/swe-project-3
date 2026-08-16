import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { Banner } from "@/components/Banner";
import { CategoryIcon, UiIcon } from "@/components/Icon";
import { BookingWidget } from "@/components/BookingWidget";
import { formatCurrency } from "@/lib/format";
import type { VehicleResponse } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Available Now",
  RENTED: "Currently Rented",
  MAINTENANCE: "In Maintenance",
};

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  let vehicle: VehicleResponse;
  try {
    vehicle = await backendFetch<VehicleResponse>(`/vehicles/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  const session = await getSession();
  const images = vehicle.imageUrls.slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-margin-mobile py-density-public md:px-margin-desktop lg:flex-row">
      <div className="flex w-full flex-col gap-density-public lg:w-2/3">
        {error && <Banner error={error} />}

        <div className="flex items-center gap-2 text-body-sm text-secondary">
          <Link href="/vehicles" className="transition-colors hover:text-primary">
            Browse
          </Link>
          <UiIcon name="chevron_right" size={16} />
          <span className="text-on-surface">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-tertiary/10 px-3 py-1 text-label-caps text-tertiary uppercase">
              {STATUS_LABEL[vehicle.status] ?? vehicle.status}
            </span>
          </div>
          <h1 className="text-headline-xl text-on-surface">
            {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-body-lg text-secondary">
            {vehicle.year} &middot; {vehicle.category} &middot; Plate {vehicle.plateNumber}
          </p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="relative h-64 overflow-hidden rounded-xl shadow-sm md:col-span-8 md:row-span-2 md:h-[500px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- vehicle photo URLs are admin-entered and arbitrary */}
              <img src={images[0]} alt={`${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover" />
            </div>
            {images.slice(1).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- vehicle photo URLs are admin-entered and arbitrary
              <img
                key={i}
                src={src}
                alt={`${vehicle.make} ${vehicle.model} view ${i + 2}`}
                className="h-32 w-full rounded-xl object-cover shadow-sm md:col-span-4 md:h-[242px]"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-xl bg-surface-container text-on-surface-variant md:h-[400px]">
            <CategoryIcon category={vehicle.category} size={64} />
          </div>
        )}

        <div className="mt-4 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="border-b border-outline-variant/30 pb-4 text-headline-md text-on-surface">Specifications</h2>
          <dl className="mt-4 flex flex-col">
            {[
              { label: "Make", value: vehicle.make },
              { label: "Model", value: vehicle.model },
              { label: "Year", value: String(vehicle.year) },
              { label: "Category", value: vehicle.category },
              { label: "Plate Number", value: vehicle.plateNumber },
            ].map((row, i, arr) => (
              <div key={row.label} className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? "border-b border-outline-variant/10" : ""}`}>
                <dt className="text-body-md text-secondary">{row.label}</dt>
                <dd className="font-mono text-numeric-data text-on-surface">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 lg:sticky lg:top-[100px] lg:w-1/3">
        {!session && (
          <div className="rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-6 text-center shadow-sm">
            <p className="mb-4 text-body-md text-on-surface-variant">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>{" "}
              to book this vehicle.
            </p>
            <span className="font-mono text-headline-lg text-on-surface">{formatCurrency(vehicle.dailyRate)}</span>
            <span className="ml-1 text-body-md text-secondary">/ day</span>
          </div>
        )}

        {session && session.user.role === "CUSTOMER" && <BookingWidget vehicleId={vehicle.id} dailyRate={vehicle.dailyRate} />}

        {session && session.user.role !== "CUSTOMER" && (
          <div className="rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-6 text-center text-body-md text-on-surface-variant shadow-sm">
            Only customer accounts can request bookings.
          </div>
        )}

        <div className="flex items-center justify-center gap-2 p-4 text-body-sm text-secondary">
          <UiIcon name="shield" className="text-tertiary" />
          All trips covered by Carvo Protection Plan
        </div>
      </div>
    </main>
  );
}
