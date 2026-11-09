export default function PublicLoading() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-24 animate-pulse">
      {/* Skeleton PageHero */}
      <div className="relative pt-32 pb-16 lg:pt-44 lg:pb-24 bg-slate-950 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col items-center text-center">
          {/* Badge Skeleton */}
          <div className="h-7 w-28 bg-white/10 rounded-full mb-4" />
          {/* Title Skeleton */}
          <div className="h-10 md:h-12 w-64 md:w-96 bg-white/15 rounded-2xl mb-4" />
          {/* Subtitle Skeleton */}
          <div className="h-5 w-72 md:w-[480px] bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Skeleton Content Grid / Container */}
      <div className="container mx-auto px-4 lg:px-8 mt-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="w-full h-44 bg-gray-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-800 rounded-md" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-gray-100 dark:bg-slate-800/60 rounded" />
                <div className="h-3.5 w-4/5 bg-gray-100 dark:bg-slate-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
