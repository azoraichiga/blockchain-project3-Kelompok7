export default function ClaimAction({
  hasClaimed,
  isWhitelisted,
  isActive,
  deadlinePassed,
  txStatus,
  error,
  onClaim,
}) {
  // Tentukan kenapa tombol claim tidak bisa ditekan, kalau memang tidak bisa.
  // Urutan pengecekan ini sengaja meniru urutan require() di claimReward()
  // pada smart contract, supaya pesan yang muncul konsisten dengan logika asli.
  let blockedReason = null;
  if (!isActive) blockedReason = "Program reward sedang dinonaktifkan dosen.";
  else if (deadlinePassed) blockedReason = "Batas waktu klaim sudah lewat.";
  else if (!isWhitelisted) blockedReason = "Kamu belum terdaftar untuk menerima reward.";

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/></svg>
          <span>{error}</span>
        </div>
      )}

      {txStatus === "success" && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-6"/></svg>
          <span>Reward berhasil diklaim. ETH dikirim ke dompet kamu.</span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm transition-colors duration-200">
        <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">Klaim reward kamu</h3>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Menandatangani transaksi akan mentransfer ETH ke alamat kamu. Butuh konfirmasi di MetaMask.
        </p>

        {txStatus === "pending" ? (
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 opacity-80"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400" />
            Menunggu konfirmasi…
          </button>
        ) : hasClaimed ? (
          <button
            disabled
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-3 text-sm font-medium text-slate-400 dark:text-slate-500"
          >
            Reward sudah diklaim
          </button>
        ) : blockedReason ? (
          <button
            disabled
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-3 text-sm font-medium text-slate-400 dark:text-slate-500"
          >
            {blockedReason}
          </button>
        ) : (
          <button
            onClick={onClaim}
            className="w-full rounded-lg bg-indigo-600 dark:bg-indigo-500 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-[0.99] shadow-sm hover:shadow dark:shadow-indigo-500/20"
          >
            Klaim sekarang
          </button>
        )}
      </div>
    </div>
  );
}
