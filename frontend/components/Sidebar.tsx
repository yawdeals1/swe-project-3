import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { getSession } from "@/lib/session";
import { UiIcon } from "@/components/Icon";
import { SidebarNav } from "@/components/SidebarNav";

const STAFF_ITEMS = [
  { href: "/staff", label: "Fleet", icon: "directions_car" },
  { href: "/staff/bookings", label: "Requests", icon: "pending_actions" },
  { href: "/staff/customers", label: "Customers", icon: "badge" },
];

const ADMIN_ITEMS = [
  { href: "/admin", label: "Analytics", icon: "analytics" },
  { href: "/admin/vehicles", label: "Fleet", icon: "directions_car" },
  { href: "/admin/bookings", label: "Bookings", icon: "event_note" },
  { href: "/admin/customers", label: "Customers", icon: "badge" },
  { href: "/admin/staff", label: "Staff", icon: "shield" },
  { href: "/admin/audit-log", label: "Audit Log", icon: "fact_check" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function Sidebar({ role }: { role: "STAFF" | "ADMIN" }) {
  const session = await getSession();
  const items = role === "ADMIN" ? ADMIN_ITEMS : STAFF_ITEMS;
  const brand = role === "ADMIN" ? "Carvo Admin" : "Carvo Staff";

  return (
    <nav className="flex h-full w-64 flex-shrink-0 flex-col gap-2 border-r border-outline-variant bg-surface-container-low p-density-admin">
      <Link href={role === "ADMIN" ? "/admin" : "/staff"} className="mb-2 block px-3 py-4">
        <div className="text-headline-md font-bold text-on-surface">{brand}</div>
        <div className="mt-1 text-body-sm text-secondary">Operations</div>
      </Link>

      <SidebarNav items={items} />

      {session && (
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-2">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              <UiIcon name="logout" size={18} />
              <span>Log out</span>
            </button>
          </form>
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-outline-variant bg-surface px-3 py-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-caps font-medium text-on-secondary-container">
              {initials(session.user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-medium text-on-surface">{session.user.name}</p>
              <p className="truncate text-label-caps text-secondary">{session.user.role === "ADMIN" ? "Administrator" : "Staff"}</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
