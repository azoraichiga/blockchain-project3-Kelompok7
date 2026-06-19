export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  const tone = {
    info: "border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    success: "border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  };
  const dot = {
    info: "bg-indigo-500 dark:bg-indigo-400",
    success: "bg-emerald-500 dark:bg-emerald-400",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-xs flex-col gap-2 sm:w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-sm ${tone[t.kind] || tone.info}`}
          role="status"
        >
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[t.kind] || dot.info}`} />
          <p className="flex-1 text-sm">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Tutup notifikasi"
            className="text-slate-400 transition hover:text-slate-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
