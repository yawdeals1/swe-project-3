"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UiIcon } from "@/components/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
      {items.map((item) => {
        const isActive = item.href === "/staff" || item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "flex items-center gap-3 rounded-lg bg-secondary-container px-3 py-2 text-body-sm font-medium text-on-secondary-container"
                : "flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
            }
          >
            <UiIcon name={item.icon} size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
