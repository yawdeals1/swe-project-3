"use client";

import { useRef, useState } from "react";
import { CategoryIcon } from "@/components/Icon";

export function VehicleImageStrip({
  images,
  alt,
  category,
  className = "",
  intervalMs = 900,
}: {
  images: string[];
  alt: string;
  category: string;
  className?: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSliding = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIndex(0);
  };

  const startSliding = () => {
    if (images.length < 2 || timerRef.current) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
  };

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-surface-container ${className}`}>
        <CategoryIcon category={category} size={40} />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-surface-container ${className}`}
      onMouseEnter={startSliding}
      onMouseLeave={stopSliding}
    >
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- vehicle photo URLs are admin-entered and arbitrary, not restricted to a known image host
        <img
          key={src + i}
          src={src}
          alt={i === 0 ? alt : ""}
          loading={i === 0 ? undefined : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${(i - index) * 100}%)` }}
        />
      ))}
      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-4 bg-surface" : "w-1 bg-surface/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
