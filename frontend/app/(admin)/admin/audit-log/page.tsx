import { backendFetch } from "@/lib/backend";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/format";
import type { CheckRecordResponse } from "@/lib/types";

export default async function AdminAuditLogPage() {
  const session = await getSession();
  const records = await backendFetch<CheckRecordResponse[]>("/admin/audit-log", {
    token: session!.token,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Audit Log &mdash; Check Records</h1>

      {records.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No check-in/check-out records yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Staff
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Booking
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Recorded
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Odometer
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Charges
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{record.staffName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {record.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-zinc-500 dark:text-zinc-400">#{record.bookingId}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {formatDate(record.recordedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {record.odometerReading ? `${record.odometerReading} km` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {record.extraCharges && record.extraCharges > 0
                      ? `$${record.extraCharges.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-zinc-600 dark:text-zinc-400">
                    {record.conditionNotes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Total records: {records.length}
      </p>
    </div>
  );
}
