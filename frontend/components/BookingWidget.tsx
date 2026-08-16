"use client";

import { useMemo, useState } from "react";
import { createBookingAction } from "@/lib/actions/booking";
import { formatCurrency } from "@/lib/format";

function nightsBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

export function BookingWidget({ vehicleId, dailyRate }: { vehicleId: number; dailyRate: number }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const nights = useMemo(() => nightsBetween(startDate, endDate), [startDate, endDate]);
  const total = nights * dailyRate;

  return (
    <form action={createBookingAction} className="flex flex-col gap-6 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <div className="flex items-baseline gap-2">
        <span className="font-mono text-headline-xl text-on-surface">{formatCurrency(dailyRate)}</span>
        <span className="text-body-md text-secondary">/ day</span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant">
        <div className="flex border-b border-outline-variant">
          <label className="w-1/2 cursor-pointer border-r border-outline-variant p-3 transition-colors hover:bg-surface-variant/50">
            <span className="mb-1 block text-label-caps text-secondary uppercase">Trip start</span>
            <input
              type="date"
              name="startDate"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent text-body-md text-on-surface outline-none"
            />
          </label>
          <label className="w-1/2 cursor-pointer p-3 transition-colors hover:bg-surface-variant/50">
            <span className="mb-1 block text-label-caps text-secondary uppercase">Trip end</span>
            <input
              type="date"
              name="endDate"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent text-body-md text-on-surface outline-none"
            />
          </label>
        </div>
      </div>

      {nights > 0 && (
        <div className="flex flex-col gap-3 text-body-sm text-secondary">
          <div className="flex justify-between border-b border-outline-variant/30 pb-3">
            <span>
              {formatCurrency(dailyRate)} &times; {nights} day{nights === 1 ? "" : "s"}
            </span>
            <span className="font-mono text-on-surface">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between pt-1 text-body-md font-medium text-on-surface">
            <span>Estimated total</span>
            <span className="font-mono text-numeric-data">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-primary-container py-4 font-medium text-on-primary-container shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
      >
        Request Booking
      </button>
      <p className="mt-[-8px] text-center text-body-sm text-secondary">You won&apos;t be charged yet.</p>
    </form>
  );
}
