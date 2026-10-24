import Link from "next/link";

const benefits = [
  { icon: "verified", label: "Best Price Guarantee", color: "text-emerald-300" },
  { icon: "calendar", label: "Free Cancellation up to 24h", color: "text-sky-300" },
  { icon: "flight", label: "Contactless Terminal Pickup", color: "text-emerald-300" },
  { icon: "key", label: "Instant Keyless Access", color: "text-orange-300" },
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
      <section className="relative -mt-20 w-full overflow-hidden">
        <div
          className="relative flex min-h-[640px] w-full flex-col justify-between bg-cover bg-center lg:min-h-[720px]"
          style={{
            backgroundImage:
              "url('/images/hero-image.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />

          <header className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 pt-6 sm:px-8 md:px-12 lg:px-16">
            <Link href="/" className="text-lg font-bold tracking-[0.16em] text-white">
              SHEGGAR WHEELS
            </Link>
            <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/cars"
                className="hidden text-sm font-medium text-slate-100 transition hover:text-orange-300 sm:inline"
              >
                Browse cars
              </Link>
              <Link
                href="/owner/cars/new"
                className="hidden text-sm font-medium text-slate-100 transition hover:text-orange-300 md:inline"
              >
                List your car
              </Link>
              <Link
                href="/signin"
                className="rounded-full px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Sign up
              </Link>
            </nav>
          </header>

          <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col justify-center px-6 pt-36 pb-24 sm:px-8 md:px-12 lg:px-16 lg:pt-40 lg:pb-32">
            <div className="mb-6 flex self-start items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 shadow-lg backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 sm:text-sm">
                Private Fleet Concierge &amp; Airport VIP Network
              </span>
            </div>

            <h1 className="mb-6 max-w-4xl text-5xl leading-[1.05] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
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
    </main>
  );
}
