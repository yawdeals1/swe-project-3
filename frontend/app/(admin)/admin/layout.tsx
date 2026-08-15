import Link from "next/link";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/bookings", label: "Bookings" },
];

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="mx-auto flex max-w-4xl gap-6 px-4 text-sm">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="border-b-2 border-transparent py-3 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
