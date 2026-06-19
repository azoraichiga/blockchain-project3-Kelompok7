import { shortAddress } from "../utils/helpers";

export default function ConnectWallet({ account, onConnect }) {
  const switchAccount = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      // The browser page might refresh or the hook will catch the new account
    } catch (e) {
      console.error("Gagal mengganti akun:", e);
    }
  };

  if (!account) {
    return (
      <button
        onClick={onConnect}
        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/20 active:scale-[0.98]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
        Connect wallet
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{shortAddress(account)}</span>
      </div>
      <button
        onClick={switchAccount}
        title="Ganti akun MetaMask"
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 transition"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
      </button>
    </div>
  );
}
