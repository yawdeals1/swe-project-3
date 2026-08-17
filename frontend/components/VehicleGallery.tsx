"use client";

import { useState } from "react";

export function VehicleGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-64 overflow-hidden rounded-xl shadow-sm md:h-[500px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- vehicle photo URLs are admin-entered and arbitrary, not restricted to a known image host */}
        <img src={images[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                i === active ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- vehicle photo URLs are admin-entered and arbitrary, not restricted to a known image host */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
