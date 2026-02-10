import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-slate-800" />
          <Skeleton className="h-4 w-64 bg-slate-800" />
        </div>
        <Skeleton className="h-10 w-36 bg-slate-800" />
      </div>

      {/* Search and filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 bg-slate-800" />
        <Skeleton className="h-10 w-full sm:w-40 bg-slate-800" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden">
        {/* Table header */}
        <div className="border-b border-slate-700 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32 bg-slate-700" />
            <Skeleton className="h-4 w-40 bg-slate-700" />
            <Skeleton className="h-4 w-24 bg-slate-700 hidden sm:block" />
            <Skeleton className="h-4 w-20 bg-slate-700 hidden md:block" />
            <Skeleton className="h-4 w-16 bg-slate-700 hidden md:block" />
          </div>
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`staff-loading-row-${i}`}
            className="border-b border-slate-700 last:border-b-0 p-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-slate-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36 bg-slate-700" />
                <Skeleton className="h-3 w-48 bg-slate-700" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-slate-700 hidden sm:block" />
              <Skeleton className="h-8 w-20 bg-slate-700 hidden md:block" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          <p className="text-sm text-slate-400">Loading staff members...</p>
        </div>
      </div>
    </div>
  );
}
