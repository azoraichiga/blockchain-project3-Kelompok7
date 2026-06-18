export default function RewardHistory({ history = [] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <p className="text-sm font-medium text-slate-900">Riwayat transaksi</p>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          live
        </span>
      </div>
      {history.length === 0 ? (
        <p className="text-sm text-slate-400">Belum ada riwayat.</p>
      ) : (
        <table className="w-full border-collapse">
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-t border-slate-100 first:border-t-0">
                <td className="py-2 text-sm text-slate-700">
                  {h.type}
                  <span className="ml-1.5 text-xs text-slate-400">· {h.by}</span>
                </td>
                <td className="py-2 text-sm text-slate-500">+{h.amount} ETH</td>
                <td className="py-2 text-right text-sm text-slate-400">{h.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
