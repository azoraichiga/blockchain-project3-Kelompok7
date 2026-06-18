import { formatCRT } from "../utils/helpers";

function StatCard({ label, value, sub, valueClass = "" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-1 text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-medium text-slate-900 ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2.5 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function RewardCard({ loading, rewardAmount, claimed }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton />
        <Skeleton />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* READ #1 */}
      <StatCard label="Reward amount" value={formatCRT(rewardAmount)} sub="Course Reward Token" />
      {/* READ #2 */}
      <StatCard
        label="Status klaim"
        value={claimed ? "Sudah diklaim" : "Belum diklaim"}
        sub="Dibaca dari smart contract"
        valueClass={claimed ? "text-emerald-600" : "text-amber-600"}
      />
    </div>
  );
}
