function SkeletonBlock({ className }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export default function DataLoadingSkeleton({ variant = "workspace" }) {
  return (
    <div aria-busy="true" aria-label="Loading page data" className="w-full">
      <span className="sr-only" role="status">Loading page data…</span>
      {variant === "catalogue" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4" key={index}>
                <SkeletonBlock className="h-44 w-full" />
                <SkeletonBlock className="mt-5 h-5 w-2/3" />
                <SkeletonBlock className="mt-3 h-4 w-1/2" />
                <SkeletonBlock className="mt-6 h-10 w-full" />
              </div>
            ))}
        </div>
      ) : variant === "detail" ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-5">
            <SkeletonBlock className="h-72 w-full rounded-3xl" />
            <SkeletonBlock className="h-48 w-full rounded-2xl" />
            <SkeletonBlock className="h-64 w-full rounded-2xl" />
          </div>
          <SkeletonBlock className="h-72 w-full rounded-2xl" />
        </div>
      ) : variant === "form" ? (
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
          <SkeletonBlock className="hidden min-h-[36rem] rounded-none md:block" />
          <div className="space-y-5 p-6 sm:p-9">
            <SkeletonBlock className="h-8 w-2/3" />
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
      ) : variant === "checkout" ? (
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.8fr]">
          <div className="space-y-5">
            <SkeletonBlock className="h-36 w-full rounded-2xl" />
            <SkeletonBlock className="h-80 w-full rounded-2xl" />
          </div>
          <SkeletonBlock className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <SkeletonBlock className="h-32 rounded-2xl" key={index} />)}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <SkeletonBlock className="h-72 rounded-2xl" />
            <SkeletonBlock className="h-72 rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
