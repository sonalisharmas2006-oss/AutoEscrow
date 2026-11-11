export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black text-white">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        <p className="text-xs font-mono tracking-widest uppercase text-[#888888]">Loading secure route…</p>
      </div>
    </div>
  );
}
