import Image from "next/image";

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
  return <Image src={iconSrc(name)} alt="" width={size} height={size} className="opacity-70 dark:invert" />;
}

export function VehicleStatusIcon({ status, size = 16 }: { status: string; size?: number }) {
  const name = STATUS_ICON[status];
  if (!name) {
    return null;
  }
  return <Image src={iconSrc(name)} alt="" width={size} height={size} className="dark:invert" />;
}
