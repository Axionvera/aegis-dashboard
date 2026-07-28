export default function AssetCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse" aria-hidden="true">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-20 bg-slate-100 rounded" />
      </div>
      <div className="h-4 w-48 bg-slate-100 rounded mb-4" />
      <div className="mb-4 space-y-2">
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-7 w-32 bg-slate-200 rounded" />
      </div>
      <div className="h-4 w-28 bg-slate-100 rounded mb-6" />
      <div className="h-10 w-full bg-slate-100 rounded-lg" />
    </div>
  );
}
