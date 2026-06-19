export default function RewardHistory({ history = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-4 shadow-sm transition-colors duration-200">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Riwayat transaksi</h3>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
          live
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">Belum ada riwayat.</p>
        ) : (
          history.map((h, i) => (
            <div key={i} className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 first:border-t-0 first:pt-0">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {h.type} <span className="font-normal text-slate-400 dark:text-slate-500">· {h.by}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  +{h.amount} ETH
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{h.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
