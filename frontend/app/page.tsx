import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">Carvo</h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Search the fleet, book a vehicle, and track your rental from request to return.
      </p>
      <div className="flex gap-4">
        <Link
          href="/vehicles"
          className="rounded-full bg-zinc-950 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Browse vehicles
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
