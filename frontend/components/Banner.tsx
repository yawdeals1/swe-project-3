export function Banner({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) {
    return null;
  }
  return (
    <div
      className={
        "mb-6 rounded-lg border px-4 py-3 text-body-sm " +
        (error ? "border-error/30 bg-error-container/40 text-on-error-container" : "border-tertiary/30 bg-tertiary-container/30 text-on-tertiary-container")
      }
    >
      {error ?? success}
    </div>
  );
}
