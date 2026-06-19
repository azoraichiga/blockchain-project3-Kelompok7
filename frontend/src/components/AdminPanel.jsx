import { useState } from "react";
import { formatETH } from "../utils/helpers";

const isValidAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test(a);

export default function AdminPanel({ grantStatus, fundStatus, contractBalance, onGrant, onFund }) {
  const [addr, setAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const [fundAmount, setFundAmount] = useState("");
  const [fundTouched, setFundTouched] = useState(false);

  const addrOk = isValidAddress(addr);
  const amountOk = Number(amount) > 0;
  const canSubmitGrant = addrOk && amountOk && grantStatus !== "pending";

  const fundOk = Number(fundAmount) > 0;
  const canSubmitFund = fundOk && fundStatus !== "pending";

  const submitGrant = () => {
    setTouched(true);
    if (!canSubmitGrant) return;
    onGrant(addr, amount);
    setAddr("");
    setAmount("");
    setTouched(false);
  };

  const submitFund = () => {
    setFundTouched(true);
    if (!canSubmitFund) return;
    onFund(fundAmount);
    setFundAmount("");
    setFundTouched(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-800 p-5 shadow-sm transition-colors duration-200">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Panel dosen</h2>
          <span className="rounded bg-indigo-50 dark:bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">Admin</span>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Saldo kontrak</span>
          <span className={`text-sm font-medium ${contractBalance > 0 ? "text-slate-900 dark:text-white" : "text-red-600"}`}>
            {formatETH(contractBalance)}
          </span>
        </div>
        {contractBalance <= 0 && (
          <p className="mb-4 text-xs text-red-600">
            Saldo kontrak kosong. Mahasiswa tidak akan bisa klaim sampai diisi dana.
          </p>
        )}

        <div className="mb-5 border-b border-slate-100 dark:border-slate-700/50 pb-5">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Isi dana kontrak</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="Jumlah ETH"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
            <button
              onClick={submitFund}
              disabled={fundStatus === "pending"}
              className="shrink-0 rounded-lg border border-indigo-200 dark:border-indigo-500/50 bg-white dark:bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 transition hover:bg-indigo-50 dark:hover:bg-indigo-500/20 disabled:opacity-50"
            >
              {fundStatus === "pending" ? "Mengirim…" : "Isi dana"}
            </button>
          </div>
          {fundTouched && !fundOk && (
            <p className="mt-2 text-xs text-red-600">Jumlah harus angka positif.</p>
          )}
          {fundStatus === "success" && (
            <p className="mt-2 text-xs text-emerald-600">Dana berhasil ditambahkan ke kontrak.</p>
          )}
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Beri reward ke mahasiswa</p>
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Mendaftarkan alamat sebagai penerima reward (whitelist) sekaligus menentukan jumlahnya.
          </p>
          <div className="flex flex-col gap-3">
            <input
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              placeholder="Alamat mahasiswa (0x…)"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
            <input
              type="number"
              min="0"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Jumlah ETH"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
            {touched && !amountOk && (
              <p className="mt-1 text-xs text-red-600">Jumlah harus angka positif.</p>
            )}
          </div>

          {grantStatus === "pending" ? (
            <button disabled className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 opacity-80">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400" />
              Mengirim transaksi…
            </button>
          ) : (
            <button onClick={submitGrant} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/30 active:scale-[0.99]">
              Beri reward
            </button>
          )}

          {grantStatus === "success" && (
            <p className="mt-2 text-center text-xs text-emerald-600">Reward berhasil diberikan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
