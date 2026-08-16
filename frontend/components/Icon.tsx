import Image from "next/image";

const ICON_PATHS: Record<string, React.ReactNode> = {
  directions_car: (
    <>
      <path d="M3 15.5v-2.3c0-.7.5-1.3 1.2-1.5L7 11l2.2-3h5.1c.8 0 1.5.3 2 .9l1.8 2.1 2.2.7c.4.1.7.5.7 1v2.8h-2.5m-13 0H3" />
      <path d="M7 11h11.1M9.2 8 8 11m6.3-3 2.5 3" />
      <circle cx="7" cy="15.5" r="2" />
      <circle cx="16.5" cy="15.5" r="2" />
    </>
  ),
  arrow_forward: (
    <>
      <path d="M4 12h15" />
      <path d="m14 7 5 5-5 5" />
    </>
  ),
  arrow_back: (
    <>
      <path d="M20 12H5" />
      <path d="m10 7-5 5 5 5" />
    </>
  ),
  cancel: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  check: (
    <>
      <path d="m5 12.5 4.2 4.2" />
      <path d="M9.2 16.7 19 7" />
    </>
  ),
  check_circle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8 12 2.7 2.7L16.5 9" />
    </>
  ),
  help_center: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.3a2.4 2.4 0 1 1 3 2.3c-.5.2-.7.6-.7 1.1v.6" />
      <circle cx="12" cy="16.5" r=".5" />
    </>
  ),
  chevron_right: (
    <>
      <path d="m9 6 6 6" />
      <path d="m15 12-6 6" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.2 15.2 4.3 4.3" />
    </>
  ),
  filter_list: (
    <>
      <path d="M4 6h5m3 0h8M4 12h9m3 0h4M4 18h3m3 0h10" />
      <circle cx="10.5" cy="6" r="1.5" />
      <circle cx="14.5" cy="12" r="1.5" />
      <circle cx="8.5" cy="18" r="1.5" />
    </>
  ),
  calendar_today: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 9h17" />
      <path d="M8 12.5h.1m3.9 0h.1m3.9 0h.1M8 16.5h.1m3.9 0h.1m3.9 0h.1" />
    </>
  ),
  event: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 9h17" />
      <path d="M8 12.5h.1m3.9 0h.1m3.9 0h.1M8 16.5h.1m3.9 0h.1m3.9 0h.1" />
    </>
  ),
  calendar_month: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 9h17" />
      <path d="M8 12.5h.1m3.9 0h.1m3.9 0h.1M8 16.5h.1m3.9 0h.1m3.9 0h.1" />
    </>
  ),
  speed: (
    <>
      <path d="M4.4 18a8.5 8.5 0 1 1 15.2 0" />
      <path d="M6.5 14.5h1M8.5 9.5l.7.7M12 7v1m3.5 2.2.7-.7M17.5 14.5h1" />
      <path d="m12 15 4-4" />
      <circle cx="12" cy="15" r="1.5" />
    </>
  ),
  fact_check: (
    <>
      <path d="M9 5H6.5A1.5 1.5 0 0 0 5 6.5v13A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 17.5 5H15" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m8 12 1.5 1.5L12 11m2.5 1H17M8 17h2m4.5 0H17" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r=".5" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  inbox: (
    <>
      <path d="m4 8-1.5 8.5A2 2 0 0 0 4.5 19h15a2 2 0 0 0 2-2.5L20 8" />
      <path d="M3 14h5l1.5 2h5l1.5-2h5" />
      <path d="M7 10.5V5h10v5.5" />
    </>
  ),
  hourglass_empty: (
    <>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 4 1.7 6.5 5 9-3.3 2.5-5 5-5 9m10-18c0 4-1.7 6.5-5 9 3.3 2.5 5 5 5 9" />
      <path d="M9 18h6" />
    </>
  ),
  payments: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M13.5 13h-3a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 0 0-3ZM12 11.5v6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.2c0 4.5 2.8 8.2 7 9.8 4.2-1.6 7-5.3 7-9.8V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H5v14h5" />
      <path d="M9 12h11" />
      <path d="m16 8 4 4-4 4" />
    </>
  ),
  pie_chart: (
    <>
      <path d="M11 3.5A8.5 8.5 0 1 0 20.5 13H11V3.5Z" />
      <path d="M14 3.5a6.5 6.5 0 0 1 6.5 6.5H14V3.5Z" />
    </>
  ),
  pending_actions: (
    <>
      <path d="M15 20H6.5A1.5 1.5 0 0 1 5 18.5v-12A1.5 1.5 0 0 1 6.5 5H9m6 0h2.5A1.5 1.5 0 0 1 19 6.5V11" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <circle cx="17" cy="17" r="4" />
      <path d="M17 14.8V17l1.5 1" />
    </>
  ),
  badge: (
    <>
      <path d="M12 3 5 6v5.2c0 4.5 2.8 8.2 7 9.8 4.2-1.6 7-5.3 7-9.8V6l-7-3Z" />
      <circle cx="12" cy="9.5" r="2" />
      <path d="M8.5 16c.5-1.6 1.8-2.5 3.5-2.5s3 .9 3.5 2.5" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 20h16" />
      <rect x="5" y="12" width="3" height="8" rx=".5" />
      <rect x="10.5" y="8" width="3" height="12" rx=".5" />
      <rect x="16" y="4" width="3" height="16" rx=".5" />
    </>
  ),
  key: (
    <>
      <rect x="3" y="3" width="10" height="14" rx="5" />
      <circle cx="8" cy="7.5" r="1" />
      <circle cx="8" cy="12.5" r="1" />
      <path d="M13 12h8v2h-2v2h-2v-2h-4" />
    </>
  ),
  event_note: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 9h17" />
      <path d="M7 13h10M7 17h7" />
    </>
  ),
};

export function UiIcon({
  name,
  className = "",
  size = 24,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const children = ICON_PATHS[name];
  if (!children) {
    return null;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const CATEGORY_ICON: Record<string, string> = {
  SEDAN: "category-sedan",
  SUV: "category-suv",
  HATCHBACK: "category-hatchback",
  PICKUP: "category-pickup",
  VAN: "category-van",
  LUXURY: "category-luxury",
};

const STATUS_ICON: Record<string, string> = {
  AVAILABLE: "status-available",
  RENTED: "status-rented",
  MAINTENANCE: "status-maintenance",
};

function iconSrc(name: string) {
  return `/icons/${name}.svg`;
}

export function CategoryIcon({ category, size = 20 }: { category: string; size?: number }) {
  const name = CATEGORY_ICON[category] ?? "category-sedan";
  return <Image src={iconSrc(name)} alt="" width={size} height={size} className="opacity-70" />;
}

export function VehicleStatusIcon({ status, size = 16 }: { status: string; size?: number }) {
  const name = STATUS_ICON[status];
  if (!name) {
    return null;
  }
  return <Image src={iconSrc(name)} alt="" width={size} height={size} />;
}
