"use client";

import { useState } from "react";
import { UiIcon } from "@/components/Icon";

export function DashboardShell({
  brand,
  sidebar,
  children,
}: {
  brand: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 flex-shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-low px-gutter md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="dashboard-sidebar"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <UiIcon name={open ? "close" : "menu"} size={22} />
        </button>
        <span className="text-body-lg font-bold text-on-surface">{brand}</span>
      </div>

      {open && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-inverse-surface/40 md:hidden"
        />
      )}

      <div
        id="dashboard-sidebar"
        onClick={() => setOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 shadow-2xl transition-transform duration-200 ease-out md:static md:z-auto md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {sidebar}
      </div>

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
