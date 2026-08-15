export function Banner({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) {
    return null;
  }
  return (
    <div
      className={
        "mb-6 rounded-md border px-4 py-3 text-sm " +
        (error
          ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          : "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200")
      }
    >
      {error ?? success}
    </div>
  );
}
