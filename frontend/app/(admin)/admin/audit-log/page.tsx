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
    <div className="p-density-admin md:p-gutter">
      <h1 className="mb-6 text-headline-lg text-on-surface">Audit Log &mdash; Check Records</h1>

      {records.length === 0 ? (
        <p className="rounded-lg border border-whisper bg-surface p-8 text-center text-body-sm text-on-surface-variant">
          No check-in/check-out records yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-whisper bg-surface">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="border-b border-whisper bg-surface-variant text-label-caps text-secondary">
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Recorded</th>
                <th className="px-4 py-3 font-medium">Odometer</th>
                <th className="px-4 py-3 font-medium">Charges</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-whisper text-on-surface">
              {records.map((record) => (
                <tr key={record.id} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-4 py-3">
                    <p className="font-medium">{record.staffName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-caps font-medium text-on-surface-variant">
                      {record.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-on-surface-variant">#{record.bookingId}</span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatDate(record.recordedAt)}</td>
                  <td className="px-4 py-3">{record.odometerReading ? `${record.odometerReading} km` : "—"}</td>
                  <td className="px-4 py-3">
                    {record.extraCharges && record.extraCharges > 0 ? `$${record.extraCharges.toFixed(2)}` : "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-on-surface-variant">
                    {record.conditionNotes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-label-caps text-secondary">Total records: {records.length}</p>
    </div>
  );
}
