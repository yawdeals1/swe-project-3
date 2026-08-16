"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

export function TopNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive
                ? "border-b-2 border-primary pb-1 font-bold text-primary transition-colors"
                : "pb-1 text-secondary transition-colors hover:text-primary-container"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
