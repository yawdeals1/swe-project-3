"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UiIcon } from "@/components/Icon";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({
  links,
  userName,
  logoutAction,
}: {
  links: NavLink[];
  userName?: string;
  logoutAction?: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-variant"
      >
        <UiIcon name={open ? "close" : "menu"} size={22} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-inverse-surface/40"
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-t border-outline-variant bg-surface p-gutter shadow-lg"
          >
            {userName && <p className="px-3 py-2 text-body-sm font-medium text-secondary">{userName}</p>}
            {links.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={
                    isActive
                      ? "rounded-lg bg-primary-container px-3 py-3 text-body-md font-bold text-on-primary-container"
                      : "rounded-lg px-3 py-3 text-body-md text-on-surface transition-colors hover:bg-surface-variant"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            {logoutAction && (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-3 text-left text-body-md text-on-surface transition-colors hover:bg-surface-variant"
                >
                  Log out
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
