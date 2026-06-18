export default function ClaimAction({ claimed, txStatus, error, onClaim }) {
  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/></svg>
          <span>{error}</span>
        </div>
      )}

      {txStatus === "success" && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-6"/></svg>
          <span>Reward berhasil diklaim. Saldo dikirim ke dompet kamu.</span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-2.5 text-sm font-medium text-slate-900">Klaim reward kamu</p>
        <p className="mb-3 text-sm text-slate-500">
          Menandatangani transaksi akan mentransfer reward ke alamat kamu. Butuh konfirmasi di MetaMask.
        </p>

        {txStatus === "pending" ? (
          <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500 opacity-80">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Transaksi pending…
          </button>
        ) : claimed ? (
          <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-400 opacity-70">
            Reward sudah diklaim
          </button>
        ) : (
          <button onClick={onClaim} className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 active:scale-[0.99]">
            Claim reward
          </button>
        )}
      </div>
    </div>
  );
}
