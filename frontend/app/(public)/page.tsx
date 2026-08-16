import Link from "next/link";
import { UiIcon } from "@/components/Icon";

const STEPS = [
  {
    icon: "directions_car",
    title: "Choose vehicle",
    description: "Browse our extensive fleet of modern, well-maintained cars tailored to your needs.",
  },
  {
    icon: "calendar_month",
    title: "Book dates",
    description: "Select your pick-up and drop-off dates instantly with our streamlined booking system.",
  },
  {
    icon: "key",
    title: "Pick up & Drive",
    description: "Grab the keys from our convenient locations and hit the road immediately.",
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-gutter py-density-public md:grid-cols-12 md:px-margin-desktop md:py-[120px]">
        <div className="relative z-10 flex flex-col items-start justify-center pr-8 md:col-span-5">
          <h1 className="mb-6 text-headline-xl leading-tight text-on-surface">Rental fleet for the modern operator.</h1>
          <p className="mb-10 max-w-md text-body-lg text-on-surface-variant">
            Access a premium network of reliable vehicles. Streamlined bookings, transparent pricing, and instant
            availability for personal and business use.
          </p>
          <Link
            href="/vehicles"
            className="rounded-lg bg-primary-container px-8 py-4 font-medium text-on-primary-container shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            Search Vehicles
          </Link>
        </div>
        <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary-fixed to-surface-container md:col-span-7 md:h-[600px]">
          <div className="flex h-full w-full items-center justify-center text-on-primary-fixed-variant">
            <UiIcon name="directions_car" size={120} className="opacity-40" />
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-4 mb-20 rounded-3xl bg-surface-container-low px-gutter py-density-public md:mx-8 md:px-margin-desktop md:py-[100px]"
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-headline-lg text-on-surface">How it Works</h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">Get on the road in three simple steps.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`flex flex-col items-center rounded-3xl bg-surface p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-2 ${
                i === 1 ? "md:mt-12" : i === 2 ? "md:mt-24" : ""
              }`}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed-dim text-on-primary-fixed-variant">
                <UiIcon name={step.icon} size={32} />
              </div>
              <h3 className="mb-3 text-headline-md text-on-surface">{step.title}</h3>
              <p className="text-body-md text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
