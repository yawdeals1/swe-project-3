"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { UiIcon } from "./Icon";
import type { BranchResponse, VehicleResponse } from "@/lib/types";

const CATEGORIES = ["SEDAN", "SUV", "HATCHBACK", "PICKUP", "VAN", "LUXURY"];
const STATUSES = ["AVAILABLE", "RENTED", "MAINTENANCE"];

// The VPS's nginx reverse proxy in front of the app rejects any request over ~1MB with a bare
// "413 Request Entity Too Large" before it ever reaches Next.js — well under the backend's own
// 8MB per-file limit (application.yml). Checked client-side so oversized photos get a clear
// message instead of an opaque failure (or, for the create form, silently losing the whole
// submission to a raw 413 page).
const MAX_UPLOAD_BYTES = 1_000_000;

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tooLargeMessage(file: File): string {
  return `${file.name} is ${formatMB(file.size)} — please compress or resize it to under 1 MB and try again.`;
}

function uploadedImageId(url: string): string | null {
  const match = url.match(/\/api\/vehicle-images\/(\d+)$/);
  return match ? match[1] : null;
}

interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface RejectedFile {
  id: string;
  message: string;
}

interface UploadingImage {
  id: string;
  file: File;
  previewUrl: string;
  status: "uploading" | "error";
  message?: string;
  retryable?: boolean;
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
  // Photos that already exist on the server, for an existing vehicle — the initial set plus
  // whatever uploadImageNow() has successfully added since.
  const [photoUrls, setPhotoUrls] = useState<string[]>(vehicle?.imageUrls ?? []);
  // In-flight/failed uploads for an existing vehicle, keyed by a local id until they land in
  // photoUrls (or the user gives up on them).
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  // Files picked before a vehicle exists yet (create form) — these can't upload anywhere until
  // the vehicle is created, so they're staged and sent along with the create submission.
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  // Files rejected before staging/upload even started (create form only — the edit form shows
  // its equivalent rejections inline as error tiles in uploadingImages instead).
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // The native file input can't have individual files removed from its FileList, so staged
  // (create-form-only) files live in React state and get mirrored onto a hidden input via
  // DataTransfer, which is what actually gets submitted as "images".
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
      for (const uploading of uploadingImages) {
        URL.revokeObjectURL(uploading.previewUrl);
      }
    };
    // Revoke only on unmount, not on every state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadImageNow(id: string, file: File) {
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch(`/api/vehicles/${vehicle!.id}/images`, { method: "POST", body });
      if (!res.ok) {
        if (res.status === 413) {
          setUploadingImages((prev) =>
              prev.map((u) => (u.id === id ? { ...u, status: "error", message: tooLargeMessage(file), retryable: false } : u)));
          return;
        }
        throw new Error("Upload failed");
      }
      const data: VehicleResponse = await res.json();
      setPhotoUrls((prev) => Array.from(new Set([...prev, ...data.imageUrls])));
      setUploadingImages((prev) => {
        const target = prev.find((u) => u.id === id);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return prev.filter((u) => u.id !== id);
      });
    } catch {
      setUploadingImages((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: "error", message: "Upload failed. Try again.", retryable: true } : u)));
    }
  }

  function handlePickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    if (vehicle) {
      // Upload immediately — the vehicle already exists, so there's somewhere to put these.
      for (const file of picked) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        if (file.size > MAX_UPLOAD_BYTES) {
          setUploadingImages((prev) => [
            ...prev,
            {
              id,
              file,
              previewUrl: URL.createObjectURL(file),
              status: "error",
              message: tooLargeMessage(file),
              retryable: false,
            },
          ]);
          continue;
        }
        setUploadingImages((prev) => [
          ...prev,
          { id, file, previewUrl: URL.createObjectURL(file), status: "uploading" },
        ]);
        void uploadImageNow(id, file);
      }
    } else {
      // No vehicle yet — stage locally and upload once the vehicle is created. The whole form
      // submission (all staged files in one request) is just as subject to the proxy's size
      // limit, so oversized files are rejected up front rather than risking the entire
      // Add-vehicle submission to a raw 413.
      const accepted: File[] = [];
      const rejected: RejectedFile[] = [];
      for (const file of picked) {
        if (file.size > MAX_UPLOAD_BYTES) {
          rejected.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message: tooLargeMessage(file) });
        } else {
          accepted.push(file);
        }
      }
      if (rejected.length > 0) {
        setRejectedFiles((prev) => [...prev, ...rejected]);
      }
      setStagedImages((prev) => [
        ...prev,
        ...accepted.map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    }
  }

  function retryUpload(id: string) {
    const target = uploadingImages.find((u) => u.id === id);
    if (!target) return;
    setUploadingImages((prev) => prev.map((u) => (u.id === id ? { ...u, status: "uploading", message: undefined } : u)));
    void uploadImageNow(id, target.file);
  }

  function dismissRejectedFile(id: string) {
    setRejectedFiles((prev) => prev.filter((r) => r.id !== id));
  }

  function dismissFailedUpload(id: string) {
    setUploadingImages((prev) => {
      const target = prev.find((u) => u.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((u) => u.id !== id);
    });
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

  const visiblePhotoUrls = photoUrls.filter((url) => {
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

      {vehicle ? (
        <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
          Photos
          {(visiblePhotoUrls.length > 0 || uploadingImages.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {visiblePhotoUrls.map((url) => {
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
              {uploadingImages.map((u) => (
                <div key={u.id} className="relative h-20 w-20" title={u.message}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a fixed image host */}
                  <img
                    src={u.previewUrl}
                    alt=""
                    className="h-20 w-20 rounded-lg border border-outline-variant object-cover"
                  />
                  {u.status === "uploading" ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-surface/70">
                      <Spinner className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <>
                      {u.retryable && (
                        <button
                          type="button"
                          onClick={() => retryUpload(u.id)}
                          aria-label="Retry upload"
                          className="absolute inset-0 flex items-center justify-center rounded-lg bg-error-container/85 text-label-caps font-medium text-on-error-container"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dismissFailedUpload(u.id)}
                        aria-label="Remove photo"
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-on-error shadow"
                      >
                        <UiIcon name="close" size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {uploadingImages.some((u) => u.status === "error") && (
            <ul className="flex flex-col gap-0.5 text-label-caps text-error">
              {uploadingImages
                  .filter((u) => u.status === "error")
                  .map((u) => (
                    <li key={u.id}>{u.message}</li>
                  ))}
            </ul>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handlePickFiles}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary-container file:px-3 file:py-1.5 file:text-on-secondary-container focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
          Photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={pending}
            onChange={handlePickFiles}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary-container file:px-3 file:py-1.5 file:text-on-secondary-container focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
          <p className="text-label-caps text-on-surface-variant/70">Photos upload once you add the vehicle below.</p>
          {rejectedFiles.length > 0 && (
            <ul className="flex flex-col gap-0.5 text-label-caps text-error">
              {rejectedFiles.map((r) => (
                <li key={r.id} className="flex items-start gap-1.5">
                  <span className="flex-1">{r.message}</span>
                  <button
                    type="button"
                    onClick={() => dismissRejectedFile(r.id)}
                    aria-label="Dismiss"
                    className="shrink-0 text-on-surface-variant hover:text-on-surface"
                  >
                    <UiIcon name="close" size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Hidden field actually submitted as "images"; kept in sync with stagedImages above. */}
          <input ref={uploadInputRef} type="file" name="images" multiple className="hidden" aria-hidden tabIndex={-1} />
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
