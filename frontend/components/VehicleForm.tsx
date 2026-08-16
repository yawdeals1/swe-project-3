import type { BranchResponse, VehicleResponse } from "@/lib/types";

const CATEGORIES = ["SEDAN", "SUV", "HATCHBACK", "PICKUP", "VAN", "LUXURY"];
const STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE"];

function uploadedImageId(url: string): string | null {
  const match = url.match(/\/api\/vehicle-images\/(\d+)$/);
  return match ? match[1] : null;
}

export function VehicleForm({
  action,
  vehicle,
  branches,
}: {
  action: (formData: FormData) => void;
  vehicle?: VehicleResponse;
  branches: BranchResponse[];
}) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border border-whisper bg-surface p-5">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-body-sm text-on-surface-variant">
          Make
          <input
            type="text"
            name="make"
            required
            defaultValue={vehicle?.make}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-body-sm text-on-surface-variant">
          Model
          <input
            type="text"
            name="model"
            required
            defaultValue={vehicle?.model}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="flex w-28 flex-col gap-1 text-body-sm text-on-surface-variant">
          Year
          <input
            type="number"
            name="year"
            required
            min={1980}
            max={2100}
            defaultValue={vehicle?.year}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-body-sm text-on-surface-variant">
          Category
          <select
            name="category"
            required
            defaultValue={vehicle?.category ?? CATEGORIES[0]}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-body-sm text-on-surface-variant">
          Plate number
          <input
            type="text"
            name="plateNumber"
            required
            defaultValue={vehicle?.plateNumber}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="flex w-32 flex-col gap-1 text-body-sm text-on-surface-variant">
          Daily rate
          <input
            type="number"
            name="dailyRate"
            required
            min={0}
            step="0.01"
            defaultValue={vehicle?.dailyRate}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-body-sm text-on-surface-variant">
          Branch
          <select
            name="branchId"
            defaultValue={vehicle?.branchId ?? ""}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">No branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        {vehicle && (
          <label className="flex flex-1 flex-col gap-1 text-body-sm text-on-surface-variant">
            Status
            <select
              name="status"
              defaultValue={vehicle.status}
              className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {vehicle && vehicle.imageUrls.length > 0 && (
        <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
          Current photos
          <div className="flex flex-wrap gap-3">
            {vehicle.imageUrls.map((url) => {
              const imageId = uploadedImageId(url);
              return (
                <label key={url} className="flex flex-col items-center gap-1 text-label-caps">
                  {/* eslint-disable-next-line @next/next/no-img-element -- served through our own proxy/legacy external URLs, not a fixed image host */}
                  <img src={url} alt="" className="h-20 w-20 rounded-lg border border-outline-variant object-cover" />
                  {imageId && (
                    <span className="flex items-center gap-1 text-error">
                      <input type="checkbox" name="removeImageIds" value={imageId} />
                      Remove
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
        {vehicle ? "Add photos" : "Photos"}
        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary-container file:px-3 file:py-1.5 file:text-on-secondary-container focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </label>

      <button
        type="submit"
        className="self-start rounded-lg bg-primary px-5 py-2.5 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
      >
        {vehicle ? "Save changes" : "Add vehicle"}
      </button>
    </form>
  );
}
