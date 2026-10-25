export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-tr from-slate-100 via-sky-50/50 to-slate-200 text-slate-900">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        <p className="text-xs font-mono tracking-widest uppercase text-slate-500">Loading secure route…</p>
      </div>
    </div>
  );
}
