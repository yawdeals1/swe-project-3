"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UiIcon } from "./Icon";
import type { BranchResponse, VehicleResponse } from "@/lib/types";

const CATEGORIES = ["SEDAN", "SUV", "HATCHBACK", "PICKUP", "VAN", "LUXURY"];
const STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE"];

function uploadedImageId(url: string): string | null {
  const match = url.match(/\/api\/vehicle-images\/(\d+)$/);
  return match ? match[1] : null;
}

interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
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
  const [, formAction, pending] = useActionState(async (_prevState: null, formData: FormData) => {
    await action(formData);
    return null;
  }, null);

  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // The native file input can't have individual files removed from its FileList, so newly
  // picked files live in React state (for previews + per-file removal) and get mirrored onto a
  // hidden input via DataTransfer, which is what actually gets submitted as "images".
  useEffect(() => {
    const input = uploadInputRef.current;
    if (!input) return;
    const dataTransfer = new DataTransfer();
    for (const staged of stagedImages) {
      dataTransfer.items.add(staged.file);
    }
    input.files = dataTransfer.files;
  }, [stagedImages]);

  useEffect(() => {
    return () => {
      for (const staged of stagedImages) {
        URL.revokeObjectURL(staged.previewUrl);
      }
    };
    // Revoke only on unmount, not on every stagedImages change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > 0) {
      setStagedImages((prev) => [
        ...prev,
        ...picked.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    }
    e.target.value = "";
  }

  function removeStagedImage(id: string) {
    setStagedImages((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  }

  function removeExistingImage(imageId: string) {
    setRemovedImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  }

  const visibleExistingImages = (vehicle?.imageUrls ?? []).filter((url) => {
    const id = uploadedImageId(url);
    return !id || !removedImageIds.includes(id);
  });

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-whisper bg-surface p-5">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      {removedImageIds.map((id) => (
        <input key={id} type="hidden" name="removeImageIds" value={id} />
      ))}
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

      {vehicle && visibleExistingImages.length > 0 && (
        <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
          Current photos
          <div className="flex flex-wrap gap-3">
            {visibleExistingImages.map((url) => {
              const imageId = uploadedImageId(url);
              return (
                <div key={url} className="relative h-20 w-20">
                  {/* eslint-disable-next-line @next/next/no-img-element -- served through our own proxy/legacy external URLs, not a fixed image host */}
                  <img src={url} alt="" className="h-20 w-20 rounded-lg border border-outline-variant object-cover" />
                  {imageId && (
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageId)}
                      disabled={pending}
                      aria-label="Remove photo"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-on-error shadow disabled:opacity-50"
                    >
                      <UiIcon name="close" size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 text-body-sm text-on-surface-variant">
        {vehicle ? "Add photos" : "Photos"}
        <input
          ref={pickerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={pending}
          onChange={handlePickFiles}
          className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary-container file:px-3 file:py-1.5 file:text-on-secondary-container focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
        />
        {/* Hidden field actually submitted as "images"; kept in sync with stagedImages above. */}
        <input ref={uploadInputRef} type="file" name="images" multiple className="hidden" aria-hidden tabIndex={-1} />
      </div>

      {stagedImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {stagedImages.map((staged) => (
            <div key={staged.id} className="relative h-20 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a fixed image host */}
              <img
                src={staged.previewUrl}
                alt=""
                className="h-20 w-20 rounded-lg border border-outline-variant object-cover"
              />
              {pending ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface/70">
                  <Spinner className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => removeStagedImage(staged.id)}
                  aria-label="Remove photo"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-on-error shadow"
                >
                  <UiIcon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-5 py-2.5 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending && <Spinner className="h-4 w-4" />}
        {pending ? "Saving..." : vehicle ? "Save changes" : "Add vehicle"}
      </button>
    </form>
  );
}
