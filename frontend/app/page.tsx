export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Carvo
        </h1>
        <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
          Vehicle rental management. Frontend scaffold — role-specific
          experiences (customer, staff, admin) land in later phases.
        </p>
      </main>
    </div>
  );
}
