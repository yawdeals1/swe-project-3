export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
