import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container py-12 space-y-8 animate-pulse max-w-6xl mx-auto">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded-full" />
          <div className="h-8 w-64 bg-slate-300 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-lg" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-16 bg-slate-300 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content blocks skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-lg border border-slate-100" />
            ))}
          </div>
        </div>
        <div className="h-72 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-24 bg-slate-50 rounded-lg border" />
        </div>
      </div>
    </div>
  );
}
