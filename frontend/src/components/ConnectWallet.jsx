import { shortAddress } from "../utils/helpers";

export default function ConnectWallet({ account, onConnect }) {
  if (!account) {
    return (
      <button
        onClick={onConnect}
        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 active:scale-[0.98]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
        Connect wallet
      </button>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span className="font-mono text-sm text-slate-700">{shortAddress(account)}</span>
    </div>
  );
}
