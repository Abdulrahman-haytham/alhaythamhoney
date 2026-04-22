import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5">
    <div className="h-56 md:h-64 bg-zinc-800" />
    <div className="p-6 space-y-4">
      <div className="h-6 bg-zinc-800 rounded w-3/4" />
      <div className="h-4 bg-zinc-800 rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800 rounded" />
        <div className="h-3 bg-zinc-800 rounded w-5/6" />
      </div>
      <div className="flex gap-3 pt-4">
        <div className="h-10 bg-zinc-800 rounded-xl flex-1" />
        <div className="h-10 bg-zinc-800 rounded-xl flex-1" />
      </div>
    </div>
  </div>
);

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-zinc-800 rounded"
        style={{ width: `${100 - (i * 15)}%` }}
      />
    ))}
  </div>
);

export const SkeletonHeading: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-zinc-800 rounded w-1/3 mx-auto" />
    <div className="h-4 bg-zinc-800 rounded w-2/3 mx-auto" />
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-zinc-950 py-16 px-4" role="status" aria-label="جاري تحميل الصفحة...">
    <div className="container mx-auto max-w-6xl">
      <SkeletonHeading />
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);
