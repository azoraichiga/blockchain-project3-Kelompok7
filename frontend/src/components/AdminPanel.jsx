import { useState } from "react";

const isValidAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test(a);

export default function AdminPanel({ grantStatus, onGrant }) {
  const [addr, setAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const addrOk = isValidAddress(addr);
  const amountOk = Number(amount) > 0;
  const canSubmit = addrOk && amountOk && grantStatus !== "pending";

  const submit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onGrant(addr, amount);
    setAddr("");
    setAmount("");
    setTouched(false);
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4z"/></svg>
        <p className="text-sm font-medium text-violet-900">Panel dosen</p>
        <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">Admin</span>
      </div>
      <p className="mb-3 text-sm text-slate-600">
        Beri reward ke alamat mahasiswa. Hanya akun pemilik kontrak yang bisa melakukan ini.
      </p>

      <div className="flex flex-col gap-2.5">
        <div>
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            placeholder="Alamat mahasiswa (0x…)"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 outline-none focus:ring-2 focus:ring-violet-200"
          />
          {touched && !addrOk && (
            <p className="mt-1 text-xs text-red-600">Alamat tidak valid (harus 0x + 40 karakter heksa).</p>
          )}
        </div>
        <div>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Jumlah CRT"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-violet-200"
          />
          {touched && !amountOk && (
            <p className="mt-1 text-xs text-red-600">Jumlah harus angka positif.</p>
          )}
        </div>

        {grantStatus === "pending" ? (
          <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500 opacity-80">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Mengirim transaksi…
          </button>
        ) : (
          <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-300 bg-violet-100 py-2.5 text-sm font-medium text-violet-800 transition hover:bg-violet-200 active:scale-[0.99]">
            Beri reward
          </button>
        )}

        {grantStatus === "success" && (
          <p className="text-center text-xs text-emerald-600">Reward berhasil diberikan.</p>
        )}
      </div>
    </div>
  );
}
