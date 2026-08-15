import type { BranchResponse, VehicleResponse } from "@/lib/types";

const CATEGORIES = ["SEDAN", "SUV", "HATCHBACK", "PICKUP", "VAN", "LUXURY"];
const STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE"];

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
    <form action={action} className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Make
          <input
            type="text"
            name="make"
            required
            defaultValue={vehicle?.make}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Model
          <input
            type="text"
            name="model"
            required
            defaultValue={vehicle?.model}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex w-28 flex-col gap-1 text-sm">
          Year
          <input
            type="number"
            name="year"
            required
            min={1980}
            max={2100}
            defaultValue={vehicle?.year}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Category
          <select
            name="category"
            required
            defaultValue={vehicle?.category ?? CATEGORIES[0]}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Plate number
          <input
            type="text"
            name="plateNumber"
            required
            defaultValue={vehicle?.plateNumber}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex w-32 flex-col gap-1 text-sm">
          Daily rate
          <input
            type="number"
            name="dailyRate"
            required
            min={0}
            step="0.01"
            defaultValue={vehicle?.dailyRate}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Branch
          <select
            name="branchId"
            defaultValue={vehicle?.branchId ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Status
            <select
              name="status"
              defaultValue={vehicle.status}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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

      <label className="flex flex-col gap-1 text-sm">
        Image URLs (comma-separated)
        <input
          type="text"
          name="imageUrls"
          defaultValue={vehicle?.imageUrls.join(", ")}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <button
        type="submit"
        className="self-start rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      >
        {vehicle ? "Save changes" : "Add vehicle"}
      </button>
    </form>
  );
}
