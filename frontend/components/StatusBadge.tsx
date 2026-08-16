const STYLES: Record<string, string> = {
  PENDING: "bg-primary/12 text-primary",
  CONFIRMED: "bg-primary-container/20 text-primary-container",
  ONGOING: "bg-tertiary-container/30 text-on-tertiary-container",
  COMPLETED: "bg-tertiary/12 text-tertiary",
  CANCELLED: "bg-surface-variant text-on-surface-variant",
  AVAILABLE: "bg-tertiary/12 text-tertiary",
  RENTED: "bg-primary-container/20 text-primary-container",
  MAINTENANCE: "bg-error/12 text-error",
  ACTIVE: "bg-tertiary/12 text-tertiary",
  SUSPENDED: "bg-error/12 text-error",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-surface-variant text-on-surface-variant";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-caps uppercase ${style}`}>
      {status}
    </span>
  );
}
