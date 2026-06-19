import React from "react";
import { useContract } from "./hooks/useContract";
import ConnectWallet from "./components/ConnectWallet";
import RewardCard from "./components/RewardCard";
import ClaimAction from "./components/ClaimAction";
import RewardHistory from "./components/RewardHistory";
import AdminPanel from "./components/AdminPanel";
import Toast from "./components/Toast";

export default function App() {
  const {
    account, isAdmin, wrongNetwork,
    rewardAmount, hasClaimed, isWhitelisted, isActive, claimDeadline, contractBalance,
    history,
    loadingRead, txStatus, grantStatus, fundStatus, error, toasts,
    connect, claim, grantReward, fundContract, dismissToast,
  } = useContract();

  const [isDark, setIsDark] = React.useState(() => {
    // Check local storage or system preference on load
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const deadlinePassed = claimDeadline > 0 && Date.now() / 1000 > claimDeadline;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8 transition-colors duration-200">
      <div className="mx-auto max-w-2xl">
        {/* Header + wallet */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 13l-2 8 6-3 6 3-2-8"/></svg>
            </div>
            <div>
              <p className="text-base font-medium text-slate-900 dark:text-white">Course Reward</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Sistem reward mahasiswa on-chain</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              title="Toggle dark mode"
            >
              {isDark ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <ConnectWallet account={account} onConnect={connect} />
          </div>
        </div>

        {/* Network warning */}
        {account && wrongNetwork && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
            Peringatan: MetaMask kamu sedang berada di Chain ID yang salah. Tolong ganti network.
          </div>
        )}

        {/* Konten utama */}
        {!account ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 py-12 text-center shadow-sm transition-colors duration-200">
            <svg className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
            <p className="mt-3 text-[15px] font-medium text-slate-900 dark:text-white">Hubungkan dompet untuk mulai</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Connect MetaMask untuk melihat dan klaim reward kamu.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <RewardCard
              loading={loadingRead}
              rewardAmount={rewardAmount}
              hasClaimed={hasClaimed}
              isWhitelisted={isWhitelisted}
              isActive={isActive}
              claimDeadline={claimDeadline}
            />
            {!loadingRead && (
              <>
                <ClaimAction
                  hasClaimed={hasClaimed}
                  isWhitelisted={isWhitelisted}
                  isActive={isActive}
                  deadlinePassed={deadlinePassed}
                  txStatus={txStatus}
                  error={error}
                  onClaim={claim}
                />
                {isAdmin && (
                  <AdminPanel
                    grantStatus={grantStatus}
                    fundStatus={fundStatus}
                    contractBalance={contractBalance}
                    onGrant={grantReward}
                    onFund={fundContract}
                  />
                )}
                <RewardHistory history={history} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Toast notifikasi real-time */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
