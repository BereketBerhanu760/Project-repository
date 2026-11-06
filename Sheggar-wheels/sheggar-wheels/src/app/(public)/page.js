import Link from "next/link";
import CarCard from "@/components/car-card";
import LandingHeader from "@/components/landing-header";
import demoCars from "@/lib/seed-cars";

const benefits = [
  { icon: "verified", label: "Best Price Guarantee", color: "text-emerald-300" },
  { icon: "calendar", label: "Free Cancellation up to 24h", color: "text-sky-300" },
];

function BenefitIcon({ name, className }) {
  const common = {
    className: `h-5 w-5 shrink-0 ${className}`,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "verified") {
    return (
      <svg {...common}>
        <path d="M12 3 19 6v5c0 4.7-3 8-7 10-4-2-7-5.3-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
        <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17m-12 5 2 2 4-4" />
      </svg>
    );
  }

  if (name === "flight") {
    return (
      <svg {...common}>
        <path d="m3 11 18-7-7 18-3-8-8-3Z" />
        <path d="m11 14 5-5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8 2 2-2 2 2 2-3 3-2-2-3 3m-5 1h.01" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="relative w-full overflow-hidden">
        <div
          className="relative flex min-h-[600px] w-full flex-col justify-between bg-cover bg-center lg:min-h-[720px]"
          style={{
            backgroundImage:
              "url('/images/hero-image.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />

          <LandingHeader />

          <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col justify-center px-4 pt-32 pb-16 sm:px-8 sm:pt-36 sm:pb-24 md:px-12 lg:px-16 lg:pt-40 lg:pb-32">
            <h1 className="mb-6 max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Drive the{" "}
              <span className="text-orange-400 drop-shadow-[0_0_25px_rgba(255,84,76,0.35)]">
                Exceptional.
              </span>
            </h1>

            <p className="mb-9 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl">
              Find, book, and unlock premium and exotic rental cars across 1,400+
              airports and prime metropolitan destinations worldwide. Zero counter
              queues. Pure mechanical thrill.
            </p>

            <div className="mb-9 flex flex-wrap gap-3">
              <Link
                href="/cars"
                className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
              >
                Explore cars
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Create an account
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-slate-200 sm:text-base">
              {benefits.map((benefit) => (
                <div className="flex items-center gap-2.5" key={benefit.icon}>
                  <BenefitIcon name={benefit.icon} className={benefit.color} />
                  <span>{benefit.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16 md:px-12 lg:px-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Find your next drive</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Explore a selection from the Sheggar Wheels demo fleet.</p>
          </div>
          <Link href="/cars" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600">
            Browse all cars
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {demoCars.slice(0, 3).map((car) => <CarCard car={car} key={car.id} />)}
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 py-10 sm:px-8 md:grid-cols-2 md:items-end md:px-12 lg:px-16">
          <div>
            <Link href="/" className="text-sm font-extrabold tracking-[0.16em] text-white">SHEGGAR <span className="text-orange-400">WHEELS</span></Link>
          </div>
          <div className="md:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Company customer support</p>
            <div className="mt-2 flex flex-col gap-1 text-sm md:items-end">
              <a className="transition hover:text-orange-300" href="mailto:owner@sheggarwheels.demo">owner@sheggarwheels.demo</a>
              <a className="transition hover:text-orange-300" href="tel:+251911000201">+251 911 000 201</a>
            </div>
          </div>
          <p className="border-t border-white/10 pt-5 text-xs text-slate-500 md:col-span-2">© {new Date().getFullYear()} Sheggar Wheels. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
