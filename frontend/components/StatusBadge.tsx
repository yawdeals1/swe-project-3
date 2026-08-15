const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  ONGOING: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  CANCELLED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  RENTED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  MAINTENANCE: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
