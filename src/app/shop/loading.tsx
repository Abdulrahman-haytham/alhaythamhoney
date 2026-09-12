/** هيكل تحميل عام يظهر أثناء جلب الصفحات على الخادم. */
export default function Loading() {
  return (
    <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6 bg-zinc-950" aria-busy="true">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="h-10 w-64 mx-auto rounded-xl bg-zinc-900 animate-pulse mb-4" />
          <div className="h-5 w-96 max-w-full mx-auto rounded-lg bg-zinc-900/70 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="h-64 bg-zinc-800/60 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-2/3 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="h-4 w-full rounded bg-zinc-800/70 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-zinc-800/70 animate-pulse" />
                <div className="h-11 w-full rounded-xl bg-zinc-800/60 animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">جارٍ التحميل…</span>
    </section>
  );
}